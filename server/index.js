import express from "express";

const app = express();

app.use(express.static("public"));

app.listen(8080, (err) => {
  if (err) {
    throw err;
  }
  console.log("Listening", 8080);
});
