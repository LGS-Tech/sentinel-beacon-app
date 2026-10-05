/**
 * Role rules for cases and user creation, kept in one place.
 *
 * Roles (users.user_type): student, staff, maintainer, lead.
 * - student: sees cases they created or are assigned to; modifies only cases they created
 * - staff / maintainer / lead: full list/view/create/update/close
 * - delete: lead only; analytics and assign: maintainer + lead
 *
 * caseScope(user) is the single place where list filters derive from the
 * session — add an organisation filter there when tenants exist.
 */

const ROLES = Object.freeze({
  STUDENT: "student",
  STAFF: "staff",
  MAINTAINER: "maintainer",
  LEAD: "lead",
});

const CASE_DELETE_ROLES = [ROLES.LEAD];
const CASE_ANALYTICS_ROLES = [ROLES.MAINTAINER, ROLES.LEAD];
const CASE_ASSIGN_ROLES = [ROLES.MAINTAINER, ROLES.LEAD];

// Roles that see and modify every case. Anything else (students, unknown
// user types) is limited to its own cases — fail closed.
const FULL_CASE_ACCESS_ROLES = [ROLES.STAFF, ROLES.MAINTAINER, ROLES.LEAD];

function hasFullCaseAccess(user) {
  return FULL_CASE_ACCESS_ROLES.includes(user?.userType);
}

/**
 * Filters every case listing must be ANDed with. Spread these after any
 * client-supplied query filters so they can't be overridden.
 */
function caseScope(user) {
  if (hasFullCaseAccess(user)) return {};
  return { visibleToUserId: Number(user?.userId) };
}

function canViewCase(user, found) {
  if (!found) return false;
  if (hasFullCaseAccess(user)) return true;
  const userId = Number(user?.userId);
  return found.createdByUserId === userId || found.assignedUserId === userId;
}

function canModifyCase(user, found) {
  if (!found) return false;
  if (hasFullCaseAccess(user)) return true;
  return found.createdByUserId === Number(user?.userId);
}

module.exports = {
  ROLES,
  CASE_DELETE_ROLES,
  CASE_ANALYTICS_ROLES,
  CASE_ASSIGN_ROLES,
  caseScope,
  canViewCase,
  canModifyCase,
};
