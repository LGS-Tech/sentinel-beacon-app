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
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// [READ ONE] GET /api/users/:id
const getUser = async (req, res) => {
  try {
    const found = await getUserById(req.params.id);
    if (!found) return res.status(404).json({ error: "User not found" });
    res.json(found);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// [CREATE] POST /api/users
const createNewUser = async (req, res) => {
  try {
    const created = await createUser(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create user" });
  }
};

// [UPDATE] PUT /api/users/:id
const updateExistingUser = async (req, res) => {
  try {
    const updated = await updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "User not found" });
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
