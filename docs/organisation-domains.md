# Organisation separation by email domain

Each approved, exact corporate email domain maps to one organisation. Provisioned users of that domain share the organisation's data subject to the existing student/staff/maintainer/lead permissions. Different domains have distinct organisations. Subdomains are separate domains; common public email providers are rejected. The provider denylist is only a guardrail: operators must never approve a shared email service.

Public signup is disabled. Domain matching does not create an account or prove identity. An operator must verify company domain ownership and each user's identity outside this application before provisioning. The approval flag records that manual decision; it does not perform DNS or mailbox verification.

Login checks the password, active account, approved domain and matching active organisation. Every authenticated request reloads current membership and privileges. Client-supplied organisation IDs cannot choose ownership. Missing organisation scope fails closed instead of falling back to demo data. Cases, users, departments, attachments, events and floor plans retain their tenant boundaries. This is application-level isolation, not PostgreSQL row-level security or separate physical databases. Encryption configuration is unchanged.

## Review and rollout

This patch is based on main `4703eb794edf55a436721041f7a06da8dff777ee`. It has not been applied to production. Review this change through a pull request before rollout.

1. Review this branch through the normal PR process. If using the standalone patch instead, apply it in a clean checkout with `git apply --check organisation-domains.patch`, then `git apply organisation-domains.patch`.
2. In `backend/new`, run `npm ci` and `npm test`.
3. Back up production PostgreSQL and rehearse against a staging copy. Inventory existing organisation ownership before changing any memberships. Existing demo/shared data is NOT split automatically: email alone cannot establish who owns historical records. A reviewed data migration must move each related case, event, attachment, department, floor plan and account consistently, including any storage references.
4. For an existing current-schema database, apply `db/migrations/20261029-organisation-domains.sql` transactionally using your database administrator tooling. For a fresh local database, `npm run db:setup` applies the baseline and migration together. Rerunning setup skips legacy demo inserts after domain isolation has been installed. Do not run old seed/smoke scripts against production.
5. Verify ownership, bind each domain and provision accounts before switching application traffic. Users whose current organisation does not match an approved domain will be denied login. The CLI refuses binding the legacy `lgs-demo` organisation.
6. Deploy the backend and test two provisioned organisations on staging and production: each can log in and access its own data; foreign IDs, files and floor plans return no data; anonymous access and public signup are denied. Check the app's Sign in flow separately after the domain move.

## Operator commands

Use the backend's secured `DATABASE_URL` environment configuration. No database credentials are included in this patch.

```bash
cd backend/new
npm run org:provision -- bind-domain --domain company.example --slug company --name "Company" --approved-by "Operator name" --ownership-confirmed
read -r -s -p 'Temporary account password: ' CREATE_USER_PASSWORD
export CREATE_USER_PASSWORD
npm run org:provision -- create-user --email person@company.example --username person --name "Person" --role lead
unset CREATE_USER_PASSWORD
```

Use a unique password of at least 12 characters and deliver credentials securely. Supported roles: student, staff (default), maintainer, lead. Provision only verified users. Existing authenticated user-management permissions still apply, and user creation/email changes must stay within the caller's approved domain. Domain remapping and merging are deliberately not exposed by the CLI.

## Validation

55 backend tests pass. The added suite starts real Express routes against an isolated PostgreSQL WASM engine (PGlite), exercises schema/migration twice, and checks same-domain sharing, cross-domain denial, tenant override attempts, invalid tokens, disabled memberships, public signup denial and missing-scope failures. The existing role and file-controller tests also pass. Tests do not access production or upload real R2 objects; denied content requests are rejected before storage access.

Legacy demo-based smoke commands require provisioned fixtures and explicit organisation IDs under this policy. Use `npm test` for the isolated regression suite. Rollback requires a reviewed code/database plan: restoring the old permissive authentication would remove these protections.
