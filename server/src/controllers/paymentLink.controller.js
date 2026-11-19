const {
  createPaymentLinkSchema,
  updatePaymentLinkStatusSchema,
  updatePaymentLinkSchema
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
    return next(err);
  }
};

const getPaymentLink = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.user;
    const paymentLink = await paymentLinkService.getPaymentLink({projectId, requesterId: userId});
    return res.status(200).json({
      success: true,
      data: paymentLink,
    })
  } catch (err) {
    return next(err);
  }
}

const updatePaymentLinkInfo = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const requesterId = req.user.userId;
    const paymentLinkData = updatePaymentLinkSchema.parse(req.body)
    const updatedLink = await paymentLinkService.updatePaymentLinkInformation({
      projectId,
      requesterId,
      data: paymentLinkData
    })
    return res.status(200).json({
      success: true,
      data: updatedLink
    })
  } catch (err) {
    return next(err);
  }
}

const updatePaymentLinkStatus = async (req, res, next) => {
  try {
    const {projectId} = req.params;
    const requesterId = req.user.userId;
    const paymentLinkStatusData = updatePaymentLinkStatusSchema.parse(req.body);
    const updatedLinkStatus = await paymentLinkService.updatePaymentLinkStatus({
      projectId,
      requesterId,
      status: paymentLinkStatusData.status
    })
    return res.status(200).json({
      success: true,
      data: updatedLinkStatus
    })
  } catch (err) {
    return next(err);
  }
}


module.exports = {createPaymentLink, getPaymentLink, updatePaymentLinkInfo, updatePaymentLinkStatus}