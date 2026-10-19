const pool = require("../config/db");

const getPayableLink = async (token, client = pool) => {
  const selectQuery = `
    SELECT pl.id AS link_id, pl.token, pl.status AS link_status, pl.description, pl.suggested_amount, p.id AS project_id, p.project_name, p.status AS project_status, u.name AS owner_name FROM payment_links pl JOIN projects p ON p.id = pl.project_id JOIN users u ON u.id = p.owner_id WHERE pl.token = $1
  `;
  const values = [token];
  const { rows } = await client.query(selectQuery, values);
  return rows[0];
};

module.exports = {getPayableLink}
