import { config } from "dotenv";
config();
import express from "express";
const app = express();

import googleRoutes from "./routes/google.route.js";

const PORT = process.env.PORT || 3000;

app.get("/", (req, resp) => {
  resp.send("Welcome to MyMails(Node + GMail)");
});

app.use("/api/google/", googleRoutes);

app.listen(PORT, (err) => {
  if (err) {
    return console.log("An error stopped the server");
  }
  console.log("server listens to you on", PORT);
});
