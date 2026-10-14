const crypto = require("crypto");
const {
  requireOwner,
  assertProjectPayable,
} = require("../utils/helperFunctions");
const {
  findLinkByProject,
  createPaymentLink,
} = require("../repositories/paymentLink.repository.js");

const createLink = async ({ projectId, requesterId, data }) => {
  await requireOwner(projectId, requesterId);
  await assertProjectPayable(projectId);

  const existingPaymentLink = await findLinkByProject(projectId);
  if(existingPaymentLink) {
    const error = new Error("A payment link already exists for this project");
    error.statusCode = 409;
    throw error
  }

  const token = crypto.randomBytes(12).toString("base64url")

  try {
    const link = await createPaymentLink({
      projectId,
      token,
      description: data.description,
      suggestedAmount: data.suggested_amount,
    });
    const url = `${process.env.CLIENT_BASE_URL}/pay/${link.token}`

    return {...link, url};
  } catch (err) {
    if(err.code === "23505") {
      const error = new Error("A payment link already exists for this project")
      error.statusCode = 409;
      throw error
    }
    throw err
  } 
};

module.exports = {createLink}
