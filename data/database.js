import sqlite3 from "sqlite3";
const sql3 = sqlite3.verbose();
const db = new sql3.Database(
  "./data/database.db",
  sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log("Connected to the database.");
  }
);
const query = `CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

db.run(query, (err) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log("Table created successfully.");
});

export { db };
