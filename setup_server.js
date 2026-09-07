import fs from 'fs';

let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts.dev = "tsx server.ts";
pkg.scripts.build = "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs";
pkg.scripts.start = "node dist/server.cjs";

if (!pkg.dependencies['dotenv']) {
  pkg.dependencies['dotenv'] = '^16.4.5';
}
if (!pkg.dependencies['express']) {
  pkg.dependencies['express'] = '^4.19.2';
}

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

const serverCode = `import express from "express";
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
        prompt = \`คุณเป็นผู้ช่วยเขียนคำโฆษณาขายของออนไลน์ที่เก่งมาก โปรดเขียนแคปชันขายสินค้าให้น่าสนใจ เป็นกันเอง มีอีโมจิประกอบ และจบด้วยคำกระตุ้นการตัดสินใจ สั้นๆ ไม่เกิน 3-4 บรรทัด โดยอ้างอิงจากข้อมูลนี้: "\${keywords}"\`;
      } else {
        prompt = \`คุณเป็นผู้ช่วยเขียนโพสต์ลงโซเชียลมีเดียชุมชน โปรดเขียนแคปชันให้ดูน่าสนใจ เป็นกันเอง มีอีโมจิประกอบ สั้นๆ ไม่เกิน 3-4 บรรทัด โดยอ้างอิงจากเรื่องราวนี้: "\${keywords}"\`;
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(\`Server running on port \${PORT}\`);
  });
}

startServer();
`;

fs.writeFileSync('server.ts', serverCode);
