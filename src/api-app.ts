import express from "express";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());

// Supabase Client for Server-side Cron and OG Tags
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Store Vite instance for dev mode HTML transformation
// It can be injected from server.ts in local dev
(app as any).vite = null;

// OG Tag injection middleware for specific dynamic routes
app.get(['/edukasi/:id', '/cerita-konco/:id'], async (req, res, next) => {
  try {
    const isEdukasi = req.path.startsWith('/edukasi/');
    const isCeritaKonco = req.path.startsWith('/cerita-konco/');
    const id = req.params.id;
    
    let title = 'KoncoKemo | Konco Kemo - Pusat Pemberdayaan & Edukasi Pasien Kanker';
    let description = 'KoncoKemo (Konco Kemo) adalah Pusat Pemberdayaan, Edukasi dan Komunitas Pasien Kanker.';
    let imageUrl = 'https://www.koncokemo.com/logo-transparent.png';
    
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
    const isVercel = !!process.env.VERCEL;
    
    let html = '';
    
    if (isVercel) {
      // On Vercel, we fetch the base HTML from the live deployment itself.
      // This ensures we get the fully built HTML with correct Vite asset hashes,
      // avoiding serverless function filesystem constraints.
      const proto = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      try {
        const response = await fetch(`${proto}://${host}/`);
        html = await response.text();
      } catch (e) {
        console.error("Vercel fetch HTML error:", e);
        html = '<!DOCTYPE html><html><head></head><body>Error loading app</body></html>';
      }
    } else {
      // Local or Cloud Run (AI Studio) - read from disk
      const indexPath = isProd 
        ? path.join(process.cwd(), 'dist', 'index.html') 
        : path.join(process.cwd(), 'index.html');
      try {
        html = fs.readFileSync(indexPath, 'utf-8');
      } catch (e) {
        const fallbackPath = path.join(process.cwd(), 'index.html');
        html = fs.readFileSync(fallbackPath, 'utf-8');
      }
    }
    
    const canonicalTag = `<link rel="canonical" href="https://www.koncokemo.com${req.path}" />`;
    
    const ogTags = `
    <!-- Canonical & Open Graph injected by server -->
    ${canonicalTag}
    <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="https://www.koncokemo.com${req.path}" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="${imageUrl}" />
    `;
    
    // Replace default homepage canonical if present, otherwise append to head
    if (html.includes('<link rel="canonical" href="https://www.koncokemo.com/" />')) {
      html = html.replace('<link rel="canonical" href="https://www.koncokemo.com/" />', canonicalTag);
    } else if (html.includes('<link rel="canonical" href="https://koncokemo.com/" />')) {
      html = html.replace('<link rel="canonical" href="https://koncokemo.com/" />', canonicalTag);
    }
    html = html.replace('</head>', `${ogTags}</head>`);
    
    if (!isProd && (app as any).vite) {
       html = await (app as any).vite.transformIndexHtml(req.originalUrl, html);
    }
    
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
  } catch (err) {
    console.error("Error injecting OG tags:", err);
    next(); // Fallback to normal serving if it fails
  }
});

// API endpoints
app.get("/api/cron/ping", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!supabase) {
    console.error("Supabase client not initialized. Check environment variables.");
    return res.status(500).json({ error: "Supabase client not configured" });
  }

  try {
    const { data, error } = await supabase
      .from("ping_monitor")
      .upsert({ 
        id: 1, 
        last_ping: new Date().toISOString(),
        description: "Vercel Cron Ping to keep database active"
      })
      .select();

    if (error) throw error;
    res.json({ success: true, message: "Ping successful", timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error("Supabase ping failed:", error);
    res.status(500).json({ error: "Ping failed", details: error.message });
  }
});

app.post("/api/login", (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || "admin";
  
  if (password === adminPassword) {
    res.json({ token: "admin-session-token-123", success: true });
  } else {
    res.status(401).json({ error: "Password salah", success: false });
  }
});

app.post("/api/verify-session", (req, res) => {
  const { token } = req.body;
  if (token === "admin-session-token-123") {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false });
  }
});

export default app;
