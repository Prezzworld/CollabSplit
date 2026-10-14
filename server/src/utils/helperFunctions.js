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

module.exports = { requireOwner, assertProjectPayable };
