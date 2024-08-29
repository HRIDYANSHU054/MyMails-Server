import express from "express";

import {
  getDrafts,
  getInbox,
  getLabels,
  getMail,
  getMailList,
  respondWithGen,
  //   getUser,
  sendMail,
} from "../controllers/google.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
const router = express.Router();

// router.get("/user", getUser);

router.get("/list", isAuthenticated, getMailList);

router.get("/drafts", isAuthenticated, getDrafts);

router.get("/inbox", isAuthenticated, getInbox);

router.get("/read/:messageId",  isAuthenticated, getMail);

router.get("/classify/:messageId", isAuthenticated, getLabels); // returns response like { label: "Interested" }

router.get("/send/gen", isAuthenticated, respondWithGen);

router.get("/send", isAuthenticated, sendMail);

export default router;
