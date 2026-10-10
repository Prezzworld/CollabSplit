const express = require("express");
const router = express.Router();
const {createProject} = require("../controllers/project.controller");
const {authenticate} = require("../middlewares/auth.middleware");

router.post("/create-project", authenticate, createProject);

module.exports = router;