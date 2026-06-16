import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import apiApp from "./src/api-app.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mount API routes
  app.use(apiApp);

  // Automatically download the official high-resolution transparent logo from Google Drive
  const logoUrl = "https://lh3.googleusercontent.com/d/13A59jDQDvXFFvrpe9uvTdlusw3OKGM44";
  const publicDir = path.join(process.cwd(), "public");
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const logoTransparentPath = path.join(publicDir, "logo-transparent.png");

  // Keep a local try-catch so startup is never blocked but resources are gathered
  try {
    console.log("Fetching official KoncoKemo transparent logo...");
    const response = await fetch(logoUrl);
    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(logoTransparentPath, buffer);
      console.log("Successfully cached official logo-transparent.png");
    } else {
      console.warn("Could not download logo, status:", response.status);
    }
  } catch (error) {
    console.error("Error securing official logo resource:", error);
  }

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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
