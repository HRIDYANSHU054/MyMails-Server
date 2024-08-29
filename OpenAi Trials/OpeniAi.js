import { config } from "dotenv";
config();

import OpenAI from "openai";

// const openai = new OpenAI({
//   // apiKey: `${process.env.OPENAI_KEY}`,
//   organization: "${process.env.OPENAI_KEY}",
// });
//using proxy version
const openai = new OpenAI({
  apiKey: "anything",
  baseURL: "http://localhost:3040/v1/",
});

export async function analyzeEmailContent(emailContent) {
  try {
    const messages = [
      {
        role: "user",
        content: `Classify the following email into one of these categories: Interested, Not Interested, More Information. You may also need to preprocess the email content into proper understandable text before classifying.\n\nEmail:\n"${"Hi How are you?"}"\n\nCategory:`,
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 10, //number of chars to generate in the output 1 token = 4 chars
      temperature: 0.5,
    });

    const label = response.data.choices[0].message.content.trim();

    console.log(response);
    return { label, response: response.data };
  } catch (error) {
    console.log("error in analyzing labels: ", error.message);
  }
}
