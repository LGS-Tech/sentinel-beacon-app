const {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../db/queries/users");
const { userToPublicApi } = require("../db/mappers");

const getAllUsers = async (req, res) => {
  try {
    const users = await listUsers(req.query);
    res.json(users.map(userToPublicApi));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const getUser = async (req, res) => {
  try {
    const found = await getUserById(req.params.id);
    if (!found) return res.status(404).json({ error: "User not found" });
    res.json(userToPublicApi(found));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

const createNewUser = async (req, res) => {
  try {
    const created = await createUser(req.body);
    res.status(201).json(userToPublicApi(created));
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create user" });
  }
};

const updateExistingUser = async (req, res) => {
  try {
    const updated = await updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json(userToPublicApi(updated));
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

const deleteExistingUser = async (req, res) => {
  try {
    const deleted = await deleteUser(req.params.id);
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.sendStatus(204);
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
