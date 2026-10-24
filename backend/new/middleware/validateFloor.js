const { parseFloorId } = require("../storage/floorPlans");

function validateFloorParam(req, res, next, value) {
  const floorId = parseFloorId(value);
  if (!floorId) {
    return res.status(400).json({ error: "Invalid floor" });
  }
  req.params.floorId = floorId;
  next();
}

module.exports = { validateFloorParam };
