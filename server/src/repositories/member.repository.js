const pool = require("../config/db");

const findProjectById = async (projectId, client = pool) => {
  const selectQuery = `
    SELECT id, owner_id, status FROM projects WHERE id = $1
  `;
  const values = [projectId];
  const { rows } = await client.query(selectQuery, values);
  return rows[0];
};

const addOwnerAsMember = async ({ projectId, userId }, client = pool) => {
  const insertQuery = `
    INSERT INTO project_members (project_id, user_id, role, percentage) VALUES ($1, $2, 'owner', 0) RETURNING id, project_id, user_id, role, percentage
  `;
  const values = [projectId, userId];
  const { rows } = await client.query(insertQuery, values);
  return rows[0];
};

module.exports = { findProjectById, addOwnerAsMember };
