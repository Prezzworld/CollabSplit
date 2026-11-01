require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .query("SELECT 1")
  .then(() =>
    console.log("Connected to RumptyCloud postgreSQL database successfully"),
  )
  .catch((err) =>
    console.error("Database connection error: ", err.stack || err),
  );

pool.on("error", (err, client) =>
  console.error("Error has occured: ", err, client),
);

module.exports = pool;
