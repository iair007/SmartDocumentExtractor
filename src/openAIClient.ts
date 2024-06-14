// openAIClient.ts
import OpenAI from "openai";
import fs from "fs";
import { functionSchema } from "./models/functionSchema";
import saveFile from "./helper";

import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const uploadPDF = async (filePath: string): Promise<string> => {
  const fileStream = fs.createReadStream(filePath);

  const response = await openai.files.create({
    file: fileStream,
    purpose: "assistants",
  });

  console.log("Uploaded file ID:", response.id);
  return response.id;
};

export const callOpenAIExtraction = async (
  filePath: string,
  fileName: string,
  messages: (string | string[] | { [key: string]: any })[]
): Promise<any> => {
  const formattedMessages: ChatCompletionMessageParam[] = messages.map(
    (message) => {
      if (typeof message === "string") {
        return { role: "user", content: message };
      } else if (Array.isArray(message)) {
        return { role: "user", content: message.join("\n") };
      } else {
        return { role: "user", content: JSON.stringify(message) };
      }
    }
  );

  const tools: ChatCompletionTool[] = [
    {
      type: "function",
      function: functionSchema,
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: formattedMessages,
    tools: tools,
    tool_choice: "required",
    max_tokens: 1500,
  });

  let extractedData;
  const responseMessage = response.choices[0].message;
  console.log(responseMessage);
  const toolCalls = responseMessage.tool_calls;
  if (toolCalls) {
    extractedData = JSON.parse(toolCalls[0].function.arguments);
    saveFile(filePath, fileName, extractedData);

    return extractedData;
  } else {
    throw new Error(
      "No function call in response from OpenAI. response: " + responseMessage
    );
  }
};
