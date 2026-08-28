const {
  listCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  assignCase,
} = require("../db/queries/cases");

const getAllCases = async (req, res) => {
  try {
    const cases = await listCases(req.query);
    res.json(cases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cases" });
  }
};

const getCase = async (req, res) => {
  try {
    const found = await getCaseById(req.params.id);
    if (!found) return res.status(404).json({ error: "Case not found" });
    res.json(found);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch case" });
  }
};

const createNewCase = async (req, res) => {
  try {
    const createdByUserId =
      req.body.createdByUserId ?? req.user?.userId ?? null;
    const created = await createCase({
      ...req.body,
      createdByUserId,
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create case" });
  }
};

const updateExistingCase = async (req, res) => {
  try {
    const updated = await updateCase(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Case not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update case" });
  }
};

const deleteExistingCase = async (req, res) => {
  try {
    const deleted = await deleteCase(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Case not found" });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete case" });
  }
};

const assignCaseToUser = async (req, res) => {
  try {
    const { caseId, userId, departmentId } = req.body;
    const actorUserId = req.user?.userId ?? null;

    const assigned = await assignCase(caseId, {
      userId,
      departmentId,
      actorUserId,
    });
    if (!assigned) {
      return res.status(404).json({ error: "Case or user not found" });
    }
    res.json(assigned);
  } catch (err) {
    res.status(500).json({ error: "Failed to assign case" });
  }
};

module.exports = {
  getAllCases,
  getCase,
  createNewCase,
  updateExistingCase,
  deleteExistingCase,
  assignCaseToUser,
};
