const mongoose = require("mongoose");
require("dotenv").config();

const mongo_uri = process.env.MONGO_URI;
mongoose
  .connect(mongo_uri)
  .then(() => {
    console.log("Successfully connected to DB");
  })
  .catch((err) => {
    console.log("Failed to connect to DB\nError: ", err);
  });
