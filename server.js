import express from "express";
import { create } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import data from "./data/data.js";
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;

// template engine setup
const hbs = create({
  extname: ".hbs",
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
    showFooter: true,
  });
});

app.get("/books", (req, res) => {
  res.render("books", {
    showHeader: false,
    showFooter: true,
    books: data,
  });
});
app.post("/books", (req, res) => {
  let title = req.body.title;
  let author = req.body.author;
  let id = data.length + 1;

  if (title && title.trim() !== "" && author && author.trim() !== "") {
    let newBook = {
      id,
      title,
      author,
    };
    data.push(newBook);
  }
  res.setHeader("HX-Location", "/books");
  res.send();
});

app.put("/books/:id", (req, res) => {
  const id = req.params.id;
  const author = req.body.author;
  const title = req.body.title;
  const bookIndex = data.findIndex((book) => book.id == id);
  data[bookIndex] = { id, title, author };

  res.render("/partials/inputEdit", {
    book: data,
    showHeader: false,
    showFooter: true,
  });
});

app.delete("/books/:id", (req, res) => {
  const id = req.params.id;
  const book = data.find((book) => book.id === id);
  const index = data.indexOf(book);
  data.splice(index, 1);
  res.send();
});

// server setup
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
