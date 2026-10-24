const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { handleFloorPlanUpload } = require("../middleware/uploadFile");
const { validateFloorParam } = require("../middleware/validateFloor");
const {
  listOrganisationFloorPlans,
  getOrganisationFloorPlan,
  getOrganisationFloorPlanContent,
  upsertOrganisationFloorPlan,
} = require("../controllers/floorPlansController");

router.use(authenticate);

router.param("floorId", validateFloorParam);

router.get("/", listOrganisationFloorPlans);
router.get("/:floorId/content", getOrganisationFloorPlanContent);
router.get("/:floorId", getOrganisationFloorPlan);
router.post("/:floorId", handleFloorPlanUpload, upsertOrganisationFloorPlan);

module.exports = router;
