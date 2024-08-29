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
const router = express.Router();

// router.get("/user", getUser);

router.get("/list", getMailList);

router.get("/drafts", getDrafts);

router.get("/inbox", getInbox);

router.get("/read/:messageId", getMail);

router.get("/classify/:messageId", getLabels); // returns response like { label: "Interested" }

router.get("/send/gen", respondWithGen);

router.get("/send", sendMail);

export default router;
