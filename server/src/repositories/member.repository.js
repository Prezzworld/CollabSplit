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

const updateMemberDetails = async ({projectId, userId, bankName, bankCode, accountNumber, country}, client = pool) => {
  const updateQuery = `
    UPDATE project_members
    SET bank_name = $1, bank_code = $2, account_number = $3, country = $4
    WHERE project_id = $5 AND user_id = $6
    RETURNING id, project_id, user_id, role, bank_name, bank_code, account_number, country, updated_at
  `;
  const values = [
    bankName,
    bankCode,
    accountNumber,
    country,
    projectId,
    userId,
  ];
  const { rows } = await client.query(updateQuery, values);
  return rows[0];
}

const updatePercentage = async ({projectId, userId, percentage}, client = pool) => {
  const updateQuery = `
    UPDATE project_members
    SET percentage = $1
    WHERE project_id = $2 AND user_id = $3
    RETURNING id, project_id, user_id, role, percentage, bank_name, bank_code, account_number, country, updated_at
  `;
  const values = [percentage, projectId, userId]
  const {rows} = await client.query(updateQuery, values)
  return rows[0]
}

const findMembersWithUserDetails = async (projectId, client = pool) =>{
  const selectQuery = `
    SELECT pm.user_id, pm.role, pm.percentage, pm.bank_name, pm.account_number, pm.country,
       u.name, u.email
    FROM project_members pm
    JOIN users u ON u.id = pm.user_id
    WHERE pm.project_id = $1
    ORDER BY pm.created_at ASC;
  `;
  const values = [projectId]
  const {rows} = await client.query(selectQuery, values)
  return rows
}

module.exports = {
  addOwnerAsMember,
  addMemberToProject,
  findMembersByProject,
  updateMemberDetails,
  updatePercentage,
  findMembersWithUserDetails
};
