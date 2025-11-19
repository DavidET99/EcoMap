const { Pool } = require("pg");

const pool = new Pool({
  host: "aws-1-us-east-2.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  user: "postgres.wcpevqbaakplaymlcaso",
  password: "ycjaf3vea3.", 
  ssl: { rejectUnauthorized: false }, 
});

module.exports = pool;
