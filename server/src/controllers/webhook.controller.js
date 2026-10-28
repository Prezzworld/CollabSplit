const { processChargeSuccess } = require("../services/webhook.service");

const verifyPayment = async (req, res, next) => {
  try {
    const { event } = req.body;
    if (event === "charge.success") {
      await processChargeSuccess(req.body.data);
    }
    return res.status(200).json({
      received: true,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { verifyPayment };
