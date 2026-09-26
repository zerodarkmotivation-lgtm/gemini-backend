import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();

// نرفع الحد لأن Screenshot بصيغة Base64 أكبر من الطلب النصي العادي
app.use(express.json({ limit: "15mb" }));

const apiKey =
  process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

app.get("/", (req, res) => {
  res.send("Gemini Backend is running");
});

app.post("/gemini", async (req, res) => {
  try {
    const { prompt, image, mimeType = "image/jpeg" } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "prompt is required"
      });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: "API Key is missing in Render environment variables!"
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    let contents;

    // الطلب النصي القديم
    if (!image) {
      contents = prompt;
    }

    // طلب نص + صورة
    else {
      // إزالة data:image/jpeg;base64, إذا أرسلها التطبيق
      const cleanBase64 = image.replace(
        /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
        ""
      );

      contents = [
        {
          text: prompt
        },
        {
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64
          }
        }
      ];
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: contents
    });

    res.json({
      result: response.text
    });

  } catch (error) {
    console.error("Gemini API Error:", error);

    res.status(500).json({
      error: error.message || "Gemini request failed"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
