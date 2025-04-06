const express = require("express");
const router = express.Router();
const homeownerController = require("../controllers/homeownerController");

// Make sure these match exactly with your controller method names
router.post("/register", homeownerController.registerHomeowner);
router.get("/", homeownerController.getAllHomeowners);
router.put("/:id", homeownerController.updateHomeowner);
router.delete("/:id", homeownerController.deleteHomeowner);
router.get("/email/:email", homeownerController.getHomeownerByEmail);

module.exports = router;
