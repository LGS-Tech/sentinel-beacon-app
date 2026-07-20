const mongoose = require("mongoose");

const CaseSchema = new mongoose.Schema({

    title: String,

    createdAt: Number,

    lastUpdatedAt: Number,

    status: String,

    locationX: Number,

    locationY: Number,

    locationLabel: String,

    feed: String

});

module.exports = mongoose.model(
    "Case",
    CaseSchema
);