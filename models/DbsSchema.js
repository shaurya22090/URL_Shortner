const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  ShortURL: { type: String, required: true, unique: true },
  LongURL: { type: String, required: true },
  Clicks: { type: Number, required: true },
  CreatedAt: { type: Date, default: Date.now },
  CreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
});

// console.log("schema connection is also done");
module.exports = mongoose.model("urls", urlSchema);
