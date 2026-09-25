import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.get("/", (req, res) => {
  res.send("Gemini Backend is running");
});

app.post("/gemini", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "prompt is required"
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    res.json({
      result: response.text
    });
  } catch (error) {
    console.error(error);

    // إرجاع تفاصيل الخطأ الحقيقية بدلاً من رسالة عامة
    res.status(500).json({
      error: error.message || "Gemini request failed",
      details: error.stack
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
