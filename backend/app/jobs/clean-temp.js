import path from "path";
import fs from "fs-extra";
import { logger } from "../configs/logger.js";
import { formatDate } from "../utils/helpers.js";

export const cleanTemp = async () => {
  try {
    const tempPath = path.join(__dirname, '../../public/temp');
    const downloadPath = path.join(tempPath, 'downloads');
    const placeholderPath = path.join(tempPath, "placeholder");
  
    await fs.emptyDir(downloadPath);
    await fs.emptyDir(placeholderPath);

    logger.info(`Cleaned temp at ${formatDate(new Date())}`);
  } catch (err) {
    logger.error(err);
  }  
}