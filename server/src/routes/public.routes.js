const express = require("express");
const router = express.Router();
const { getPayableLink } = require("../controllers/public.controller");
const { initializePayment } = require("../controllers/payment.controller");

router.get("/:token", getPayableLink);
router.post("/:token/initialize", initializePayment);
// router.get("/:token/complete", (req, res) => {
//   res.json({
//     success: true,
//     message: "Payment received. You'll get a confirmation shortly.",
//   });
// });

module.exports = router;
