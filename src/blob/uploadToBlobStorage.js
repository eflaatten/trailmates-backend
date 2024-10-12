const { put } = require("@vercel/blob");

const uploadToBlobStorage = async (fileBuffer, fileName) => {
  try {
    const { url } = await put(fileName, fileBuffer, {
      access: "public", 
      contentType: "image/jpeg", 
      token: process.env.BLOB_READ_WRITE_TOKEN, 
    });
    return url;
  } catch (error) {
    console.error("Blob storage upload error:", error);
    throw new Error("Failed to upload to blob storage");
  }
};

module.exports = { uploadToBlobStorage };
