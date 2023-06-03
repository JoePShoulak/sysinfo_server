const express = require("express");
const path = require("path");

const PORT = process.env.PORT || 3001;
const app = express();

const si = require("systeminformation");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

app.get("/api/test", (req, res) => {
  si.graphics()
    .then(data => {
      console.log(data);
      res.status(200).send({ status: "success", data });
    })
    .catch(error => {
      console.error(error);
      res.status(500).send({ status: "success", error });
    });
});

app.listen(PORT, () => {
  console.log(`Now listening on port ${PORT}`);
});
