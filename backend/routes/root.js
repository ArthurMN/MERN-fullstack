const express = require("express");
const router = express.Router();
const path = require("path");

//Só ira corresponder caso o request seja apenas uma barra
router.get("^/$|/index(.html)?", (request, response) => {
  response.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

module.exports = router;
