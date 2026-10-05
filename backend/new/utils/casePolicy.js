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

module.exports = {
  ROLES,
  CASE_DELETE_ROLES,
  CASE_ANALYTICS_ROLES,
  CASE_ASSIGN_ROLES,
};
