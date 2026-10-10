const { test, afterEach } = require("node:test");
const assert = require("node:assert/strict");

// Stub the controller before the router loads it, so no database is needed.
const controllerPath = require.resolve("../controllers/authController");
let signupCalls = 0;

require.cache[controllerPath] = {
  id: controllerPath,
  filename: controllerPath,
  loaded: true,
  exports: {
    signup: (req, res) => {
      signupCalls += 1;
      res.status(201).json({ message: "stub signup" });
    },
    login: (req, res) => res.status(200).json({}),
  },
};

const authRoutes = require("../routes/authRoutes");

const originalFlag = process.env.ALLOW_PUBLIC_SIGNUP;

afterEach(() => {
  signupCalls = 0;
  if (originalFlag === undefined) {
    delete process.env.ALLOW_PUBLIC_SIGNUP;
  } else {
    process.env.ALLOW_PUBLIC_SIGNUP = originalFlag;
  }
});

function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

// Runs the handlers registered for POST /signup in order, like Express does.
function postSignup() {
  const layer = authRoutes.stack.find(
    (entry) => entry.route?.path === "/signup" && entry.route.methods.post
  );
  assert.ok(layer, "POST /signup route is registered");

  const handlers = layer.route.stack.map((entry) => entry.handle);
  const res = mockRes();
  const req = { body: {} };

  let index = 0;
  const next = (err) => {
    assert.equal(err, undefined);
    const handler = handlers[index++];
    if (handler) handler(req, res, next);
  };
  next();
  return res;
}

const DISABLED_BODY = {
  error: "Self-registration is disabled. Contact your administrator.",
};

test("POST /auth/signup is 403 when ALLOW_PUBLIC_SIGNUP is unset", () => {
  delete process.env.ALLOW_PUBLIC_SIGNUP;
  const res = postSignup();
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, DISABLED_BODY);
  assert.equal(signupCalls, 0);
});

test('POST /auth/signup is 403 when ALLOW_PUBLIC_SIGNUP is "false"', () => {
  process.env.ALLOW_PUBLIC_SIGNUP = "false";
  const res = postSignup();
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, DISABLED_BODY);
  assert.equal(signupCalls, 0);
});

for (const value of ["TRUE", "1", "yes", " true", ""]) {
  test(`POST /auth/signup is 403 when ALLOW_PUBLIC_SIGNUP is ${JSON.stringify(value)}`, () => {
    process.env.ALLOW_PUBLIC_SIGNUP = value;
    const res = postSignup();
    assert.equal(res.statusCode, 403);
    assert.equal(signupCalls, 0);
  });
}

test('POST /auth/signup reaches the controller when ALLOW_PUBLIC_SIGNUP is "true"', () => {
  process.env.ALLOW_PUBLIC_SIGNUP = "true";
  const res = postSignup();
  assert.equal(res.statusCode, 201);
  assert.equal(signupCalls, 1);
});
