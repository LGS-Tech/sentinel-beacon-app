const bcrypt = require("bcrypt");

const {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require("../db/queries/users");

// [READ ALL] GET /api/users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await listUsers(req.query);
    const safeUsers = users.map(({ password, ...rest }) => rest);
    res.json(safeUsers);
  } catch (err) {
    return next(err);
  }
};

const getUser = async (req, res, next) => {
  try {
    const found = await getUserById(req.params.id);
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

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await createUser({ ...req.body, password: hashedPassword });

    if (created && created.password) {
      delete created.password;
    }

    res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
};

const updateExistingUser = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }

    const updated = await updateUser(req.params.id, body);
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
    const deleted = await deleteUser(req.params.id);
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
