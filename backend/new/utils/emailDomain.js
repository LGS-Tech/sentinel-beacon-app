// A domain is a provisioning hint, never proof of identity or a tenant supplied by HTTP.
const PUBLIC_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'hotmail.co.uk',
  'live.com', 'live.co.uk', 'msn.com', 'yahoo.com', 'yahoo.co.uk', 'ymail.com',
  'icloud.com', 'me.com', 'mac.com', 'aol.com', 'proton.me', 'protonmail.com',
  'mail.com', 'gmx.com', 'gmx.net', 'yandex.com', 'zoho.com',
]);

function normalizeDomain(value) {
  if (typeof value !== 'string') throw new Error('A valid company domain is required');
  const domain = value.trim().toLowerCase();
  if (domain.length > 253 || !domain.includes('.') ||
      !domain.split('.').every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) {
    throw new Error('A valid ASCII company domain is required (no URL, wildcard or trailing dot)');
  }
  if (PUBLIC_DOMAINS.has(domain)) throw new Error('Shared email providers cannot identify an organisation');
  return domain;
}

function domainFromEmail(email) {
  if (typeof email !== 'string') throw new Error('A valid company email is required');
  const value = email.trim();
  const parts = value.split('@');
  if (value.length > 254 || parts.length !== 2 || parts[0].length > 64 ||
      !/^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/.test(parts[0])) {
    throw new Error('A valid company email is required');
  }
  return normalizeDomain(parts[1]);
}

module.exports = { normalizeDomain, domainFromEmail };
