const {
  listFloorPlans,
  getFloorPlan,
  getFloorPlanRow,
  upsertFloorPlan,
} = require("../db/queries/floorPlans");
const { requireRequestOrganization } = require("../db/orgScope");
const r2 = require("../storage/r2");
const {
  parseFloorId,
  validateFloorPlanFile,
  objectKey,
} = require("../storage/floorPlans");

function clientError(res, err, fallbackStatus, fallbackMessage) {
  const status = err.status || fallbackStatus;
  const message = err.status && err.message ? err.message : fallbackMessage;
  return res.status(status).json({ error: message });
}

function requireFloor(req, res) {
  const floorId = parseFloorId(req.params.floorId);
  if (!floorId) {
    res.status(400).json({ error: "Invalid floor" });
    return null;
  }
  return floorId;
}

const listOrganisationFloorPlans = async (req, res) => {
  try {
    const organizationId = requireRequestOrganization(req, res);
    if (organizationId == null) return;
    const items = await listFloorPlans(organizationId);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list floor plans" });
  }
};

const getOrganisationFloorPlan = async (req, res) => {
  try {
    const organizationId = requireRequestOrganization(req, res);
    if (organizationId == null) return;
    const floorId = requireFloor(req, res);
    if (!floorId) return;
    const found = await getFloorPlan(organizationId, floorId);
    if (!found) {
      return res.status(404).json({ error: "Floor plan not found" });
    }
    res.json(found);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch floor plan" });
  }
};

const getOrganisationFloorPlanContent = async (req, res) => {
  try {
    const organizationId = requireRequestOrganization(req, res);
    if (organizationId == null) return;
    const floorId = requireFloor(req, res);
    if (!floorId) return;
    const row = await getFloorPlanRow(organizationId, floorId);
    if (!row) {
      return res.status(404).json({ error: "Floor plan not found" });
    }

    if (row.storage_provider !== "r2" && row.storage_provider !== "s3") {
      return res.status(409).json({
        error: "This floor plan is not stored in object storage.",
      });
    }

    const object = await r2.getObject(row.storage_url);
    const bytes = await object.Body.transformToByteArray();

    res.setHeader(
      "Content-Type",
      row.mime_type || "application/octet-stream"
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${String(row.filename).replace(/"/g, "")}"`
    );
    res.send(Buffer.from(bytes));
  } catch (err) {
    return clientError(res, err, 500, "Failed to open floor plan");
  }
};

const upsertOrganisationFloorPlan = async (req, res) => {
  let uploadedKey = null;
  let previousKey = null;

  try {
    const organizationId = requireRequestOrganization(req, res);
    if (organizationId == null) return;
    const floorId = requireFloor(req, res);
    if (!floorId) return;

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        error: "Upload a JPG or PNG image in the file field.",
      });
    }

    const check = validateFloorPlanFile({
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });
    if (!check.ok) {
      return res.status(check.status).json({ error: check.error });
    }

    if (!r2.isConfigured()) {
      return res.status(503).json({
        error: "File storage is not configured.",
      });
    }

    const previous = await getFloorPlanRow(organizationId, floorId);
    previousKey =
      previous &&
      (previous.storage_provider === "r2" || previous.storage_provider === "s3")
        ? previous.storage_url
        : null;

    uploadedKey = objectKey(organizationId, floorId, check.ext);
    await r2.putObject({
      key: uploadedKey,
      body: file.buffer,
      contentType: check.mimeType,
    });

    const uploadedByUserId = req.user?.userId ?? req.user?.id ?? null;

    const saved = await upsertFloorPlan(
      organizationId,
      floorId,
      {
        filename: check.filename,
        mimeType: check.mimeType,
        storageUrl: uploadedKey,
        storageProvider: "r2",
        fileSizeBytes: file.size,
        uploadedByUserId,
      }
    );

    if (previousKey && previousKey !== uploadedKey) {
      try {
        await r2.deleteObject(previousKey);
      } catch (storageErr) {
        console.error(
          "R2 delete of previous floor plan failed:",
          storageErr.name || "Error"
        );
      }
    }

    res.status(previous ? 200 : 201).json(saved);
  } catch (err) {
    if (uploadedKey) {
      try {
        await r2.deleteObject(uploadedKey);
      } catch {
        // already logged in r2 helper
      }
    }
    return clientError(res, err, 400, "Failed to save floor plan");
  }
};

module.exports = {
  listOrganisationFloorPlans,
  getOrganisationFloorPlan,
  getOrganisationFloorPlanContent,
  upsertOrganisationFloorPlan,
};
