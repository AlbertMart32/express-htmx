import { neon } from "@neondatabase/serverless";

// Neon database connection using environment variables
if(!process.env.DATABASE_URL){
  console.error("DATABASE_URL is not set in environment variables");
  process.exit(1);
}
const sql = neon(
  process.env.DATABASE_URL
);
async function createTable() {
  await sql`CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL
  )`;
}
createTable()
export default sql;
