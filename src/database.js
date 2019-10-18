// const path = require("path");
// require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { Pool } = require("pg");

const dbPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

module.exports = dbPool;
