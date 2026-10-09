const {
  listDepartments,
  getDepartmentById,
  getDepartmentByName,
} = require("../db/queries/departments");

function parseActiveOnly(value) {
  if (value === undefined || value === null || value === "") {
    return true;
  }
  const normalized = String(value).toLowerCase();
  if (normalized === "false" || normalized === "0") return false;
  return true;
}

function parseDepartmentId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

// GET /departments
const getAllDepartments = async (req, res, next) => {
  try {
    if (req.query.name) {
      const found = await getDepartmentByName(String(req.query.name));
      if (!found) {
        return res.status(404).json({ error: "Department not found" });
      }
      return res.json(found);
    }

    const departments = await listDepartments({
      activeOnly: parseActiveOnly(req.query.activeOnly),
    });
    res.json(departments);
  } catch (err) {
    return next(err);
  }
};

// GET /departments/:id
const getDepartment = async (req, res, next) => {
  try {
    const id = parseDepartmentId(req.params.id);
    if (id == null) {
      return res.status(400).json({ error: "Invalid department id" });
    }

    const found = await getDepartmentById(id);
    if (!found) {
      return res.status(404).json({ error: "Department not found" });
    }
    res.json(found);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAllDepartments,
  getDepartment,
};
