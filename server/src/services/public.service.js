const { getPayableLink } = require("../repositories/public.repository");
const { DEFAULT_CURRENCY } = require("../config/constant");

const getPaymentLink = async (token) => {
  const link = await getPayableLink(token);
  if (!link) {
    const error = new Error("Payment link not found");
    error.statusCode = 404;
    throw error;
  }
  if (link.link_status !== "active" || link.project_status === "archived") {
    const error = new Error("This payment link is no longer active");
    error.statusCode = 410;
    throw error;
  }
  return {
    link: { id: link.link_id, status: link.link_status },
    token: link.token,
    project: {
      id: link.project_id,
      name: link.project_name,
      status: link.project_status,
    },
    owner: { name: link.owner_name },
    description: link.description,
    suggested_amount: link.suggested_amount
      ? Number(link.suggested_amount)
      : null,
    currency: DEFAULT_CURRENCY,
  };
};

module.exports = { getPaymentLink };
