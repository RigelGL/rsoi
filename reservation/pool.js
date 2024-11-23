const postgresql = require('pg');
require('dotenv').config();

const { Pool } = postgresql;

const pool = new Pool({
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: 5432,
});

module.exports = pool;
