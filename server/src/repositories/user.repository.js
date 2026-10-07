const pool = require("../config/db");

const createUser = async ({ name, email, phone, passwordHash }) => {
  const insertQuery = `
    INSERT INTO users (name, email, phone, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, phone, created_at
  `;
  const values = [name, email, phone || null, passwordHash];
  const { rows } = await pool.query(insertQuery, values);
  return rows[0];
};

module.exports = { createUser };
