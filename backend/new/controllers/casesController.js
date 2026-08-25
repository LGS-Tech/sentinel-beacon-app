const Case = require("../models/Case");

const getAllCases = async (req, res) => {
  try {
    const cases = await Case.find();
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cases" });
  }
};

const getCaseById = async (req, res) => {
  try {
    const found = await Case.findById(req.params.id);
    if (!found) return res.status(404).json({ error: "Case not found" });
    res.json(found);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch case" });
  }
};

const createCase = async (req, res) => {
  try {
    const now = Date.now();
    const created = await Case.create({
      ...req.body,
      createdAt: now,
      lastUpdatedAt: now,
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: "Failed to create case" });
  }
};

const updateCase = async (req, res) => {
  try {
    const updated = await Case.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdatedAt: Date.now() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Case not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update case" });
  }
};

const deleteCase = async (req, res) => {
  try {
    const deleted = await Case.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Case not found" });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete case" });
  }
};

module.exports = {
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
};