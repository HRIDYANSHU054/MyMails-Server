import { simpleParser } from "mailparser";

export function cleanUpText(text) {
  // Replace common line break sequences with actual line breaks
  text = text.replace(/(\r\n|\n|\r)/g, "\n");

  // Remove unnecessary whitespace
  text = text.replace(/\s+/g, " ").trim();

  // Optionally format URLs to be more readable
  text = text.replace(/(https?:\/\/[^\s]+)/g, (url) => `<${url}>`);

  // Remove common footer or unsubscribe sections (customize this)
  text = text.replace(
    /(\n?Unsubscribe:.*\n?|\n?Help:.*\n?|\n?LinkedIn Corporation.*\n?)/g,
    ""
  );

  // Additional cleanup based on email content patterns
  text = text.replace(/-+\nThis email.*LinkedIn Corporation,.*\n-+/g, "");

  return text;
}

export async function parseEmail(rawEmail) {
  const parsed = await simpleParser(rawEmail);
  return {
    subject: parsed.subject,
    text: parsed.text,
    html: parsed.html,
    attachments: parsed.attachments,
  };
}
