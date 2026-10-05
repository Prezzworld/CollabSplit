require("dotenv").config();
const {Pool} = require("pg")

const pool = new Pool({
  connectionString: process.env.POSTGRE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

pool.connect()
  .then(() => console.log('Connected to RumptyCloud PostgreSQL database successfully!'))
  .catch((err) => console.error('Database connection error:', err.stack));

module.exports = pool