const {
  createPendingPayment,
  updatePaymentStatus,
} = require("../repositories/payment.repository");
const { findLinkByToken } = require("../repositories/paymentLink.repository");
const crypto = require("crypto");
const paystack = require("../config/paystack");

const initializePayment = async ({ token, email, amount }) => {
  const paymentLink = await findLinkByToken(token);
  if (!paymentLink) {
    const error = new Error("Payment link not found");
    error.statusCode = 404;
    throw error;
  }

  if (paymentLink.status !== "active") {
    const error = new Error("Payment link is no longer active");
    error.statusCode = 410;
    throw error;
  }

  const referenceId = `cs_${crypto.randomBytes(12).toString("hex")}`;

  const payment = await createPendingPayment({
    paymentLinkId: paymentLink.id,
    amount,
    currency: "NGN",
    payerEmail: email,
    referenceId,
  });

  try {
    const { data } = await paystack.post("/transaction/initialize", {
      email,
      amount: Math.round(amount * 100),
      reference: referenceId,
      callback_url: `${process.env.CLIENT_BASE_URL}/pay/${token}/complete`,
    });

    return {
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: referenceId,
    };
  } catch (err) {
    await updatePaymentStatus({ referenceId, status: "failed" });
    console.error("Paystack init failed:", err.response?.data || err.message);
    const providerError = new Error("Payment provider error");
    providerError.statusCode = 502;
    providerError.cause = err;
    throw providerError;
  }
};

module.exports = { initializePayment };
