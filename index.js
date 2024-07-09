const express = require("express");
const bodyParser = require("body-parser");
const { handler } = require("./controllers");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(bodyParser.json());

app.get("*", async (req, res) => {
  await handler(req);
  res.send("GET request handled");
  console.log("get ger");
});

app.post("*", async (req, res) => {
  await handler(req);
  res.send("POST request handled");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
