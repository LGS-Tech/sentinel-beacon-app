const {
  listCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  assignCase,
  analyticsSummary,
} = require("../db/queries/cases");

const getAllCases = async (req, res) => {
  try {
    const cases = await listCases(req.query);
    res.json(cases);
  } catch (err) 
  {console.error(err);
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
    const created = await createCase(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: "Failed to create case" });
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
    
    const actorUserId = req.user?.id || req.user?.userId;

    const assigned = await assignCase(caseId, { 
      userId, 
      departmentId, 
      actorUserId 
    });
    if (!assigned) return res.status(404).json({ error: "Case or User not found" });
    res.json(assigned);
  } catch (err) {
    res.status(500).json({ error: "Failed to assign case" });
  }
}
const getAnalyticsSummary = async (req, res) => {
  try {
    const summary = await analyticsSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analytics summary" });
  }
}

module.exports = {
  getAllCases,
  getCase,
  createNewCase,
  updateExistingCase,
  deleteExistingCase,
  assignCaseToUser,
  getAnalyticsSummary,
};