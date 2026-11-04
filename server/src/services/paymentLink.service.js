const crypto = require("crypto");
const {
  requireOwner,
  assertProjectPayable,
  generateUrl,
  requireMember
} = require("../utils/helperFunctions");
const {
  findLinkByProject,
  createPaymentLink,
  updatePaymentLinkInfo,
} = require("../repositories/paymentLink.repository.js");
const {
  findMembersByProject,
} = require("../repositories/member.repository.js");

const createLink = async ({ projectId, requesterId, data }) => {
  await requireOwner(projectId, requesterId);
  await assertProjectPayable(projectId);

  const existingPaymentLink = await findLinkByProject(projectId);
  if (existingPaymentLink) {
    const error = new Error("A payment link already exists for this project");
    error.statusCode = 409;
    throw error;
  }

  const token = crypto.randomBytes(12).toString("base64url");

  try {
    const link = await createPaymentLink({
      projectId,
      token,
      description: data.description,
      suggestedAmount: data.suggested_amount,
    });
    const url = generateUrl(link.token);

    return { ...link, url };
  } catch (err) {
    if (err.code === "23505") {
      const error = new Error("A payment link already exists for this project");
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

const getPaymentLink = async ({ projectId, requesterId }) => {
  // const members = await findMembersByProject(projectId);
  // const requesterPresent = members.find((m) => m.user_id === requesterId);
  // if (!requesterPresent) {
  //   const error = new Error("You are not a member of this project");
  //   error.statusCode = 403;
  //   throw error;
  // }
  await requireMember(projectId, requesterId);

  const link = await findLinkByProject(projectId);
  if (!link) {
    const error = new Error("No payment link found for this project");
    error.statusCode = 404;
    throw error;
  }
  const url = generateUrl(link.token);
  return { ...link, url };
};

const updatePaymentLinkInformation = async ({
  projectId,
  requesterId,
  data,
}) => {
  await requireMember(projectId, requesterId);
  await requireOwner(projectId, requesterId);
  const link = await findLinkByProject(projectId);
  if (!link) {
    const error = new Error("No payment link found for this project");
    error.statusCode = 404;
    throw error;
  }
  try {
    const updatedLink = await updatePaymentLinkInfo({
      linkId: link.id,
      description: data.description,
      suggestedAmount: data.suggested_amount,
    });
    const url = generateUrl(updatedLink.token);
    return { ...updatedLink, url };
  } catch (err) {
    if(err.code === "23514") {
      const error = new Error("Suggested amount must be a positive number");
      error.statusCode = 400;
      throw error;
    }
    throw err;
  }
};

module.exports = { createLink, getPaymentLink, updatePaymentLinkInformation };
