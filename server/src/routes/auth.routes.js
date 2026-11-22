const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  getCurrentUser,
} = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authenticate, getCurrentUser);

module.exports = router;