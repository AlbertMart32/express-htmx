import express from "express";
import { create } from "express-handlebars";
import path from "path";

import { fileURLToPath } from "url";
import data from "./data/data.js";
import formHtmx from "./views/formHtmx.js";
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

app.get("/books/:id", (req, res) => {
  const id = req.params.id;

  const bookIndex = data.findIndex((book) => book.id == id);
  const book = data[bookIndex];
  res.send(formHtmx(book));
});

app.put("/books/:id/edit", (req, res) => {
  const id = req.params.id;
  let title = req.body.title;
  let author = req.body.author;

  if (title && title.trim() !== "" && author && author.trim() !== "") {
    const bookIndex = data.findIndex((book) => book.id == id);
    data[bookIndex].id = id;
    data[bookIndex].title = title;
    data[bookIndex].author = author;
  }
  res.setHeader("HX-Location", "/books");
  res.send();
});

app.delete("/books/:id", (req, res) => {
  const id = req.params.id;
  const book = data.find((book) => book.id === id);
  const index = data.indexOf(book);
  data.splice(index, 1);
  res.send();
});

// ===================== server setup  ====================
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
