const { randomUUID } = require("crypto");
const { validateVaultFile } = require("./vaultFiles");

const ALLOWED_FLOORS = Object.freeze(["1", "2"]);

function parseFloorId(value) {
  const id = String(value ?? "").trim();
  return ALLOWED_FLOORS.includes(id) ? id : null;
}

function validateFloorPlanFile(file) {
  const check = validateVaultFile(file);
  if (!check.ok) return check;
  if (check.mimeType !== "image/jpeg" && check.mimeType !== "image/png") {
    return {
      ok: false,
      status: 400,
      error: "Floor plans must be a JPG or PNG image.",
    };
  }
  return check;
}

function contentPath(floorId) {
  return `/floors/${floorId}/content`;
}

function objectKey(organizationId, floorId, ext) {
  return `floor-plans/${organizationId}/${floorId}/${randomUUID()}${ext}`;
}

module.exports = {
  ALLOWED_FLOORS,
  parseFloorId,
  validateFloorPlanFile,
  contentPath,
  objectKey,
};
