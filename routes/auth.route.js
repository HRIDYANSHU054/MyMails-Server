import express from "express";
import { getLogout } from "../controllers/auth.controller.js";
import passport from "passport";
const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/gmail.labels",
      "https://www.googleapis.com/auth/gmail.modify",
    ],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: process.env.CLIENT_BASE_URL + "/signup",
  }),
  function (req, resp) {
    resp.redirect(process.env.CLIENT_BASE_URL + "/home");
  }
);

router.get("/logout", getLogout);

router.get("/check", (req, resp, next) => {
  if (req.isAuthenticated()) {
    resp.status(200).json({ user: req.user });
  } else {
    resp.status(401).json({ user: null });
  }
});

export default router;
