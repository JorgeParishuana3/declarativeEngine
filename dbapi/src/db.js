import pkg from 'pg';
const { Pool } = pkg;
import { PGHOST,PGPORT,PGUSER,PGDATABASE,PGPASSWORD} from './config.js';

export const pool = new Pool({
  host: PGHOST,
  user: PGUSER,
  password: PGPASSWORD,
  database: PGDATABASE,
  port: PGPORT,
});
