import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  host: 'postgres',
  user: 'admin',
  password: 'otipass123',
  database: 'otiappdb',
  port: 5432,
});
