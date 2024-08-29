import { config } from "dotenv";
config();

import nodemailer from "nodemailer";
import { google } from "googleapis";
import { MailParser, simpleParser } from "mailparser";

import { createConfig } from "../utils/createConfig.js";
import { authOptions, mailOptions } from "../utils/constants.js";
import { gmail } from "googleapis/build/src/apis/gmail/index.js";

const API_URL = "https://www.googleapis.com/gmail/v1/users";

const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URL
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

google.options({ auth: oAuth2Client });
const gmailClient = google.gmail("v1");
/*


//getUser
export const getUser = async (req, resp) => {
  try {
    const { email } = req.params;
    if (!email) throw new Error("No email provided");
    const url = `${API_URL}/${email}/profile`;
    const { token } = await oAuth2Client.getAccessToken();
    const config = createConfig(token);
    const fetchedResp = await fetch(url, config);
    const data = await fetchedResp.json();
    if (fetchedResp.status !== 200) {
      throw new Error(data.error?.message ?? "Some error occured");
    }
    resp.status(200).json({ userData: data });
  } catch (error) {
    console.log("error while getting user details:", error.message);
    resp.status(500).json({ message: error.message });
  }
};

//sendMail
export const sendMail = async (req, resp) => {
  try {
    const { token: accessToken } = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        ...authOptions,
        accessToken,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mail = {
      ...mailOptions,
      text: "a Mail from MyMails(Nodejs + GMail)",
    };

    const result = await transport.sendMail(mail);

    resp.status(200).json({ success: "Mail sent", result });
  } catch (error) {
    console.log("error while sending mail:", error.message);
    resp.status(500).json({ message: error.message });
  }
};

//getDrafts
export const getDrafts = async (req, resp) => {
  try {
    const { email } = req.params;
    if (!email) throw new Error("No email provided");
    const url = `${API_URL}/${email}/drafts`;
    const { token } = await oAuth2Client.getAccessToken();
    const config = createConfig(token);
    const fetchedResp = await fetch(url, config);
    const data = await fetchedResp.json();
    if (fetchedResp.status !== 200) {
      throw new Error(data.error?.message ?? "Some error occured");
    }
    resp.status(200).json({ drafts: data });
  } catch (error) {
    console.log("error while getting drafts:", error.message);
    resp.status(500).json({ message: error.message });
  }
};

//getMail

export const getMail = async (req, resp) => {
  try {
    const { email } = req.params;
    const { messageId } = req.params;
    if (!email || !messageId) throw new Error("Insufficient args");
    const url = `${API_URL}/${email}/messages/${messageId}`;
    const { token } = await oAuth2Client.getAccessToken();
    const config = createConfig(token);
    const fetchedResp = await fetch(url, config);
    const message = await fetchedResp.json();

    // const messageResponse = await gmailClient.users.messages.get({
    //   userId: "me",
    //   id: messageId,
    // });
    // const message = messageResponse.data;

    let messageBody = "";
    const body = message.payload?.parts
      ? message.payload.parts[1].body
      : message.payload?.body;

    if (body?.data) {
      console.log("normal");
      console.log(body.attachmentId);

      const buffer = Buffer.from(
        body.data.replace(/-/g, "+").replace(/_/g, "/"),
        "base64"
      );
    }

    //For messages with attachments
    if (body?.attachmentId) {
      console.log("atchment");
      const textPart = message.payload?.parts[0]?.parts[1]?.body?.data;
      if (textPart) {
        console.log("yes text part is there");
        const buffer = Buffer.from(textPart, "base64");
        messageBody = buffer.toString("utf-8");
      }
    }

    if (fetchedResp.status !== 200) {
      throw new Error(message.error?.message ?? "Some error occured");
    }
    resp.status(200).json({ mailBody: messageBody });
  } catch (error) {
    console.log("error while getting the specific mail:", error.message);
    resp.status(500).json({ message: error.message });
  }
};

//getMailList
/*
export const getMailList = async (req, resp) => {
  try {
    const { email } = req.params;
    if (!email) throw new Error("No email provided");
    const url = `${API_URL}/${email}/threads?maxResults=10`;
    const { token } = await oAuth2Client.getAccessToken();
    const config = createConfig(token);
    const fetchedResp = await fetch(url, config);
    const data = await fetchedResp.json();
    if (fetchedResp.status !== 200) {
      throw new Error(data.error?.message ?? "Some error occured");
    }
    resp.status(200).json({ mailList: data });
  } catch (error) {
    console.log("error while getting user mails:", error.message);
    resp.status(500).json({ message: error.message });
  }
};
*/
export const getMailList = async (req, resp) => {
  try {
    const res = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
    });

    const messages = res.data.messages;
    // if (res.status !== 200) {
    //   throw new Error(data.error?.message ?? "Some error occured");
    // }
    resp.status(200).json({ mailList: messages });
  } catch (error) {
    console.log("error while getting user mails:", error.message);
    resp.status(500).json({ message: error.message });
  }
};
