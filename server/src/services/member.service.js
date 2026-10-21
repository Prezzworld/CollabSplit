const {
  addMemberToProject,
  findMembersByProject,
  updateMemberDetails,
  updatePercentage,
  findMembersWithUserDetails
} = require("../repositories/member.repository");
const { findUserByEmail } = require("../repositories/user.repository");
const { requireOwner, projectEditable } = require("../utils/helperFunctions");

const addCollaborator = async ({ projectId, requesterId, memberData }) => {
  try {
    await requireOwner(projectId, requesterId);
    await projectEditable(projectId);
    const memberUser = await findUserByEmail(memberData.email);
    if (!memberUser) {
      const memberError = new Error("No user found with that email");
      memberError.statusCode = 404;
      throw memberError;
    }

    const existingMembers = await findMembersByProject(projectId);
    const currentTotal = existingMembers.reduce(
      (sum, m) => sum + Number(m.percentage),
      0,
    );

    const newTotal = currentTotal + memberData.percentage
    if(Math.round(newTotal * 100) > 10000) {
      const error = new Error(
        `The total would be ${newTotal.toFixed(2)}%, it cannot go above 100, you have ${(100 - currentTotal).toFixed(2)}% left`,
      );
      error.statusCode = 400;
      throw error;
    }
    const member = await addMemberToProject({
      projectId,
      userId: memberUser.id,
      percentage: memberData.percentage,
      bankName: memberData.bank_name,
      bankCode: memberData.bank_code,
      accountNumber: memberData.account_number,
      country: memberData.country,
    });
    return member;
  } catch (err) {
    if (err.code === "23503") {
      const fkError = new Error("Invalid country code");
      fkError.statusCode = 400;
      throw fkError;
    }
    if (err.code === "23505") {
      const duplicateError = new Error(
        "This user is already a member of this project",
      );
      duplicateError.statusCode = 409;
      throw duplicateError;
    }
    throw err;
  }
};

const getMembers = async ({ projectId, requesterId }) => {
  const members = await findMembersWithUserDetails(projectId);
  const requesterPresent = members.find(m => m.user_id === requesterId);
  if(!requesterPresent) {
    const error = new Error("You are not a member of this project");
    error.statusCode = 403;
    throw error
  }
  const requesterIsOnwer = requesterPresent.role === "owner"
  return members.map(m => {
    const canSeeFull = m.user_id === requesterId || requesterIsOnwer;
    if(canSeeFull || !m.account_number) return m;
    const lastFour = m.account_number.slice(-4);
    const maskedAccNum = lastFour.padStart(m.account_number.length, "*")

    return {...m, account_number: maskedAccNum}
  })
};

const updateOwnMembership = async ({ projectId, requesterId, data }) => {
  const updatedMember = await updateMemberDetails({
    projectId,
    userId: requesterId,
    bankName: data.bank_name,
    bankCode: data.bank_code,
    accountNumber: data.account_number,
    country: data.country,
  });
  if (!updatedMember) {
    const memberError = new Error("You are not a member of this project");
    memberError.statusCode = 403;
    throw memberError;
  }
  return updatedMember;
};

const updateMemberPercentage = async ({
  projectId,
  requesterId,
  targetUserId,
  percentage,
}) => {
  await requireOwner(projectId, requesterId);
  await projectEditable(projectId);

  const members = await findMembersByProject(projectId);
  const target = members.find((m) => m.user_id === targetUserId);
  if (!target) {
    const error = new Error("Target member not found");
    error.statusCode = 404;
    throw error;
  }

  const othersTotal = members
    .filter((m) => m.user_id !== targetUserId)
    .reduce((sum, m) => sum + Number(m.percentage), 0);

  const newTotal = percentage + othersTotal;
  if (Math.round(newTotal * 100) > 10000) {
    const error = new Error(
      `The total would be ${newTotal}%, it cannot go above 100, you have ${(100 - othersTotal).toFixed(2)}% left`,
    );
    error.statusCode = 400;
    throw error;
  }

  const updatedPercentage = await updatePercentage({
    projectId,
    userId: targetUserId,
    percentage,
  });

  return updatedPercentage;
};

module.exports = {
  addCollaborator,
  getMembers,
  updateOwnMembership,
  updateMemberPercentage,
};
