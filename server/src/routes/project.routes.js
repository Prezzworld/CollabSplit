const express = require("express");
const router = express.Router();
const {createProject} = require("../controllers/project.controller");
const {addMember, getMembers, updateMember} = require("../controllers/member.controller");
const {createPaymentLink} = require("../controllers/paymentLink.controller")
const {authenticate} = require("../middlewares/auth.middleware");

router.post("/create-project", authenticate, createProject);
router.get("/:projectId/members", authenticate, getMembers);
router.post("/:projectId/add-members", authenticate, addMember);
router.post("/:projectId/update-member", authenticate, updateMember);
router.post("/:projectId/payment-link", authenticate, createPaymentLink);


module.exports = router;