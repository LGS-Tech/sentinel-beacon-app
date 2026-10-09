const bcrypt = require("bcrypt");

const {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require("../db/queries/users");
const { canCreateUser } = require("../utils/casePolicy");
const { omitClientOrganisation, requireRequestOrganization } = require("../db/orgScope");

// [READ ALL] GET /api/users
const getAllUsers = async (req, res, next) => {
  try {
    const organizationId = requireRequestOrganization(req, res);
    if (organizationId == null) return;
    const users = await listUsers({
      ...omitClientOrganisation(req.query),
      organizationId,
    });
    const safeUsers = users.map(({ password, ...rest }) => rest);
    res.json(safeUsers);
  } catch (err) {
    return next(err);
  }
};

const getUser = async (req, res, next) => {
  try {
    const organizationId = requireRequestOrganization(req, res);
    if (organizationId == null) return;
    const found = await getUserById(req.params.id, organizationId);
    if (!found) return res.status(404).json({ error: "User not found" });
    const { password, ...safeUser } = found;
    res.json(safeUser);
  } catch (err) {
    return next(err);
  }
};

const createNewUser = async (req, res, next) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({
      error: "username, password, and email are required",
    });
  }

  if (!canCreateUser(req.user, req.body)) {
    return res.status(403).json({
      error: "Forbidden: only a lead can create leads, maintainers or authorisation 1",
    });
  }

  try {
    const organizationId = requireRequestOrganization(req, res);
    if (organizationId == null) return;
    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await createUser(
      { ...omitClientOrganisation(req.body), password: hashedPassword },
      organizationId
    );

    if (created && created.password) {
      delete created.password;
    }

    res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
};

// Role/status fields: only a lead may change them, and never on their own record.
const PRIVILEGED_USER_FIELDS = [
  "userType",
  "user_type",
  "authorisation",
  "isActive",
  "is_active",
];

const updateExistingUser = async (req, res, next) => {
  try {
    const organizationId = requireRequestOrganization(req, res);
    if (organizationId == null) return;
    const body = omitClientOrganisation(req.body);

    const isLead = req.user?.userType === "lead";
    const isSelf = Number(req.user?.userId) === Number(req.params.id);
    if (!isLead || isSelf) {
      for (const field of PRIVILEGED_USER_FIELDS) {
        delete body[field];
      }
    }

    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }

    const updated = await updateUser(req.params.id, body, organizationId);
    if (!updated) return res.status(404).json({ error: "User not found" });

    if (updated.password) {
      delete updated.password;
    }

    res.json(updated);
  } catch (err) {
    return next(err);
  }
};

// [DELETE] DELETE /api/users/:id
const deleteExistingUser = async (req, res, next) => {
  try {
    const organizationId = requireRequestOrganization(req, res);
    if (organizationId == null) return;
    const deleted = await deleteUser(req.params.id, organizationId);
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.sendStatus(204); // 204 means success with no content to return
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAllUsers,
  getUser,
  createNewUser,
  updateExistingUser,
  deleteExistingUser,
};
