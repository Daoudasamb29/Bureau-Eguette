import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Supabase on the server side using SUPABASE_URL and SUPABASE_SERVICE_KEY
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const serverSupabase: SupabaseClient | null =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

// API Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Eguette OPS',
    supabaseConnected: Boolean(serverSupabase),
    timestamp: new Date().toISOString(),
  });
});

// API Routes proxying to Supabase or serving server-side logic
app.get('/api/commandes', async (req, res) => {
  if (serverSupabase) {
    try {
      const { data, error } = await serverSupabase
        .from('commandes')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return res.json(data);
      }
    } catch (e) {
      console.warn('Server Supabase fetch error:', e);
    }
  }
  res.json({ message: 'Fallback to client sync mode' });
});

app.get('/api/livreurs', async (req, res) => {
  if (serverSupabase) {
    try {
      const { data, error } = await serverSupabase
        .from('livreurs')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return res.json(data);
      }
    } catch (e) {
      console.warn('Server Supabase fetch error:', e);
    }
  }
  res.json({ message: 'Fallback to client sync mode' });
});

// Start dev Vite middleware or static files
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Eguette OPS running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
