import { createBlob } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { file } = req.body; // Ensure the file is being sent properly

      // Check if file exists
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Create a new blob (upload the file)
      const blob = await createBlob(file);

      // Send the blob URL back to the client
      return res.status(200).json({ url: blob.url });
    } catch (error) {
      console.error("Error uploading file:", error);
      return res.status(500).json({ error: "File upload failed" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
