const { findMembersByProject } = require("../repositories/member.repository");
const { findProjectById } = require("../repositories/project.repository");

const requireOwner = async (projectId, requesterId) => {
  const project = await findProjectById(projectId);
  if (!project) {
    const err = new Error("Project not found");
    err.statusCode = 404;
    throw err;
  }
  if (project.owner_id !== requesterId) {
    const err = new Error("Only the project owner can do this");
    err.statusCode = 403;
    throw err;
  }
  return project;
};

const assertProjectPayable = async (projectId) => {
  const members = await findMembersByProject(projectId);
  if (members.length === 0) {
    const error = new Error("Project has no members");
    error.statusCode = 400;
    throw error;
  }

  const memberHasZeroPercentage = members.some(
    (m) => Number(m.percentage) <= 0,
  );
  if (memberHasZeroPercentage) {
    const error = new Error(
      "All members must have a percentage greater than zero",
    );
    error.statusCode = 400;
    throw error;
  }

  const total = members.reduce((sum, m) => sum + Number(m.percentage), 0);
  if (total !== 100) {
    const error = new Error(
      `Percentages must total exactly 100 (currently ${total})`,
    );
    error.statusCode = 400;
    throw error;
  }

  const memberHasMissingBank = members.some(
    (m) => !m.bank_name || !m.bank_code || !m.account_number,
  );
  if (memberHasMissingBank) {
    const error = new Error("All member must have complete bank details");
    error.statusCode = 400;
    throw error;
  }

  return members;
};

const calculateSplits = (amountNaira, members) => {
  const splits = members.map((m) => ({
    userId: m.user_id,
    percentage: Number(m.percentage),
    bankName: m.bank_name,
    bankCode: m.bank_code,
    accountNumber: m.account_number,
    country: m.country,
    amount: Math.round(amountNaira * Number(m.percentage)) / 100,
  }));

  const total = splits.reduce((s, x) => s + x.amount, 0);
  const diff = Math.round((amountNaira - total) * 100) / 100;

  if (diff !== 0) {
    // Assign residual to owner (role='owner')
    const owner = splits.find((s) => {
      const member = members.find((m) => m.user_id === s.userId);
      return member.role === "owner";
    });
    if (owner) owner.amount = Math.round((owner.amount + diff) * 100) / 100;
  }

  return splits;
};

module.exports = { requireOwner, assertProjectPayable, calculateSplits };
