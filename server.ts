import fs from "fs";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini
  app.post("/api/generate-caption", async (req, res) => {
    try {
      const { keywords, type } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API Key is missing." });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      let prompt = "";
      if (type === 'product') {
        prompt = `คุณเป็นผู้ช่วยเขียนคำโฆษณาขายของออนไลน์ที่เก่งมาก โปรดเขียนแคปชันขายสินค้าให้น่าสนใจ เป็นกันเอง มีอีโมจิประกอบ และจบด้วยคำกระตุ้นการตัดสินใจ สั้นๆ ไม่เกิน 3-4 บรรทัด โดยอ้างอิงจากข้อมูลนี้: "${keywords}"`;
      } else {
        prompt = `คุณเป็นผู้ช่วยเขียนโพสต์ลงโซเชียลมีเดียชุมชน โปรดเขียนแคปชันให้ดูน่าสนใจ เป็นกันเอง มีอีโมจิประกอบ สั้นๆ ไม่เกิน 3-4 บรรทัด โดยอ้างอิงจากเรื่องราวนี้: "${keywords}"`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      res.json({ caption: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "ไม่สามารถสร้างข้อความได้ กรุณาลองใหม่" });
    }
  });

  
  app.post("/api/generate-summary", async (req, res) => {
    try {
      const { posts, products } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "API Key missing" });

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `คุณเป็นผู้ช่วยผู้ประกาศข่าวชุมชนอัจฉริยะ (AI Community Manager)
นี่คือข้อมูลโพสต์ล่าสุดในชุมชนจำนวน ${posts.length} โพสต์ และสินค้าตลาดนัด ${products.length} รายการ:

โพสต์ล่าสุด: ${JSON.stringify(posts)}
สินค้าล่าสุด: ${JSON.stringify(products)}

โปรดสรุปความเคลื่อนไหวในชุมชนวันนี้ให้สั้น กระชับ น่าอ่าน (ไม่เกิน 5-6 บรรทัด) แบ่งเป็น 2 ส่วนคือ:
1. 📰 สรุปข่าว/เรื่องราวเด่นในชุมชนวันนี้
2. 🛒 สินค้า/ของกินน่าสนใจในตลาดนัดวันนี้
ใช้ภาษาเป็นกันเอง มีอีโมจิประกอบ`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      res.json({ summary: response.text });
    } catch (error: any) {
      console.error("Gemini API Error (Summary):", error);
      res.status(500).json({ error: "ไม่สามารถสร้างข้อความสรุปได้" });
    }
  });

    // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
    
    app.use("*", async (req, res, next) => {
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
