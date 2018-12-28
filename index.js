const express = require("express");
const knex = require("knex");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const knexConfig = require("./knexfile.js");

const server = express();
const db = knex(knexConfig.development);

server.use(express.json());
server.use(cors());
server.use(morgan("dev"));
server.use(helmet());

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
  db("users")
    .insert(req.body)
    .then(user => {
      res.status(200).json(user);
    })
    .catch(err => {
      res.status(500).json({ message: err });
      console.error(err);
    });
});

const port = process.env.PORT || 9000;

server.listen(port, () => console.log(`\n=== Running on port ${port} ===\n`));
