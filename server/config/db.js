const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "gramfix",
  user: "ritikkumar",
});

pool.on("connect", () => {
  console.log("PostgreSQL database connected successfully 🚀");
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err);
});

module.exports = pool;
