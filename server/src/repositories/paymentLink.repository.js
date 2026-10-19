const pool = require("../config/db");

const findLinkByProject = async (projectId, client = pool) => {
  const selectQuery = `
    SELECT id, project_id, token, status, description, suggested_amount, created_at FROM payment_links WHERE project_id = $1
  `;
  const values = [projectId];
  const { rows } = await client.query(selectQuery, values);
  return rows[0];
};

const createPaymentLink = async (
  { projectId, token, description, suggestedAmount },
  client = pool,
) => {
  const insertQuery = `
    INSERT INTO payment_links (project_id, token, description, suggested_amount) VALUES ($1, $2, $3, $4) RETURNING id, project_id, token, status, description, suggested_amount, created_at
  `;
  const values = [
    projectId,
    token,
    description || null,
    suggestedAmount || null,
  ];
  const { rows } = await client.query(insertQuery, values);
  return rows[0];
};

const findLinkByToken = async (token, client = pool) => {
  const selectQuery = `
    SELECT id, project_id, token, status, description, suggested_amount, created_at FROM payment_links WHERE token = $1
  `;
  const values = [token];
  const { rows } = await client.query(selectQuery, values);
  return rows[0];
};

const findLinkById = async (linkId, client = pool) => {
  const selectQuery = `
    SELECT id, project_id, token, status, description, suggested_amount, created_at
    FROM payment_links
    WHERE id = $1
  `;
  const values = [linkId];
  const { rows } = await client.query(selectQuery, values);
  return rows[0];
};


module.exports = { findLinkByProject, findLinkByToken, createPaymentLink, findLinkById };
