import fs from "fs";
import path from "path";
import { createWorker } from "tesseract.js";
import OpenAI from "openai";
import extractDataPrompt from "./prompt";
import { functionSchema } from "./models/functionSchema";
import saveFile from "./helper";

import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources";

// Ensure that the OpenAI instance uses the API key from the environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, // Use non-null assertion since we ensure it's set in .env
});

export const processDocument = async (
  filePath: string,
  originalname: string
): Promise<any> => {
  const fileName = path.basename(filePath);
  const fileExtension = path.extname(originalname).toLowerCase();

  if (fileExtension === ".pdf") {
    return await extractFromPdf(filePath, originalname);
  } else {
    return await extractFromImage(filePath, originalname);
  }
};

async function extractFromPdf(filePath: string, fileName: string) {
  try {
    const fileId = await uploadPDF(filePath);
    return await processPDF(fileId, fileName, filePath);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Function to upload a PDF file
const uploadPDF = async (filePath: string) => {
  const fileStream = fs.createReadStream(filePath);

  const response = await openai.files.create({
    file: fileStream,
    purpose: "assistants", // Specify 'assistants' to use this file for an AI assistant
  });

  console.log("Uploaded file ID:", response.id);
  return response.id;
};

async function callOpenAIExtraction(
  filePath: string,
  fileName: string,
  messages: ChatCompletionMessageParam[]
) {
  const tools: ChatCompletionTool[] = [
    {
      type: "function",
      function: functionSchema,
    },
  ];

  try {
    // Use OpenAI to structure the extracted text
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: messages,
      tools: tools,
      tool_choice: "required",
      max_tokens: 1500,
    });

    let extractedData;
    const responseMessage = response.choices[0].message;
    console.log(responseMessage);
    // Check if the model wanted to call a function
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
  } catch (error) {
    console.error("Error in processDocument:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to process document: ${error.message}`);
    } else {
      throw new Error("Failed to process document: An unknown error occurred.");
    }
  }
}

// Function to process the uploaded PDF file
const processPDF = async (
  fileId: string,
  fileName: string,
  filePath: string
) => {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: "You are a OCR system that can read PDFs.",
    },
    {
      role: "user",
      content: extractDataPrompt(true, fileId),
    },
  ];

  return await callOpenAIExtraction(filePath, fileName, messages);
};

async function extractFromImage(filePath: string, fileName: string) {
  const imageBuffer = fs.readFileSync(filePath);
  const base64Image = imageBuffer.toString("base64");

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: "You are a OCR tool. Extract the text from the image or pdf",
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: extractDataPrompt(false, base64Image),
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${base64Image}`,
          },
        },
      ],
    },
  ];

  return await callOpenAIExtraction(filePath, fileName, messages);
}
