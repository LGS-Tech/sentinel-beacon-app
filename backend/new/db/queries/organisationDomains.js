const { query } = require('../pool');
const { domainFromEmail } = require('../../utils/emailDomain');

function accessDenied() {
  const error = new Error('A provisioned account in an approved organisation is required');
  error.statusCode = 403;
  return error;
}

async function organisationForEmail(email) {
  let domain;
  try { domain = domainFromEmail(email); } catch { throw accessDenied(); }
  const result = await query(
    `SELECT o.id FROM organisation_domains d
     JOIN organisations o ON o.id = d.organization_id
     WHERE d.domain = $1 AND d.is_active = TRUE AND o.is_active = TRUE`, [domain]);
  if (!result.rows[0]) throw accessDenied();
  return result.rows[0].id;
}

async function requireEmailOrganisation(email, organizationId) {
  const resolved = await organisationForEmail(email);
  if (Number(organizationId) !== Number(resolved)) throw accessDenied();
  return resolved;
}

module.exports = { organisationForEmail, requireEmailOrganisation, accessDenied };
