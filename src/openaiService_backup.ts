import fs from "fs";
import path from "path";
import { createWorker } from "tesseract.js";
import OpenAI from "openai";
import extractDataPrompt from "./prompt_backup";
import { functionSchema } from "./models/functionSchema";
import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources";

// Ensure that the OpenAI instance uses the API key from the environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, // Use non-null assertion since we ensure it's set in .env
});

export const processDocument = async (filePath: string): Promise<any> => {
  try {
    const fileName = path.basename(filePath);
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString("base64");

    // Use Tesseract.js to extract text from the image
    const worker = createWorker();
    (await worker).load();
    // await worker.loadLanguage("eng");
    //  await worker.initialize("eng");
    const {
      data: { text: extractedText },
    } = await (await worker).recognize(filePath);
    await (await worker).terminate();

    console.log("Extracted Text:", extractedText);

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: "Your system message here",
      },
      {
        role: "user",
        content: extractDataPrompt(extractedText, base64Image),
      },
    ];

    const tools: ChatCompletionTool[] = [
      {
        type: "function",
        function: functionSchema,
      },
    ];

    // Use OpenAI to structure the extracted text
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: messages,
      tools: tools,
      tool_choice: "auto",
      max_tokens: 1500,
    });

    let extractedData;
    const responseMessage = response.choices[0].message;

    // Check if the model wanted to call a function
    const toolCalls = responseMessage.tool_calls;
    if (toolCalls) {
      extractedData = JSON.parse(toolCalls[0].function.arguments);
      const outputFilePath = path.join(
        __dirname,
        "uploads",
        `${fileName}.json`
      );
      fs.writeFileSync(outputFilePath, JSON.stringify(extractedData, null, 2));
      return extractedData;
    } else {
      throw new Error("No function call in response from OpenAI.");
    }
  } catch (error) {
    console.error("Error in processDocument:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to process document: ${error.message}`);
    } else {
      throw new Error("Failed to process document: An unknown error occurred.");
    }
  }
};
