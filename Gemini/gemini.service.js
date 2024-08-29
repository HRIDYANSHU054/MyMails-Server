import { config } from "dotenv";
config();

import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiAI = new GoogleGenerativeAI(`${process.env.GEMINI_KEY}`);

export async function analyzeEmailContent(mailContent) {
  try {
    const model = geminiAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Classify the following email into one of these categories: Interested, Not Interested, More Information. You may also need to preprocess the email content into proper understandable text before classifying.\n\nEmail:\n"${mailContent}"\n\nCategory:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const label = response.candidates[0].content;

    const text = response.text();

    console.log(text);
    return { response: label, label: text };
  } catch (error) {
    console.log("error in fetching gemin api:", error.message);
  }
}

export async function generateMailResponse(label, mailContent) {
  try {
    let prompt;

    switch (label) {
      case "Interested":
        prompt = `Generate a response to the following email from my side showing interest based on the following email.You may also need to preprocess the email content into proper understandable text before generating response.\n\nEmail:\n"${mailContent}"`;
        break;
      case "Not Interested":
        prompt = `Generate a polite decline response to the following email from my side based on the following email.You may also need to preprocess the email content into proper understandable text before generating response.\n\nEmail:\n"${mailContent}"`;
        break;
      case "More Information":
        prompt = `Generate a response to the following email from my side requesting more information based on the following email.You may also need to preprocess the email content into proper understandable text before generating response.\n\nEmail:\n"${mailContent}"`;
        break;
      default:
        throw new Error("Invalid label");
    }

    const model = geminiAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      // model: "gemini-pro", //limit 2 reqs per minute
    }); // Choose the appropriate Gemini model

    const options = {
      temperature: 0.7,
      maxOutputTokens: 150,
    };

    const result = await model.generateContent(prompt, options);
    const response = result.response;
    const text = response.text();

    console.log(text.trim());

    return text.trim();
  } catch (error) {
    console.log("error while generating response to mails", error.message);
  }
}
