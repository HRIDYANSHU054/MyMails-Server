import { config } from "dotenv";
config();
import express from "express";
import cors from "cors";
import "./passport/google.auth.js";

const app = express();

import googleRoutes from "./routes/google.route.js";

import authRoutes from "./routes/auth.route.js";
import session from "express-session";
import passport from "passport";

const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, resp) => {
  resp.send("Welcome to MyMails(Node + GMail)");
});

app.use("/api/auth", authRoutes);

app.use("/api/google/", googleRoutes);

app.listen(PORT, (err) => {
  if (err) {
    return console.log("An error stopped the server");
  }
  console.log("server listens to you on", PORT);
});
