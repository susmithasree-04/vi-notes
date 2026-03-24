const express = require("express");
const router = express.Router();

// Import auth controller functions
const { register, login } = require("../controllers/authController");

// POST /api/auth/register — create a new account
router.post("/register", register);

// POST /api/auth/login — log in with email + password
router.post("/login", login);

module.exports = router;
