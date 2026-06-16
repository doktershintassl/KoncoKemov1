-- Table to monitor pings to prevent Supabase from pausing
-- This table should only have 1 row that gets updated daily

CREATE TABLE IF NOT EXISTS ping_monitor (
    id INT PRIMARY KEY DEFAULT 1,
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT DEFAULT 'Vercel Cron Ping to keep database active'
);

-- Initial insert to ensure row 1 exists
INSERT INTO ping_monitor (id, last_ping, description)
VALUES (1, CURRENT_TIMESTAMP, 'Vercel Cron Ping to keep database active')
ON CONFLICT (id) DO NOTHING;
