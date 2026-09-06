const {
  listDepartments,
  getDepartmentById,
  getDepartmentByName,
} = require("../db/queries/departments");


const getAllDepartments = async (req, res) => {
  try {
    const departments = await listDepartments(req.query);
    res.json(departments);
  } catch (err) 
  {console.error(err);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
};

const getDepartment = async (req, res) => {
  try {
    const { id, name } = req.query;
    let found;

    if (id) {
      found = await getDepartmentById(id);
    } else if (name) {
      found = await getDepartmentByName(name);
    } else{
        return res.status(400).json({ error: "Please provide either 'id' or 'name' as a query parameter" });
    }

    if (!found) return res.status(404).json({ error: "Department not found" });
    res.json(found);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch department" });
  }
};


module.exports = {
    getAllDepartments,
    getDepartment,
};