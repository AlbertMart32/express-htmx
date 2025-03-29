import express from "express";
import { create } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import data from "./data/data.js";
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT;

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

// routes
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
  let book = req.body.book;
  console.log(book);
  let author = req.body.author || "Unkown Author";
  let id = data.length + 1;
  let photo =
    req.body.photo || "https://cdn-icons-png.flaticon.com/512/8832/8832880.png";

  if (book && book.trim() !== "") {
    let newBook = {
      id,
      title: book,
      author,
      photo,
    };
    data.push(newBook);
  }
  res.setHeader("HX-Location", "/books");
  res.send();
});

// app.put("/books/:id", (req, res) => {
//   const id = req.params.id;
//   console.log(id);
//   const book = data.find((book) => book.id == id);
//   console.log(book.author);
//   res.render("books", {
//     book,
//   });
//   //how to update the book title and author
// });

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
