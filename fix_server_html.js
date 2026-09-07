import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

const replacement = `  // Vite middleware for development
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
  } else {`;

content = content.replace(/(\/\/ Vite middleware for development\s+if \(process\.env\.NODE_ENV !== "production"\) \{[\s\S]*?app\.use\(vite\.middlewares\);\s*\}) else \{/, replacement);

fs.writeFileSync('server.ts', content);
