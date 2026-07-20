require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Case =
require("./models/Case");

const app = express();

app.use(cors());

app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

app.get("/cases", async(req,res)=>{

    const cases =
        await Case.find();

    res.json(cases);

});


app.post("/cases", async(req,res)=>{

    const created =
        await Case.create(req.body);

    res.json(created);

});



app.put("/cases/:id", async(req,res)=>{

    const updated =
        await Case.findByIdAndUpdate(

            req.params.id,

            req.body,

            {new:true}

        );

    res.json(updated);

});

app.delete("/cases/:id",async(req,res)=>{

    await Case.findByIdAndDelete(
        req.params.id
    );

    res.sendStatus(204);

});

app.listen(
  process.env.PORT,
  "0.0.0.0",
  () => {
    console.log("Server running");
  }
);