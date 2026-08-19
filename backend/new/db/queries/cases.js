const { query } = require("../pool");
const { caseToApi, eventToApi, nowMs, pick } = require("../mappers");

const CASE_SELECT = `
  SELECT
    c.id,
    c.title,
    c.created_at,
    c.last_updated_at,
    c.status,
    c.location_x,
    c.location_y,
    c.location_label,
    c.feed,
    c.category,
    c.description,
    c.chat,
    c.priority,
    c.assigned_department_id,
    d.name AS assigned_department_name,
    c.assigned_user_id,
    au.name AS assigned_user_name,
    c.created_by_user_id,
    cu.name AS created_by_name,
    c.closed_by_user_id,
    c.closed_at,
    c.estimated_cost,
    c.police_contacted,
    c.fire_contacted,
    c.ambulance_contacted,
    c.maintenance_contacted
  FROM cases c
  LEFT JOIN departments d ON d.id = c.assigned_department_id
  LEFT JOIN users au ON au.id = c.assigned_user_id
  LEFT JOIN users cu ON cu.id = c.created_by_user_id
`;

function categoryFromTitle(title) {
  if (!title || typeof title !== "string") return null;
  const base = title.replace(/\s+Case$/i, "").trim();
  const allowed = [
    "Fire",
    "Intruder",
    "Injury",
    "Maintenance",
    "Missing",
    "Facilities",
    "IT Support",
    "Engineering",
  ];
  return allowed.includes(base) ? base : null;
}

function formatFeedLine(message) {
  return `[${new Date().toLocaleTimeString()}] ${message}`;
}

