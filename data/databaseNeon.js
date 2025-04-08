import { neon } from "@neondatabase/serverless";

// Neon database connection using environment variables
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in environment variables");
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);
console.log("Connected to Neon database", process.env.DATABASE_URL);
export default sql;
