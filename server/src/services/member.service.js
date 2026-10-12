const {
  addMemberToProject,
  findMembersByProject,
  updateMember,
} = require("../repositories/member.repository");
const { findUserByEmail } = require("../repositories/user.repository");
const { requireOwner } = require("../utils/helperFunctions");

const addCollaborator = async ({ projectId, requesterId, memberData }) => {
  try {
    await requireOwner(projectId, requesterId);
    const memberUser = await findUserByEmail(memberData.email);
    if (!memberUser) {
      const memberError = new Error("No user found with that email");
      memberError.statusCode = 404;
      throw memberError;
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
  await requireOwner(projectId, requesterId);
  const members = await findMembersByProject(projectId);
  return members;
};

const updateOwnMembership = async ({ projectId, requesterId, data }) => {
  const updatedMember = await updateMember({
  projectId,
  userId: requesterId,
  percentage: data.percentage,
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

module.exports = { addCollaborator, getMembers, updateOwnMembership };
