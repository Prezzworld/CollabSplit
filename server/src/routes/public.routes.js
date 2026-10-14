const express = require("express");
const router = express.Router();
const {getPayableLink} = require("../controllers/public.controller");

router.get("/:token", getPayableLink); 

module.exports = router;
