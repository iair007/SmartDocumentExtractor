// extractDataService.ts
import fs from "fs";
import path from "path";
import extractDataPrompt from "./prompt";
import { uploadPDF, callOpenAIExtraction } from "./openAIClient";

export const processDocument = async (
  filePath: string,
  originalname: string
): Promise<any> => {
  const fileName = path.basename(filePath);
  const fileExtension = path.extname(originalname).toLowerCase();

  try {
    if (fileExtension === ".pdf") {
      return await extractFromPdf(filePath, originalname);
    } else {
      return await extractFromImage(filePath, originalname);
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

async function extractFromPdf(filePath: string, fileName: string) {
  try {
    const fileId = await uploadPDF(filePath);
    return await processPDF(fileId, fileName, filePath);
  } catch (error) {
    console.error("Error in extractFromPdf:", error);
    throw error;
  }
}

const processPDF = async (
  fileId: string,
  fileName: string,
  filePath: string
) => {
  const messages = [
    "You are an OCR system that can read PDFs.",
    extractDataPrompt(true, fileId),
  ];

  return await callOpenAIExtraction(filePath, fileName, messages);
};

async function extractFromImage(filePath: string, fileName: string) {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString("base64");

    const messages = [
      "You are an OCR tool. Extract the text from the image or pdf.",
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
    ];

    return await callOpenAIExtraction(filePath, fileName, messages);
  } catch (error) {
    console.error("Error in extractFromImage:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}
