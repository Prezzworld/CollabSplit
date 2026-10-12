const pool = require("../config/db");

const addOwnerAsMember = async ({ projectId, userId }, client = pool) => {
  const insertQuery = `
    INSERT INTO project_members (project_id, user_id, role, percentage) VALUES ($1, $2, 'owner', 0) RETURNING id, project_id, user_id, role, percentage
  `;
  const values = [projectId, userId];
  const { rows } = await client.query(insertQuery, values);
  return rows[0];
};

const addMemberToProject = async (
  { projectId, userId, percentage, bankName, bankCode, accountNumber, country },
  client = pool,
) => {
  const insertQuery = `
    INSERT INTO project_members (project_id, user_id, role, percentage, bank_name, bank_code, account_number, country) VALUES ($1, $2, 'collaborator', $3, $4, $5, $6, $7) RETURNING id, project_id, user_id, role, percentage, bank_name, bank_code, account_number, country, created_at
  `;
  const values = [
    projectId,
    userId,
    percentage,
    bankName,
    bankCode,
    accountNumber,
    country,
  ];
  const { rows } = await client.query(insertQuery, values);
  return rows[0];
};

const findMembersByProject = async (projectId, client = pool) => {
  const selectQuery = `
    SELECT id, project_id, user_id, role, percentage, bank_name, bank_code, account_number, country, created_at FROM project_members WHERE project_id = $1 ORDER BY created_at ASC
  `;
  const values = [projectId];
  const { rows } = await client.query(selectQuery, values);
  return rows;
};

const updateMember = async (
  {projectId, userId, percentage, bankName, bankCode, accountNumber, country},
  client = pool
) => {
  const updateQuery = `
    UPDATE project_members
    SET percentage = $1, bank_name = $2, bank_code = $3, account_number = $4, country = $5
    WHERE project_id = $6 AND user_id = $7
    RETURNING id, project_id, user_id, role, percentage, bank_name, bank_code, account_number, country, updated_at
  `;
  const values = [
    percentage,
    bankName,
    bankCode,
    accountNumber,
    country,
    projectId,
    userId
  ];
  const {rows} = await client.query(updateQuery, values)
  return rows[0]
}

module.exports = {
  addOwnerAsMember,
  addMemberToProject,
  findMembersByProject,
  updateMember
};
