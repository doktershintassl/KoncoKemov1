import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

// Supabase Client for Server-side Cron
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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
