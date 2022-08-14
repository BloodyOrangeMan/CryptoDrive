const express = require("express");
const router = express.Router();

const keyController = require("../controllers/keyController");
const authController = require("../controllers/authController");

router
    .route("/")
    .post(authController.protect, keyController.createKey)
    .get(authController.protect, keyController.getAllKey)
    .delete(authController.protect, keyController.deleteKey);

module.exports = router;