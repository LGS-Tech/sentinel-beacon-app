const { query } = require("../pool");
const { userToApi, nowMs, pick } = require("../mappers");

const USER_SELECT = `
  SELECT
    u.id,
    u.username,
    u.password,
    u.email,
    u.name,
    u.phone,
    u.role,
    u.authorisation,
    u.college_id,
    u.department_id,
    d.name AS department_name,
    u.year_semester,
    u.user_type,
    u.is_active,
    u.last_login_at,
    u.created_at,
    u.updated_at
  FROM users u
  LEFT JOIN departments d ON d.id = u.department_id
`;

async function listUsers({ userType, departmentId, activeOnly = true } = {}) {
  const clauses = [];
  const params = [];

  if (activeOnly) {
    clauses.push("u.is_active = TRUE");
  }
  if (userType) {
    params.push(userType);
    clauses.push(`u.user_type = $${params.length}`);
  }
  if (departmentId != null) {
    params.push(departmentId);
    clauses.push(`u.department_id = $${params.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const result = await query(
    `${USER_SELECT} ${where} ORDER BY u.id`,
    params
  );
  return result.rows.map(userToApi);
}

async function getUserById(id) {
  const result = await query(`${USER_SELECT} WHERE u.id = $1`, [id]);
  return userToApi(result.rows[0]);
}

async function getUserByEmail(email) {
  const result = await query(
    `${USER_SELECT} WHERE LOWER(u.email) = LOWER($1) LIMIT 1`,
    [email]
  );
  return userToApi(result.rows[0]);
}

async function getUserByUsername(username) {
  const result = await query(
    `${USER_SELECT} WHERE LOWER(u.username) = LOWER($1) LIMIT 1`,
    [username]
  );
  return userToApi(result.rows[0]);
}

function buildUserFields(body) {
  const phone = pick(body, "phone", "phone") ?? body["phone number"];
  return {
    username: pick(body, "username", "username"),
    password: pick(body, "password", "password"),
    email: pick(body, "email", "email"),
    name: pick(body, "name", "name"),
    phone,
    role: pick(body, "role", "role"),
    authorisation: pick(body, "authorisation", "authorisation"),
    college_id: pick(body, "collegeId", "college_id"),
    department_id: pick(body, "departmentId", "department_id"),
    year_semester: pick(body, "yearSemester", "year_semester"),
    user_type: pick(body, "userType", "user_type"),
    is_active: pick(body, "isActive", "is_active"),
  };
}

async function createUser(body) {
  const f = buildUserFields(body);
  if (!f.username || !f.password || !f.email) {
    throw new Error("username, password, and email are required");
  }

  const result = await query(
    `INSERT INTO users (
       username, password, email, name, phone, role, authorisation,
       college_id, department_id, year_semester, user_type, is_active
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING id`,
    [
      f.username,
      f.password,
      f.email,
      f.name ?? null,
      f.phone ?? null,
      f.role ?? null,
      f.authorisation ?? 2,
      f.college_id ?? null,
      f.department_id ?? null,
      f.year_semester ?? null,
      f.user_type ?? "staff",
      f.is_active !== false,
    ]
  );
  return getUserById(result.rows[0].id);
}

async function updateUser(id, body) {
  const f = buildUserFields(body);
  const sets = ["updated_at = NOW()"];
  const params = [];

  const columns = [
    ["username", f.username],
    ["password", f.password],
    ["email", f.email],
    ["name", f.name],
    ["phone", f.phone],
    ["role", f.role],
    ["authorisation", f.authorisation],
    ["college_id", f.college_id],
    ["department_id", f.department_id],
    ["year_semester", f.year_semester],
    ["user_type", f.user_type],
    ["is_active", f.is_active],
  ];

  for (const [col, value] of columns) {
    if (value !== undefined) {
      params.push(value);
      sets.push(`${col} = $${params.length}`);
    }
  }

  params.push(id);
  const result = await query(
    `UPDATE users SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING id`,
    params
  );
  if (!result.rowCount) return null;
  return getUserById(id);
}

async function deleteUser(id) {
  const result = await query(`DELETE FROM users WHERE id = $1`, [id]);
  return result.rowCount > 0;
}

async function recordLogin(id) {
  await query(
    `UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1`,
    [id]
  );
  return getUserById(id);
}

async function listAssignableUsers() {
  return listUsers({ userType: "maintainer" });
}

module.exports = {
  listUsers,
  getUserById,
  getUserByEmail,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser,
  recordLogin,
  listAssignableUsers,
};
