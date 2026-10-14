const publicService = require("../services/public.service");

const getPayableLink = async (req, res, next) => {
  try {
    const { token } = req.params;
    const link = await publicService.getPaymentLink(token);
    return res.status(200).json({
      success: true,
      data: link,
    });
  } catch (err) {
    return next(err)
  }
};

module.exports = {getPayableLink}
