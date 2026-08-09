const mongoose = require("mongoose");
require("dotenv").config();
const databaseUrl = process.env.MONGO_URI;

const connectDb = () => {
  mongoose
    .connect(dbURI)
    .then(() => console.log("database connected !!"))
    .catch((err) => console.log("connection failed: ", err));
};

module.exports = connectDb;
