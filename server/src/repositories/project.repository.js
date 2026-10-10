const pool = require("../config/db");
const { addOwnerAsMember } = require("./member.repository");

const createProject = async ({
  project_name,
  project_description,
  owner_id,
}) => {
  const client = await pool.connect();
  try {
    const insertQuery = `
    INSERT INTO projects (owner_id, project_name, project_description) VALUES ($1, $2, $3) RETURNING id, owner_id, project_name, project_description, status, created_at
  `;
    const values = [owner_id, project_name, project_description || null];
    await client.query("BEGIN");
    const { rows } = await client.query(insertQuery, values);
    const project = rows[0];
    await addOwnerAsMember({ projectId: project.id, userId: owner_id }, client);
    await client.query("COMMIT");
    return project;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release(); 
  }
};

module.exports = { createProject };
