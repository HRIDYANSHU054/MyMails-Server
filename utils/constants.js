import { config } from "dotenv";
config();

export const authOptions = {
  type: "OAuth2",
  user: process.env.USER,
  clientId: process.env.GMAIL_CLIENT_ID,
  clientSecret: process.env.GMAIL_CLIENT_SECRET,
  refreshToken: process.env.GMAIL_REFRESH_TOKEN,
};

export const mailOptions = {
  from: `${process.env.MAIL_FROM}`,
  to: `${process.env.MAIL_TO}`,
  subject: "Testing MyMails(Nodejs + GMail)",
};
