import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

app.get("/health", (req, res) => {
  res.json({ status: "API running" });
});

app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    const endpoint = process.env.VISION_ENDPOINT;
    const key = process.env.VISION_KEY;

    const response = await axios.post(
      `${endpoint}/computervision/imageanalysis:analyze?api-version=2024-02-01&features=tags,objects`,
      req.file.buffer,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Content-Type": "application/octet-stream"
        }
      }
    );

    const tags = response.data.tagsResult.values;

    res.json({
      vehicleType: tags[0]?.name || "unknown",
      confidence: tags[0]?.confidence || 0
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
