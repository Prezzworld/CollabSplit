const express = require("express");
const router = express.Router();
const {createProject} = require("../controllers/project.controller");
const {addMember, getMembers, updateMember} = require("../controllers/member.controller");
const {authenticate} = require("../middlewares/auth.middleware");

router.get("/:projectId/members", authenticate, getMembers);
router.post("/create-project", authenticate, createProject);
router.post("/:projectId/add-members", authenticate, addMember);
router.post("/:projectId/update-member", authenticate, updateMember);


module.exports = router;