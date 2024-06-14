const express = require("express");
const addContact = require("../controllers/contactController");
const router = express.Router();

router.post("/identify", addContact);

module.exports = router;
