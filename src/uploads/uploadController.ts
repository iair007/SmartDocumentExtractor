import { Request, Response } from "express";
import { processDocument } from "../extractDataService";

export const handleFileUpload = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const filePath = req.file.path;
  const originalname = req.file.originalname;
  try {
    const jsonData = await processDocument(filePath, originalname);
    res.status(200).send(jsonData);
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error processing document. error: ${error}`);
  }
};
