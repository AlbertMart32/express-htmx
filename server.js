// import { db } from "./data/database.js";
import express from "express";
import { create } from "express-handlebars";
import path from "path";
import sql from "./data/databaseNeon.js";
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

// ====================== ROUTES ======================
app.get("/", (req, res) => {
  res.render("home", {
    showHeader: false,
    showFooter: false,
  });
});

app.get("/books", async (req, res) => {
  let books = [];

  const query = `SELECT * FROM books`;
  books = await sql.query(query);

  res.render("books", {
    showHeader: false,
    showFooter: true,
    books: books.length > 0 ? books : null, // Pass null or an empty array if no books found,
  });
});

app.post("/books", async (req, res) => {
  let title = req.body.title;
  let author = req.body.author;

  if (title && title.trim() !== "" && author && author.trim() !== "") {
    const insertQuery = `INSERT INTO books (title, author) VALUES ($1, $2) RETURNING *`;
    const result = await sql.query(insertQuery, [title, author]);

    console.log(
      `Book added successfully: ${result[0].title} by ${result[0].author}`
    );
    res.setHeader("HX-Location", "/books");
    res.send();
  }
});

app.get("/books/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const selectQuery = `SELECT * FROM books WHERE id = $1`;
  const [row] = await sql.query(selectQuery, [id]);
  res.send(formHtmx(row));
});

app.put("/books/:id/edit", async (req, res) => {
  const id = parseInt(req.params.id);
  let title = req.body.title;
  let author = req.body.author;

  if (title && title.trim() !== "" && author && author.trim() !== "") {
    const updateQuery = `UPDATE books SET title = $1, author = $2 WHERE id = $3 RETURNING *`;
    const result = await sql.query(updateQuery, [title, author, id]);
    console.log(result);
    if (result.length === 0) {
      return res.status(404).send("Book not found");
    }
    console.log(`Book with id ${id} updated`);
    res.setHeader("HX-Location", "/books");
    res.send();
  }
});

app.delete("/books/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  const deleteQuery = `DELETE FROM books WHERE id = $1`;
  const result = await sql.query(deleteQuery, [id]);
  if (result.rowCount === 0) {
    return res.status(404).send("Book not found");
  }
  console.log(`Book with id ${id} deleted`);
  res.send();
});

//======================== Search books====================
const searchCache = {};
app.post("/books/search", async (req, res) => {
  const searchTerm = req.body.search.toLowerCase();

  // Check if the result is already in the cache
  if (searchCache[searchTerm]) {
    // console.log("Serving from cache:", searchTerm);
    return res.render("books", {
      showHeader: false,
      showFooter: true,
      books:
        searchCache[searchTerm].length > 0 ? searchCache[searchTerm] : null,
    });
  }
  // If not in cache, query the database
  const searchQuery = `SELECT * FROM books`;

  const result = await sql.query(searchQuery);

  const filteredBooks = result.filter((book) => {
    return book.title.toLowerCase().includes(searchTerm);
  });
  // Store the result in the cache
  searchCache[searchTerm] = filteredBooks;

  res.render("books", {
    showHeader: false,
    showFooter: true,
    books: filteredBooks.length > 0 ? filteredBooks : null,
  });
});

// ===================== server setup  ====================
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Close the database connection on application shutdown
process.on("SIGINT", () => {
  sql.end(() => {
    console.log("Database connection closed.");
    process.exit(0);
  });
});
