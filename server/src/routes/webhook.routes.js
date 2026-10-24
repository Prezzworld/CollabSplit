const express = require("express")
const router = express.Router();
const {verifyPaystackSignature} = require("../middlewares/webhook.middleware")
const {verifyPayment} = require("../controllers/webhook.controller")

router.post("/paystack", verifyPaystackSignature, verifyPayment)

module.exports = router