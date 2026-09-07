import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

const summaryEndpoint = `
  app.post("/api/generate-summary", async (req, res) => {
    try {
      const { posts, products } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "API Key missing" });

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = \`คุณเป็นผู้ช่วยผู้ประกาศข่าวชุมชนอัจฉริยะ (AI Community Manager)
นี่คือข้อมูลโพสต์ล่าสุดในชุมชนจำนวน \${posts.length} โพสต์ และสินค้าตลาดนัด \${products.length} รายการ:

โพสต์ล่าสุด: \${JSON.stringify(posts)}
สินค้าล่าสุด: \${JSON.stringify(products)}

โปรดสรุปความเคลื่อนไหวในชุมชนวันนี้ให้สั้น กระชับ น่าอ่าน (ไม่เกิน 5-6 บรรทัด) แบ่งเป็น 2 ส่วนคือ:
1. 📰 สรุปข่าว/เรื่องราวเด่นในชุมชนวันนี้
2. 🛒 สินค้า/ของกินน่าสนใจในตลาดนัดวันนี้
ใช้ภาษาเป็นกันเอง มีอีโมจิประกอบ\`;

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
`;

content = content.replace(/(\/\/ Vite middleware for development)/, summaryEndpoint + '\n  $1');
fs.writeFileSync('server.ts', content);
