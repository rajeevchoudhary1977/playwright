import fs from "fs-extra";

export const updateJSON = async (jsonFilePath, newContent = {}) => {
  const originalJson = await fs.readJson(jsonFilePath);
  const newJson = {...originalJson, ...newContent};
  await fs.writeJson(jsonFilePath, newJson);
}

export const formatDate = (initialDate) => {
  initialDate = new Date(initialDate);

  const dateFormat = new Intl.DateTimeFormat("en", {
    timeStyle: "short",
    dateStyle: "medium",
  });

  const finalDate = dateFormat.format(initialDate);

  return finalDate.toString();
};