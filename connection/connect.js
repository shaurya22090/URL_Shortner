const mongoose = require("mongoose");
require("dotenv").config();
const databaseUrl = process.env.dbURI;

const connectDb = () => {
  mongoose
    .connect(databaseUrl)
    .then(() => console.log("database connected !!"))
    .catch((err) => console.log("connection failed: ", err));
};

module.exports = connectDb;
