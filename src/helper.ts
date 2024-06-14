import fs from "fs";
import path from "path";

function getUniqueFileName(dir: string, baseName: string, ext: string): string {
  let uniqueName = baseName;
  let counter = 1;

  while (fs.existsSync(path.join(dir, `${uniqueName}${ext}`))) {
    uniqueName = `${baseName}_${counter}`;
    counter++;
  }

  return `${uniqueName}${ext}`;
}

async function saveFile(
  filePath: string,
  fileName: string,
  extractedData: any
) {
  // Hardcoded directory path
  const outputDir = path.join(__dirname, "uploads", fileName);

  // Create the directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Ensure unique names for the original file and JSON file
  const uniqueOriginalFileName = getUniqueFileName(
    outputDir,
    fileName,
    path.extname(fileName)
  );
  const uniqueExtractedDataFileName = getUniqueFileName(
    outputDir,
    fileName,
    ".json"
  );

  // Copy the original file to the new directory with a unique name
  const originalFilePath = path.join(outputDir, uniqueOriginalFileName);
  fs.copyFileSync(filePath, originalFilePath);

  // Save the extracted data as JSON with a unique name
  const extractedDataPath = path.join(outputDir, uniqueExtractedDataFileName);
  fs.writeFileSync(
    extractedDataPath,
    JSON.stringify(extractedData, null, 2),
    "utf8"
  );

  console.log(`Files saved in ${outputDir}`);
  return { originalFilePath, extractedDataPath };
}

export default saveFile;
