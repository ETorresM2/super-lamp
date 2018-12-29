const express = require("express");
const knex = require("knex");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const knexConfig = require("./knexfile.js");

const server = express();
const db = knex(knexConfig.development);

server.use(express.json());
server.use(cors());
server.use(morgan("dev"));
server.use(helmet());

server.use(
  session({
    name: "session",
    secret: "Mondo",
    cookie: {
      maxAge: 1 * 24 * 60 * 60 * 1000,
      secure: false
    },
    httpOnly: false,
    resave: false,
    saveUninitialized: false
  })
);

//============================================================================== Server Check <-----
server.get("/", (req, res) => {
  res.json({ api: "running" });
});
//============================================================================== Get All Users <-----
server.get("/users", (req, res) => {
  db("users").then(users => {
    res.status(200).json(users);
  });
});
//============================================================================== Register User <-----
server.post("/register", (req, res) => {
  const creds = req.body;
  const hash = bcrypt.hashSync(creds.password, 14);
  creds.password = hash;
  db("users")
    .insert(creds)
    .then(user => {
      res.status(200).json(user);
    })
    .catch(err => {
      res.status(500).json({ message: err });
      console.error(err);
    });
});
//============================================================================== Log in User <-----
server.post("/login", (req, res) => {
  const creds = req.body;
  db("users")
    .where({ username: creds.username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        res.status(200).json({ message: "credentials authenticated" });
      } else {
        res.status(401).json({ message: "invalid credentials" });
      }
    })
    .catch(err => res.status(500).json({ err }));
});

const port = process.env.PORT || 9000;

server.listen(port, () => console.log(`\n=== Running on port ${port} ===\n`));
