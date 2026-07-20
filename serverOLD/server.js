const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;	

app.use(cors());
app.use(express.json());

/* Our tables: one for users and one for the cases */
const TABLES = {
  users: path.join(__dirname, "data/users.json"),
  cases: path.join(__dirname, "data/cases.json"),
};

/* Method to make the outputs more readable */
function readTable(table) {
  const raw = fs.readFileSync(TABLES[table], "utf-8");
  return JSON.parse(raw)[table];
}

function writeTable(table, rows) {
  fs.writeFileSync(
    TABLES[table],
    JSON.stringify({ [table]: rows }, null, 2)
  );
}



/* Grabbing all the items in a table, e.g., a list of the teachers with access */
app.get("/:table", (req, res) => {
  const table = req.params.table;
  if (!TABLES[table]) return res.status(404).send("Table not found");
  res.json(readTable(table));
});

/* POST new */
app.post("/:table", (req, res) => {
  const table = req.params.table;
  if (!TABLES[table]) return res.status(404).send("Table not found");

  const rows = readTable(table);
  const newRow = { id: Date.now(), ...req.body };
  rows.push(newRow);
  writeTable(table, rows);
  res.status(201).json(newRow);
});

/* PUT update */
app.put("/:table/:id", (req, res) => {
  const table = req.params.table;
  if (!TABLES[table]) return res.status(404).send("Table not found");

  const id = Number(req.params.id);
  const rows = readTable(table);
  const index = rows.findIndex(r => r.id === id);
  if (index === -1) return res.status(404).send("Not found");

  rows[index] = { ...rows[index], ...req.body };
  writeTable(table, rows);
  res.json(rows[index]);
});

/* Deleting entries in a specific table, e.g., deleting an retired teacher from the system */
app.delete("/:table/:id", (req, res) => {
  const table = req.params.table;
  if (!TABLES[table]) return res.status(404).send("Table not found");

  const id = Number(req.params.id);
  let rows = readTable(table);
  rows = rows.filter(r => r.id !== id);
  writeTable(table, rows);
  res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});