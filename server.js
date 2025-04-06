import express from "express";
import { create } from "express-handlebars";
import path from "path";
import { db } from "./data/database.js";
import formHtmx from "./views/formHtmx.js";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;

// template engine setup
const hbs = create({
  extname: ".hbs",
  helpers: {
    ternary: (condition, value1, value2) => (condition ? value1 : value2),
  },
});
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(
  "/htmx",
  express.static(path.join(__dirname, "node_modules", "htmx.org", "dist"))
);
app.use(express.static(path.join(__dirname, "public")));

// middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ======================routes ======================
app.get("/", (req, res) => {
  res.render("home", {
    showHeader: false,
    showFooter: false,
  });
});

app.get("/books", (req, res) => {
  let books = [];
  const sql = `SELECT * FROM books`;
  db.all(sql, [], (err, rows) => {
    try {
      if (err) throw err;
    } catch (err) {
      console.error("Error fetching books:", err.message);
      res.status(500).send("Internal Server Error");
    }
    books = rows;
    res.render("books", {
      showHeader: false,
      showFooter: true,
      books: books.length > 0 ? books : null, // Pass null or an empty array if no books found,
    });
  });
});
app.post("/books", (req, res) => {
  let title = req.body.title;
  let author = req.body.author;

  if (title && title.trim() !== "" && author && author.trim() !== "") {
    const insertQuery = `INSERT INTO books (title, author) VALUES (?, ?)`;
    db.run(insertQuery, [title, author], (err) => {
      if (err) {
        console.error("Error adding book:", err.message);
        return;
      }
      console.log(`Book added successfully: ${title} by ${author}`);
      res.setHeader("HX-Location", "/books");
      res.send();
    });
  }
});

app.get("/books/:id", (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM books WHERE id = ?`;
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error("Error fetching book:", err.message);
      return res.status(500).send("Internal Server Error");
    }
    if (!row) {
      return res.status(404).send("Book not found");
    }

    res.send(formHtmx(row));
  });
});

app.put("/books/:id/edit", (req, res) => {
  const id = req.params.id;
  let title = req.body.title;
  let author = req.body.author;

  if (title && title.trim() !== "" && author && author.trim() !== "") {
    const sql = `UPDATE books SET title = ?, author = ? WHERE id = ?`;
    db.run(sql, [title, author, id], function (err) {
      if (err) {
        console.error("Error updating book:", err.message);
        return res.status(500).send("Internal Server Error");
      }
      if (this.changes === 0) {
        return res.status(404).send("Book not found");
      }
      console.log(`Book with id ${id} updated`);
      res.setHeader("HX-Location", "/books");
      res.send();
    });
  }
});

app.delete("/books/:id", (req, res) => {
  const id = req.params.id;

  const sql = `DELETE FROM books WHERE id = ?`;
  db.run(sql, [id], (err) => {
    if (err) {
      console.error("Error deleting book:", err.message);
      return res.status(500).send("Internal Server Error");
    }
    console.log(`Book with id ${id} deleted`);

    res.send();
  });
});

//======================== Search books====================

app.post("/books/search", (req, res) => {
  const searchTerm = req.body.search.toLowerCase();
  const sql = `SELECT * FROM books`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Error fetching books:", err.message);
      return res.status(500).send("Internal Server Error");
    }
    const filteredBooks = rows.filter((book) => {
      return book.title.toLowerCase().includes(searchTerm);
    });
    res.render("books", {
      showHeader: false,
      showFooter: true,
      books: filteredBooks.length > 0 ? filteredBooks : null,
    });
  });
});

// ===================== server setup  ====================
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Close the database connection on application shutdown
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error("Error closing the database:", err.message);
    } else {
      console.log("Database connection closed.");
    }
    process.exit(0); // Exit the process
  });
});
