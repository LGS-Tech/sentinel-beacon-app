const {
  listCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  assignCase,
  analyticsSummary,
} = require("../db/queries/cases");

const getAllCases = async (req, res, next) => {
  try {
    const cases = await listCases(req.query);
    res.json(cases);
  } catch (err) {
    return next(err);
  }
};

const getCase = async (req, res, next) => {
  try {
    const found = await getCaseById(req.params.id);
    if (!found) return res.status(404).json({ error: "Case not found" });
    res.json(found);
  } catch (err) {
    return next(err);
  }
};

const createNewCase = async (req, res, next) => {
  try {
    const created = await createCase(req.body);
    res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
};

const updateExistingCase = async (req, res, next) => {
  try {
    const updated = await updateCase(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Case not found" });
    res.json(updated);
  } catch (err) {
    return next(err);
  }
};

const deleteExistingCase = async (req, res, next) => {
  try {
    const deleted = await deleteCase(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Case not found" });
    res.sendStatus(204);
  } catch (err) {
    return next(err);
  }
};

const assignCaseToUser = async (req, res, next) => {
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
    return next(err);
  }
}
const getAnalyticsSummary = async (req, res, next) => {
  try {
    const summary = await analyticsSummary();
    res.json(summary);
  } catch (err) {
    return next(err);
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