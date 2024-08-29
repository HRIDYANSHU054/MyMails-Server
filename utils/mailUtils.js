//all these utils throws error on failure
//implement your own error handler

import { config } from "dotenv";
config();
import { gmailClient } from "../controllers/google.controller.js";
import {
  analyzeEmailContent,
  generateMailResponse,
} from "../Gemini/gemini.service.js";
import { parseEmail } from "./formatters.js";

async function getCurrentUserEmailUtil() {
  try {
    const result = await gmailClient.users.getProfile({
      userId: "me",
    });
    return result.data.emailAddress;
  } catch (error) {
    console.error("Error getting user profile:", error.message);
    throw error;
  }
}

//sendMail
export const sendMailUtil = async (to, mailContent) => {
  try {
    const fromMail = await getCurrentUserEmailUtil();

    const mailLines = [
      `From: ${fromMail}`,
      `To: ${to}`,
      "Subject: Testing MyMails(Nodejs + GMail)",
      "",
      `${mailContent}`,
    ];

    const mail = mailLines.join("\r\n").trim();
    const base64Email = Buffer.from(mail).toString("base64");

    const result = gmailClient.users.messages.send({
      userId: "me",
      requestBody: {
        raw: base64Email,
      },
    });

    return { success: "Mail sent", result };
  } catch (error) {
    console.log("error while sending mail:", error.message);
    throw error;
  }
};

//getInbox and unseen mails
export async function getInboxUtil() {
  try {
    const emailsResponse = await gmailClient.users.messages.list({
      userId: "me",
      labelIds: ["INBOX"],
      q: "is:unread", //only those which are unseen
      maxResults: 2,
    });

    const emails = emailsResponse.data.messages;
    //also get sender's mailid
    const messageDetails = await Promise.all(
      emails.map(async (message) => {
        const msg = await gmailClient.users.messages.get({
          userId: "me",
          id: message.id,
          format: "metadata",
          metadataHeaders: ["From"], // Only fetch the "From" header
        });

        const headers = msg.data.payload.headers;
        const fromHeader = headers.find((header) => header.name === "From");
        let senderEmail = fromHeader ? fromHeader.value : "Unknown";

        //lets format sender's mail "Coursera <Coursera@m.learn.coursera.org>"
        if (senderEmail.split(" ").length > 0) {
          senderEmail = senderEmail
            .split(" ")
            .at(-1)
            .replace("<", "")
            .replace(">", "");
        }

        return {
          id: message.id,
          threadId: message.threadId,
          snippet: msg.data.snippet,
          senderEmail: senderEmail,
        };
      })
    );

    const messages = [];

    // Optionally, you can fetch more details for each email
    if (emails && emails.length) {
      for (const email of messageDetails) {
        const msgResp = await gmailClient.users.messages.get({
          userId: "me",
          id: email.id,
          format: "raw",
        });

        const message = msgResp.data;
        const { text, subject, html, attachments } = await parseEmail(
          Buffer.from(msgResp.data.raw, "base64").toString("utf-8")
        );

        messages.push({
          id: email.id,
          senderEmail: email.senderEmail,
          subject,
          text,
          attachments,
        });
      }
    }

    return { messages, length: messages.length };
  } catch (error) {
    console.log("error while getting user mails:", error.message);
    throw error;
  }
}

//classification and response sending
export async function classifyAndGenerateResponseUtil(messageId) {
  try {
    const msgResp = await gmailClient.users.messages.get({
      userId: "me",
      id: messageId,
      format: "raw",
    });

    const message = msgResp.data;
    const { text, subject, html, attachments } = await parseEmail(
      Buffer.from(msgResp.data.raw, "base64").toString("utf-8")
    );

    const { label } = await analyzeEmailContent(
      `Subject: ${subject}\n Content: ${text}`
    );

    const response = await generateMailResponse(
      label,
      `Subject: ${subject}\n Content: ${text}`
    );

    return { label, response };
  } catch (error) {
    console.log("error while getting classifying mails:", error.message);
    throw error;
  }
}
