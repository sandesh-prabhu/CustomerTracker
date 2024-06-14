const express = require("express");
require("dotenv").config();
require("./config/db");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT || 8000;

app.use("/", (req, res) => {
  return res.json({ message: "Welcome to app" });
});

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
