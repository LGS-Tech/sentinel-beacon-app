const path = require("path");
const fs = require("fs").promises;
const { getCaseById } = require("../db/queries/cases");

async function generateReportFromDB(caseId) {
  const caseData = await getCaseById(caseId);
  if (!caseData) return { success: false, reason: "NOT_FOUND" };

  // handles the [] = true case
  const record = Array.isArray(caseData) ? caseData[0] : caseData;
  if (!record) return { success: false, reason: "NOT_FOUND" };

  const reportContent = `
==================================================
CASE REPORT: ${record.id || record._id}
==================================================
Title:        ${record.title || "N/A"}
Status:       ${record.status || "Unknown"}
Priority:     ${record.priority || "N/A"}
Category:     ${record.category || "N/A"}

Department:   ${record.assignedDepartmentName || record.assignedDepartmentId || "N/A"}
Assigned To:  ${record.assignedUserName || record.assignedUserId || "Unassigned"}

Created by:   ${record.createdByName || record.createdById || "Unknown"}
Created at:   ${record.createdAt || "Unknown"}
Last Updated: ${record.lastUpdatedAt || "Unknown"}

Location:     ${record.locationLabel || "N/A"}
Location X:   ${record.locationX || "N/A"}
Location Y:   ${record.locationY || "N/A"}
Floor:        ${record.floor || "N/A"}

DESCRIPTION:
--------------------------------------------------
${record.description || "No description provided."}
==================================================

Estimated Cost: ${record.estimatedCost || "Unknown"}

Police Contacted: ${record.policeContacted || "N/A"}
Fire Department Contacted: ${record.fireContacted || "N/A"}
Ambulance Contacted: ${record.ambulanceContacted || "N/A"}
Maintenance Contacted: ${record.maintenanceContacted || "N/A"}
--------------------------------------------------

Closed by: ${record.closedByName || record.closedById || "N/A"}
Closed at: ${record.closedAt || "N/A"}


Last Sync:   ${new Date().toISOString()}
`.trim();

  const filePath = path.join(process.cwd(), "report.txt");
  await fs.writeFile(filePath, reportContent, "utf-8");

  return { success: true, filePath };
}

module.exports = { generateReportFromDB };