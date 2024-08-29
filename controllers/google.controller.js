import { config } from "dotenv";
config();

import { google } from "googleapis";

import { convert } from "html-to-text";
import { parseEmail } from "../utils/formatters.js";
import {
  analyzeEmailContent,
  generateMailResponse,
} from "../Gemini/gemini.service.js";
import {
  classifyAndGenerateResponseUtil,
  getInboxUtil,
  sendMailInQueueUtil,
  sendMailUtil,
} from "../utils/mailUtils.js";

const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URL
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

google.options({ auth: oAuth2Client });
export const gmailClient = google.gmail("v1");

const scopes = [
  "https://www.googleapis.com/auth/gmail.labels",
  "https://www.googleapis.com/auth/gmail.modify",
];
const url = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  prompt: "consent",
  redirect_uri: "postmessage",
});

// //getUser
// export const getUser = async (req, resp) => {
//   try {
//     const { email } = req.params;
//     if (!email) throw new Error("No email provided");
//     const url = `${API_URL}/${email}/profile`;
//     const { token } = await oAuth2Client.getAccessToken();
//     const config = createConfig(token);
//     const fetchedResp = await fetch(url, config);
//     const data = await fetchedResp.json();
//     if (fetchedResp.status !== 200) {
//       throw new Error(data.error?.message ?? "Some error occured");
//     }
//     resp.status(200).json({ userData: data });
//   } catch (error) {
//     console.log("error while getting user details:", error.message);
//     resp.status(500).json({ message: error.message });
//   }
// };

//sendMail
export const sendMail = async (req, resp) => {
  try {
    oAuth2Client.setCredentials({
      access_token: req.user.accessToken,
    });

    google.options({ auth: oAuth2Client });
    const gmailClient = google.gmail("v1");

    const mailLines = [
      `From: ${process.env.MAIL_FROM}`,
      `To: ${process.env.MAIL_TO}`,
      "Subject: Testing MyMails(Nodejs + GMail)",

      "",
      "a Mail from MyMails(Nodejs + GMail)",
    ];

    const mail = mailLines.join("\r\n").trim();
    const base64Email = Buffer.from(mail).toString("base64");

    const result = gmailClient.users.messages.send({
      userId: "me",
      requestBody: {
        raw: base64Email,
      },
    });

    resp.status(200).json({ success: "Mail sent", result });
  } catch (error) {
    console.log("error while sending mail:", error.message);
    resp.status(500).json({ message: error.message });
  }
};

//getDrafts
export const getDrafts = async (req, resp) => {
  try {
    oAuth2Client.setCredentials({
      access_token: req.user.accessToken,
    });

    google.options({ auth: oAuth2Client });
    const gmailClient = google.gmail("v1");

    const fetchResp = await gmailClient.users.drafts.list({
      userId: "me",
      maxResults: 10,
    });
    const drafts = fetchResp.data.drafts;
    if (!drafts.length) throw new Error("No drafts found");
    resp.status(200).json({ drafts, length: drafts.length });
  } catch (error) {
    console.log("error while getting drafts:", error.message);
    resp.status(500).json({ message: error.message });
  }
};

//getMail
export const getMail = async (req, resp) => {
  try {
    const { messageId } = req.params;
    oAuth2Client.setCredentials({
      access_token: req.user.accessToken,
    });

    google.options({ auth: oAuth2Client });
    const gmailClient = google.gmail("v1");

    if (!messageId) throw new Error("Insufficient args");
    const msgResp = await gmailClient.users.messages.get({
      userId: "me",
      id: messageId,
      format: "raw",
    });
    const message = msgResp.data;
    const { text, subject, html, attachments } = await parseEmail(
      Buffer.from(msgResp.data.raw, "base64").toString("utf-8")
    );

    const plainTextFromHtml = convert(html, {
      wordwrap: 130,
    });

    resp.status(200).json({
      subject,
      text,
      attachments,
      plainTextFromHtml,
    });
  } catch (error) {
    console.log("error while getting the specific mail:", error.message);
    resp.status(500).json({ message: error.message });
  }
};

//getMailList
export const getMailList = async (req, resp) => {
  try {
    oAuth2Client.setCredentials({
      access_token: req.user.accessToken,
    });

    google.options({ auth: oAuth2Client });
    const gmailClient = google.gmail("v1");

    const res = await gmailClient.users.messages.list({
      userId: "me",
      maxResults: 10,
    });

    const messages = res.data.messages;

    //also get sender's mailid
    const messageDetails = await Promise.all(
      messages.map(async (message) => {
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

    resp
      .status(200)
      .json({ mailList: messageDetails, length: messages.length });
  } catch (error) {
    console.log("error while getting user mails:", error.message);
    resp.status(500).json({ message: error.message });
  }
};

//getInbox
export async function getInbox(req, resp) {
  try {
    console.log(req.user.profile.displayName);
    oAuth2Client.setCredentials({
      access_token: req.user.accessToken,
    });

    google.options({ auth: oAuth2Client });
    const gmailClient = google.gmail("v1");

    const emailsResponse = await gmailClient.users.messages.list({
      userId: "me",
      labelIds: ["INBOX"],
      q: "is:unread", //only those which are unseen
      maxResults: 10,
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

    resp.status(200).json({ messages, length: messages.length });
  } catch (error) {
    console.log("error while getting user mails:", error.message);
    resp.status(500).json({ message: error.message });
  }
}

export async function getLabels(req, resp) {
  try {
    oAuth2Client.setCredentials({
      access_token: req.user.accessToken,
    });

    google.options({ auth: oAuth2Client });
    const gmailClient = google.gmail("v1");

    const { messageId } = req.params;
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

    resp.status(200).json({ label, response });
  } catch (error) {
    console.log("error while getting classifying mails:", error.message);
    resp.status(500).json({ message: error.message });
  }
}

//combines all (the do it all route)
export async function respondWithGen(req, resp) {
  try {
    oAuth2Client.setCredentials({
      access_token: req.user.accessToken,
    });

    google.options({ auth: oAuth2Client });
    const gmailClient = google.gmail("v1");

    const { messages } = await getInboxUtil(); //inbox sending 10 latest unseenn mails

    console.log("Only responding to label=Interested mails");

    const upperLimit = 3;
    let msgsReplied = 0;
    const classificationAndGenerationResults = [];
    //although this for loop is going to be slow
    //bbut it provides more control over controlling nature of api calls
    //by sync the messages one after another and not it parallel
    //to see how many msgs we have responed to
    for (const mail of messages) {
      const { label, response } = await classifyAndGenerateResponseUtil(
        mail.id,
        msgsReplied <= upperLimit
      ); //for each mail generayt a label but only a response when its labelled interested or when api limit has not exhausted

      console.log(`Labelled as: ${label}`);

      let replied = false;
      if (label === "Interested") {
        await sendMailUtil(mail.senderEmail, response);
        replied = true;
        msgsReplied++;
      }

      classificationAndGenerationResults.push({ label, response, replied });
    }

    /*messages.forEach(async (mail, ind) => {
      const { label, response } = await classifyAndGenerateResponseUtil(
        mail.id
      ); //for each mail generayt a label but only a response when its labelled interested or when api limit has not exhausted

      console.log(`Labelled as: ${label}`);

      if (label === "Interested") {
        await sendMailUtil(mail.senderEmail, response);
      }
    });*/

    resp.status(200).json({
      success: "mails sent",
      classificationAndGenerationResults,
    });
  } catch (error) {
    console.log("error while responding to mail:", error.message);
    resp.status(500).json({ message: error.message });
  }
}
