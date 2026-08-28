/**
 * Map Postgres rows to the shapes Express / Expo already use
 * (camelCase + Mongo-style `_id` on cases, spaced phone key on users).
 */

function attachmentToApi(row) {
  if (!row) return null;
  return {
    id: row.id,
    caseId: row.case_id,
    filename: row.filename,
    mimeType: row.mime_type,
    storageUrl: row.storage_url,
    storageProvider: row.storage_provider,
    fileSizeBytes:
      row.file_size_bytes != null ? Number(row.file_size_bytes) : null,
    uploadedByUserId: row.uploaded_by_user_id,
    uploadedByName: row.uploaded_by_name ?? null,
    createdAt: row.created_at != null ? Number(row.created_at) : null,
  };
}

function userToPublicApi(user) {
  if (!user) return null;
  const copy = { ...user };
  delete copy.password;
  return copy;
}

function userToApi(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    password: row.password,
    email: row.email,
    name: row.name,
    phone: row.phone,
    "phone number": row.phone,
    role: row.role,
    authorisation: row.authorisation,
    collegeId: row.college_id,
    departmentId: row.department_id,
    department: row.department_name ?? null,
    yearSemester: row.year_semester,
    userType: row.user_type,
    isActive: row.is_active,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function departmentToApi(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    kind: row.kind,
    isActive: row.is_active,
  };
}

function caseToApi(row) {
  if (!row) return null;
  const id = row.id;
  return {
    _id: id,
    id,
    title: row.title,
    createdAt: row.created_at != null ? Number(row.created_at) : null,
    lastUpdatedAt:
      row.last_updated_at != null ? Number(row.last_updated_at) : null,
    status: row.status,
    locationX: row.location_x,
    locationY: row.location_y,
    locationLabel: row.location_label,
    feed: row.feed ?? "",
    chat: row.chat ?? "",
    category: row.category,
    description: row.description,
    priority: row.priority,
    assignedDepartmentId: row.assigned_department_id,
    assignedDepartmentName: row.assigned_department_name ?? null,
    assignedUserId: row.assigned_user_id,
    assignedUserName: row.assigned_user_name ?? null,
    createdByUserId: row.created_by_user_id,
    createdByName: row.created_by_name ?? null,
    closedByUserId: row.closed_by_user_id,
    closedAt: row.closed_at != null ? Number(row.closed_at) : null,
    estimatedCost:
      row.estimated_cost != null ? Number(row.estimated_cost) : null,
    policeContacted: row.police_contacted,
    fireContacted: row.fire_contacted,
    ambulanceContacted: row.ambulance_contacted,
    maintenanceContacted: row.maintenance_contacted,
  };
}

function eventToApi(row) {
  if (!row) return null;
  return {
    id: row.id,
    caseId: row.case_id,
    userId: row.user_id,
    userName: row.user_name ?? null,
    eventType: row.event_type,
    message: row.message,
    createdAt: row.created_at != null ? Number(row.created_at) : null,
  };
}

function nowMs() {
  return Date.now();
}

function pick(body, camel, snake) {
  if (body == null) return undefined;
  if (Object.prototype.hasOwnProperty.call(body, camel)) return body[camel];
  if (Object.prototype.hasOwnProperty.call(body, snake)) return body[snake];
  return undefined;
}

module.exports = {
  userToApi,
  userToPublicApi,
  departmentToApi,
  caseToApi,
  eventToApi,
  attachmentToApi,
  nowMs,
  pick,
};
