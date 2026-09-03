const bcrypt = require("bcrypt");

const {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require("../db/queries/users");

// [READ ALL] GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const users = await listUsers(req.query);
    const safeUsers = users.map(({ password, ...rest }) => rest);
    res.json(safeUsers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const getUser = async (req, res) => {
  try {
    const found = await getUserById(req.params.id);
    if (!found) return res.status(404).json({ error: "User not found" });
    const { password, ...safeUser } = found;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

const createNewUser = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const created = await createUser({ ...req.body, password: hashedPassword });

    if (created && created.password) {
      delete created.password;
    }

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create user" });
  }
};

const updateExistingUser = async (req, res) => {
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
    res.status(500).json({ error: "Failed to update user" });
  }
};

// [DELETE] DELETE /api/users/:id
const deleteExistingUser = async (req, res) => {
  try {
    const deleted = await deleteUser(req.params.id);
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.sendStatus(204); // 204 means success with no content to return
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

module.exports = {
  getAllUsers,
  getUser,
  createNewUser,
  updateExistingUser,
  deleteExistingUser,
};
