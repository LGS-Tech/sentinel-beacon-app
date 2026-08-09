require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const Case = require("./models/Case");
const authOptions = require('./options/auth_options');
const { authenticate, authorize } = require('./middleware/auth');
const sessionOptions = require('./options/session_options');



const app = express();

app.use(cors());
app.use(express.json());
app.use('/auth', authOptions);
app.use('/session', sessionOptions);


mongoose.connect(process.env.MONGO_URI);

const USERS_FILE = path.join(__dirname, "data", "users.json");

function readUsers() {
  const raw = fs.readFileSync(USERS_FILE, "utf-8");
  return JSON.parse(raw).users;
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
}

/* Cases (Mongo) */
app.get("/cases", async (req, res) => {
  const cases = await Case.find();
  res.json(cases);
});

app.post("/cases", async (req, res) => {
  const created = await Case.create(req.body);
  res.json(created);
});

app.put("/cases/:id", async (req, res) => {
  const updated = await Case.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
});

app.delete("/cases/:id", async (req, res) => {
  await Case.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

/* Users (file JSON — Settings profile / login) */
app.get("/users", (req, res) => {
  res.json(readUsers());
});

app.post("/users", (req, res) => {
  const users = readUsers();
  const newRow = { id: Date.now(), ...req.body };
  users.push(newRow);
  writeUsers(users);
  res.status(201).json(newRow);
});

app.put("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const users = readUsers();
  const index = users.findIndex((r) => r.id === id);
  if (index === -1) return res.status(404).send("Not found");
  users[index] = { ...users[index], ...req.body };
  writeUsers(users);
  res.json(users[index]);
});

app.delete("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const users = readUsers().filter((r) => r.id !== id);
  writeUsers(users);
  res.sendStatus(204);
});

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("Server running");
});
