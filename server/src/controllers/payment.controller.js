const {initializePaymentSchema} = require("../validators/payment.validator");
const paymentService = require("../services/payment.service");

const initializePayment = async (req, res, next) => {
  try {
    const paymentData = initializePaymentSchema.parse(req.body);
    const {token} = req.params;
    const result = await paymentService.initializePayment({token, ...paymentData})
    return res.status(200).json({
      success: true,
      message: "Payment initialized successfully",
      data: result
    })
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Invalid input",
        details: err.issues,
      });
    }
    return next(err);
  }
}

module.exports = {initializePayment}