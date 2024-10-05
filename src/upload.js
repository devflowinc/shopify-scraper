import fs from "fs";

export const uploadToTrieve = async (options) => {
  const { file, api_key, dataset, url } = options;
  let fileChunks;

  try {
    const jsonFile = fs.readFileSync(file);
    fileChunks = JSON.parse(jsonFile);
  } catch {
    throw new Error("Invalid JSON File");
  }

  const chunkSize = 120;
  const chunkedItems = [];
  for (let i = 0; i < fileChunks.length; i += chunkSize) {
    const chunk = fileChunks.slice(i, i + chunkSize);
    chunkedItems.push(chunk);
  }

  for (const chunk of chunkedItems) {
    try {
      const options = {
        method: "POST",
        headers: {
          "TR-Dataset": dataset,
          Authorization: api_key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chunk),
      };

      const uploadedData = await fetch(
        `${url}/api/chunk`,
        options
      ).then((rsp) => rsp.json());
      if (!uploadedData.pos_in_queue) {
        console.error(`Failed to create chunk`);
        console.error(uploadedData);
      }
      console.log(`Uploaded chunk`);
    } catch (error) {
      console.error(`Failed to create chunk`);
      console.error(error);
    }
  }

  console.log("Uploaded to trieve");
};
