const { Pool } = require("pg");

const pool = new Pool({
  host: "aws-1-us-east-2.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  user: "postgres.wcpevqbaakplaymlcaso",
  password: "ycjaf3vea3.", // 👈 la misma que te da Supabase
  ssl: { rejectUnauthorized: false }, // importante para conexiones seguras
});

module.exports = pool;
