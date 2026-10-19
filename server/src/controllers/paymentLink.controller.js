const {
  createPaymentLinkSchema,
} = require("../validators/paymentLink.validator");
const paymentLinkService = require("../services/paymentLink.service");

const createPaymentLink = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const requesterId = req.user.userId;
    const paymentLinkData = createPaymentLinkSchema.parse(req.body);
    const paymentLink = await paymentLinkService.createLink({
      projectId,
      requesterId,
      data: paymentLinkData,
    });
    return res.status(201).json({
      success: true,
      data: paymentLink,
    });
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
};

module.exports = {createPaymentLink}