async function listCases(filters = {}) {
  const clauses = [];
  const params = [];
  const {
    status,
    category,
    assignedUserId,
    assignedDepartmentId,
    createdByUserId,
    openOnly,
  } = filters;

  if (openOnly) {
    clauses.push(`c.status IN ('ACTIVE', 'IN_PROGRESS')`);
  } else if (status) {
    params.push(status);
    clauses.push(`c.status = $${params.length}`);
  }
  if (category) {
    params.push(category);
    clauses.push(`c.category = $${params.length}`);
  }
  if (assignedUserId != null) {
    params.push(assignedUserId);
    clauses.push(`c.assigned_user_id = $${params.length}`);
  }
  if (assignedDepartmentId != null) {
    params.push(assignedDepartmentId);
    clauses.push(`c.assigned_department_id = $${params.length}`);
  }
  if (createdByUserId != null) {
    params.push(createdByUserId);
    clauses.push(`c.created_by_user_id = $${params.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const result = await query(
    `${CASE_SELECT} ${where} ORDER BY c.created_at DESC`,
    params
  );
  return result.rows.map(caseToApi);
}

async function getCaseById(id) {
  const result = await query(`${CASE_SELECT} WHERE c.id = $1`, [id]);
  return caseToApi(result.rows[0]);
}

function buildCaseFields(body) {
  const title = pick(body, "title", "title");
  const categoryExplicit = pick(body, "category", "category");
  const category =
    categoryExplicit !== undefined
      ? categoryExplicit
      : title !== undefined
        ? categoryFromTitle(title) || undefined
        : undefined;

  return {
    title,
    created_at: pick(body, "createdAt", "created_at"),
    last_updated_at: pick(body, "lastUpdatedAt", "last_updated_at"),
    status: pick(body, "status", "status"),
    location_x: pick(body, "locationX", "location_x"),
    location_y: pick(body, "locationY", "location_y"),
    location_label: pick(body, "locationLabel", "location_label"),
    feed: pick(body, "feed", "feed"),
    category,
    description: pick(body, "description", "description"),
    chat: pick(body, "chat", "chat"),
    priority: pick(body, "priority", "priority"),
    assigned_department_id: pick(body, "assignedDepartmentId", "assigned_department_id"),
    assigned_user_id: pick(body, "assignedUserId", "assigned_user_id"),
    created_by_user_id: pick(body, "createdByUserId", "created_by_user_id"),
    closed_by_user_id: pick(body, "closedByUserId", "closed_by_user_id"),
    closed_at: pick(body, "closedAt", "closed_at"),
    estimated_cost: pick(body, "estimatedCost", "estimated_cost"),
    police_contacted: pick(body, "policeContacted", "police_contacted"),
    fire_contacted: pick(body, "fireContacted", "fire_contacted"),
    ambulance_contacted: pick(body, "ambulanceContacted", "ambulance_contacted"),
    maintenance_contacted: pick(
      body,
      "maintenanceContacted",
      "maintenance_contacted"
    ),
  };
}

async function createCase(body) {
  const f = buildCaseFields(body);
  const createdAt = f.created_at ?? nowMs();
  const lastUpdated = f.last_updated_at ?? createdAt;

  const result = await query(
    `INSERT INTO cases (
       title, created_at, last_updated_at, status,
       location_x, location_y, location_label, feed,
       category, description, chat, priority,
       assigned_department_id, assigned_user_id, created_by_user_id,
       estimated_cost, police_contacted, fire_contacted,
       ambulance_contacted, maintenance_contacted
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
     )
     RETURNING id`,
    [
      f.title ?? null,
      createdAt,
      lastUpdated,
      f.status ?? "ACTIVE",
      f.location_x ?? null,
      f.location_y ?? null,
      f.location_label ?? null,
      f.feed ?? "",
      f.category ?? "Maintenance",
      f.description ?? null,
      f.chat ?? "",
      f.priority ?? "NORMAL",
      f.assigned_department_id ?? null,
      f.assigned_user_id ?? null,
      f.created_by_user_id ?? null,
      f.estimated_cost ?? null,
      Boolean(f.police_contacted),
      Boolean(f.fire_contacted),
      Boolean(f.ambulance_contacted),
      Boolean(f.maintenance_contacted),
    ]
  );

  const created = await getCaseById(result.rows[0].id);
  await addCaseEvent(created.id, {
    eventType: "created",
    message: `Case opened${f.category ? ` (${f.category})` : ""}`,
    userId: f.created_by_user_id ?? null,
  });
  return getCaseById(created.id);
}

async function updateCase(id, body) {
  const f = buildCaseFields(body);
  const sets = ["last_updated_at = $1"];
  const params = [nowMs()];

  const columns = [
    ["title", f.title],
    ["status", f.status],
    ["location_x", f.location_x],
    ["location_y", f.location_y],
    ["location_label", f.location_label],
    ["feed", f.feed],
    ["category", f.category],
    ["description", f.description],
    ["chat", f.chat],
    ["priority", f.priority],
    ["assigned_department_id", f.assigned_department_id],
    ["assigned_user_id", f.assigned_user_id],
    ["created_by_user_id", f.created_by_user_id],
    ["closed_by_user_id", f.closed_by_user_id],
    ["closed_at", f.closed_at],
    ["estimated_cost", f.estimated_cost],
    ["police_contacted", f.police_contacted],
    ["fire_contacted", f.fire_contacted],
    ["ambulance_contacted", f.ambulance_contacted],
    ["maintenance_contacted", f.maintenance_contacted],
  ];

  for (const [col, value] of columns) {
    if (value !== undefined) {
      params.push(value);
      sets.push(`${col} = $${params.length}`);
    }
  }

  params.push(id);
  const result = await query(
    `UPDATE cases SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING id`,
    params
  );
  if (!result.rowCount) return null;
  return getCaseById(id);
}

async function deleteCase(id) {
  const result = await query(`DELETE FROM cases WHERE id = $1`, [id]);
  return result.rowCount > 0;
}

async function assignCase(id, { departmentId, userId, actorUserId } = {}) {
  const existing = await getCaseById(id);
  if (!existing) return null;

  const nextStatus =
    existing.status === "CLOSED" || existing.status === "RESOLVED"
      ? existing.status
      : "IN_PROGRESS";

  const updated = await updateCase(id, {
    assignedDepartmentId: departmentId ?? existing.assignedDepartmentId,
    assignedUserId: userId ?? existing.assignedUserId,
    status: nextStatus,
  });

  const parts = [];
  if (departmentId != null) parts.push(`department ${departmentId}`);
  if (userId != null) parts.push(`user ${userId}`);
  await addCaseEvent(id, {
    eventType: "assignment",
    message: `Assigned to ${parts.join(" / ") || "unspecified"}`,
    userId: actorUserId ?? null,
  });
  return getCaseById(updated.id);
}

async function closeCase(id, { actorUserId, status = "CLOSED" } = {}) {
  const existing = await getCaseById(id);
  if (!existing) return null;
  await updateCase(id, {
    status,
    closedAt: nowMs(),
    closedByUserId: actorUserId ?? null,
  });
  await addCaseEvent(id, {
    eventType: "closed",
    message: `Case ${status.toLowerCase()}`,
    userId: actorUserId ?? null,
  });
  return getCaseById(id);
}

async function reopenCase(id, { actorUserId } = {}) {
  const existing = await getCaseById(id);
  if (!existing) return null;
  await updateCase(id, {
    status: "ACTIVE",
    closedAt: null,
    closedByUserId: null,
  });
  await addCaseEvent(id, {
    eventType: "reopened",
    message: "Case reopened",
    userId: actorUserId ?? null,
  });
  return getCaseById(id);
}

async function addCaseEvent(caseId, { message, eventType = "note", userId } = {}) {
  if (!message) throw new Error("event message is required");

  const createdAt = nowMs();
  const line = formatFeedLine(message);

  await query(
    `INSERT INTO case_events (case_id, user_id, event_type, message, created_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [caseId, userId ?? null, eventType, message, createdAt]
  );

  await query(
    `UPDATE cases
     SET feed = CASE
           WHEN feed IS NULL OR feed = '' THEN $2
           ELSE feed || E'\n' || $2
         END,
         last_updated_at = $3
     WHERE id = $1`,
    [caseId, line, createdAt]
  );

  const result = await query(
    `SELECT e.*, u.name AS user_name
     FROM case_events e
     LEFT JOIN users u ON u.id = e.user_id
     WHERE e.case_id = $1
     ORDER BY e.created_at DESC
     LIMIT 1`,
    [caseId]
  );
  return eventToApi(result.rows[0]);
}

async function listCaseEvents(caseId) {
  const result = await query(
    `SELECT e.*, u.name AS user_name
     FROM case_events e
     LEFT JOIN users u ON u.id = e.user_id
     WHERE e.case_id = $1
     ORDER BY e.created_at ASC`,
    [caseId]
  );
  return result.rows.map(eventToApi);
}

async function analyticsSummary() {
  const [overview, byCategory, hotspots, services] = await Promise.all([
    query(`
      SELECT
        COUNT(*) FILTER (WHERE status IN ('ACTIVE', 'IN_PROGRESS'))::int AS active,
        COUNT(*) FILTER (WHERE status IN ('CLOSED', 'RESOLVED'))::int AS closed,
        COUNT(*)::int AS total,
        COALESCE(
          AVG(closed_at - created_at) FILTER (WHERE closed_at IS NOT NULL),
          0
        )::bigint AS avg_duration_ms
      FROM cases
    `),
    query(`
      SELECT category, COUNT(*)::int AS count
      FROM cases
      GROUP BY category
      ORDER BY count DESC
    `),
    query(`
      SELECT COALESCE(NULLIF(location_label, ''), '(unlabelled)') AS label,
             COUNT(*)::int AS count
      FROM cases
      GROUP BY 1
      ORDER BY count DESC
      LIMIT 10
    `),
    query(`
      SELECT
        COUNT(*) FILTER (WHERE police_contacted)::int AS police,
        COUNT(*) FILTER (WHERE fire_contacted)::int AS fire,
        COUNT(*) FILTER (WHERE ambulance_contacted)::int AS ambulance,
        COUNT(*) FILTER (WHERE maintenance_contacted)::int AS maintenance
      FROM cases
    `),
  ]);

  return {
    active: overview.rows[0].active,
    closed: overview.rows[0].closed,
    total: overview.rows[0].total,
    avgDurationMs: Number(overview.rows[0].avg_duration_ms) || 0,
    byCategory: byCategory.rows,
    hotspots: hotspots.rows,
    servicesContacted: services.rows[0],
  };
}

module.exports = {
  listCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  assignCase,
  closeCase,
  reopenCase,
  addCaseEvent,
  listCaseEvents,
  analyticsSummary,
};
