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
    const endpoint = process.env.CUSTOM_VISION_ENDPOINT;
    const key = process.env.CUSTOM_VISION_KEY;
    const projectId = process.env.CUSTOM_VISION_PROJECT_ID;
    const iteration = process.env.CUSTOM_VISION_ITERATION;

    const cleanEndpoint = endpoint.replace(/\/$/, "");
    const url = `${cleanEndpoint}/customvision/v3.0/Prediction/${projectId}/classify/iterations/${iteration}/image`;
console.log("Custom Vision URL:", url);

    const response = await axios.post(url, req.file.buffer, {
      headers: {
        "Prediction-Key": key,
        "Content-Type": "application/octet-stream",
      },
    });

    const predictions = response.data.predictions || [];
    const best = predictions.sort((a, b) => b.probability - a.probability)[0];

    res.json({
      vehicleType: best?.tagName || "unknown",
      confidence: best?.probability || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
