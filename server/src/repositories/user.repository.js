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

const findUserByEmail = async (email) => {
  const selectQuery = `
    SELECT id, name, email, phone, password_hash, created_at
    FROM users
    WHERE email = $1
  `;
  const values = [email];
  const { rows } = await pool.query(selectQuery, values);
  return rows[0]; 
};

module.exports = { createUser, findUserByEmail };
