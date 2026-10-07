const {
  listCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  assignCase,
  analyticsSummary,
} = require("../db/queries/cases");
const {
  caseScope,
  canViewCase,
  canModifyCase,
  canAssign,
} = require("../utils/casePolicy");

const getAllCases = async (req, res, next) => {
  try {
    const cases = await listCases({ ...req.query, ...caseScope(req.user) });
    res.json(cases);
  } catch (err) {
    return next(err);
  }
};

const getCase = async (req, res, next) => {
  try {
    const found = await getCaseById(req.params.id);
    if (!canViewCase(req.user, found)) {
      return res.status(404).json({ error: "Case not found" });
    }
    res.json(found);
  } catch (err) {
    return next(err);
  }
};

// Who created/closed a case comes from the session, never from the request body.
const ACTOR_FIELDS = [
  "createdByUserId",
  "created_by_user_id",
  "closedByUserId",
  "closed_by_user_id",
];

function withoutActorFields(body) {
  const copy = { ...body };
  for (const field of ACTOR_FIELDS) {
    delete copy[field];
  }
  return copy;
}

// Only roles that may assign cases can set the assignee (user or department);
// for others it is dropped.
const ASSIGNEE_FIELDS = [
  "assignedUserId",
  "assigned_user_id",
  "assignedDepartmentId",
  "assigned_department_id",
];

function withoutAssigneeUnlessAllowed(user, body) {
  if (canAssign(user)) return body;
  const copy = { ...body };
  for (const field of ASSIGNEE_FIELDS) {
    delete copy[field];
  }
  return copy;
}

const CLOSED_STATUSES = ["CLOSED", "RESOLVED"];

const createNewCase = async (req, res, next) => {
  try {
    const created = await createCase({
      ...withoutAssigneeUnlessAllowed(req.user, withoutActorFields(req.body)),
      status: "ACTIVE",
      createdByUserId: req.user.userId,
    });
    res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
};

const updateExistingCase = async (req, res, next) => {
  try {
    const existing = await getCaseById(req.params.id);
    if (!canViewCase(req.user, existing)) {
      return res.status(404).json({ error: "Case not found" });
    }
    if (!canModifyCase(req.user, existing)) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }

    const changes = withoutAssigneeUnlessAllowed(
      req.user,
      withoutActorFields(req.body)
    );

    // The server owns closed_at / closed_by_user_id; they follow the status.
    delete changes.closedAt;
    delete changes.closed_at;

    if (changes.status !== undefined) {
      const wasClosed = CLOSED_STATUSES.includes(existing.status);
      const willBeClosed = CLOSED_STATUSES.includes(changes.status);

      if (willBeClosed && !wasClosed) {
        changes.closedAt = Date.now();
        changes.closedByUserId = req.user.userId;
      } else if (wasClosed && !willBeClosed) {
        changes.closedAt = null;
        changes.closedByUserId = null;
      }
    }

    const updated = await updateCase(req.params.id, changes);
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