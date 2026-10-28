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

const findProjectById = async (projectId, client = pool) => {
  const selectQuery = `
    SELECT id, owner_id, status FROM projects WHERE id = $1
  `;
  const values = [projectId];
  const { rows } = await client.query(selectQuery, values);
  return rows[0];
};

const getProjects = async (userId, client  = pool) => {
  const selectQuery = `
    SELECT p.id, p.project_name, p.project_description, p.status, p.created_at,
    pm.role, pm.percentage
    FROM project_members pm
    JOIN projects p ON p.id = pm.project_id
    WHERE pm.user_id = $1
    ORDER BY p.created_at DESC;
  `;
  const {rows} = await client.query(selectQuery, [userId])
  return rows
}

const getProjectDetails = async (id, client = pool) => {
  const selectQuery = `
    SELECT id, owner_id, project_name, project_description, status, created_at FROM projects WHERE id = $1
  `;
  const {rows} = await client.query(selectQuery, [id])
  return rows[0]
}

module.exports = { createProject, findProjectById, getProjects, getProjectDetails };
