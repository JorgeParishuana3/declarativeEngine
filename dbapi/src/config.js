import dotenv from "dotenv";

dotenv.config();

export const PGHOST     = process.env.PGHOST || "postgres";
export const PGPORT     = parseInt(process.env.PGPORT || "5432", 10);
export const PGUSER     = process.env.PGUSER || "admin";
export const PGDATABASE = process.env.PGDATABASE || "otiappdb";
export const PGPASSWORD = process.env.PGPASSWORD || "otipass123";