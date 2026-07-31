import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import apiApp from "./src/api-app.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mount API routes
  app.use(apiApp);

  // Initialize Supabase client for OG Tag injection
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

  // Store Vite instance for dev mode HTML transformation
  let vite: any = null;

  // OG Tag injection middleware for specific dynamic routes
  app.get(['/edukasi/:id', '/cerita-konco/:id'], async (req, res, next) => {
    try {
      const isEdukasi = req.path.startsWith('/edukasi/');
      const isCeritaKonco = req.path.startsWith('/cerita-konco/');
      const id = req.params.id;
      
      let title = 'KoncoKemo | Konco Kemo - Pusat Pemberdayaan & Edukasi Pasien Kanker';
      let description = 'KoncoKemo (Konco Kemo) adalah Pusat Pemberdayaan, Edukasi dan Komunitas Pasien Kanker.';
      let imageUrl = 'https://koncokemo.com/logo-transparent.png';
      
      if (supabase) {
        if (isEdukasi) {
          const { data } = await supabase.from('edukasi').select('title, subtitle, media_url, media_type').eq('id', id).single();
          if (data) {
            title = `${data.title} - Edukasi KoncoKemo`;
            description = data.subtitle || description;
            imageUrl = data.media_type !== 'video' && data.media_url ? data.media_url : imageUrl;
          }
        } else if (isCeritaKonco) {
          const { data } = await supabase.from('cerita_konco').select('title, subtitle_hook, thumbnail_image').eq('id', id).single();
          if (data) {
            title = `${data.title} - Cerita Konco`;
            description = data.subtitle_hook || description;
            imageUrl = data.thumbnail_image || imageUrl;
          }
        }
      }
      
      const isProd = process.env.NODE_ENV === 'production';
      const indexPath = isProd 
        ? path.join(process.cwd(), 'dist', 'index.html') 
        : path.join(process.cwd(), 'index.html');
        
      let html = fs.readFileSync(indexPath, 'utf-8');
      
      const ogTags = `
      <!-- Open Graph / WA Share Preview injected by server -->
      <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
      <meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />
      <meta property="og:image" content="${imageUrl}" />
      <meta property="og:url" content="https://koncokemo.com${req.path}" />
      <meta property="og:type" content="article" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
      <meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />
      <meta name="twitter:image" content="${imageUrl}" />
      `;
      
      html = html.replace('</head>', `${ogTags}</head>`);
      
      if (!isProd && vite) {
         html = await vite.transformIndexHtml(req.originalUrl, html);
      }
      
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (err) {
      console.error("Error injecting OG tags:", err);
      next(); // Fallback to normal serving if it fails
    }
  });

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
    vite = await createViteServer({
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
