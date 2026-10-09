const test = require("node:test");
const assert = require("node:assert/strict");
const {
  caseScope,
  canViewCase,
  canModifyCase,
  canAssign,
  canCreateUser,
  CASE_DELETE_ROLES,
  CASE_ANALYTICS_ROLES,
} = require("../utils/casePolicy");

const ownCase = { createdByUserId: 7, assignedUserId: null };
const assignedCase = { createdByUserId: 8, assignedUserId: 7 };
const otherCase = { createdByUserId: 8, assignedUserId: 9 };

test("students are scoped to their own or assigned cases", () => {
  const student = { userId: 7, userType: "student" };
  assert.deepEqual(caseScope(student), { visibleToUserId: 7 });
  assert.equal(canViewCase(student, ownCase), true);
  assert.equal(canViewCase(student, assignedCase), true);
  assert.equal(canViewCase(student, otherCase), false);
  assert.equal(canModifyCase(student, ownCase), true);
  assert.equal(canModifyCase(student, assignedCase), false);
  assert.equal(canModifyCase(student, otherCase), false);
});

test("case privileges follow the role policy", () => {
  for (const userType of ["staff", "maintainer", "lead"]) {
    const user = { userId: 7, userType };
    assert.deepEqual(caseScope(user), {});
    assert.equal(canViewCase(user, otherCase), true);
    assert.equal(canModifyCase(user, otherCase), true);
  }
  assert.equal(canAssign({ userType: "staff" }), false);
  assert.equal(canAssign({ userType: "maintainer" }), true);
  assert.equal(canAssign({ userType: "lead" }), true);
  assert.deepEqual(CASE_DELETE_ROLES, ["lead"]);
  assert.deepEqual(CASE_ANALYTICS_ROLES, ["maintainer", "lead"]);
});

test("non-leads cannot create privileged users", () => {
  const maintainer = { userType: "maintainer" };
  assert.equal(canCreateUser(maintainer, { userType: "lead" }), false);
  assert.equal(canCreateUser(maintainer, { user_type: "maintainer" }), false);
  assert.equal(canCreateUser(maintainer, { authorisation: 1 }), false);
  assert.equal(canCreateUser(maintainer, { userType: "staff", authorisation: 2 }), true);
  assert.equal(canCreateUser({ userType: "lead" }, { userType: "lead" }), true);
});
