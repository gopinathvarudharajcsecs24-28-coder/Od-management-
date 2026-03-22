import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import db from './db.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Ensure uploads directory exists
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  // Multer configuration for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  const upload = multer({ storage });

  // API Routes
  
  // User Management & Auth
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, role, department, year } = req.body;
    const id = Date.now().toString(); // Simple ID generation
    try {
      const stmt = db.prepare('INSERT INTO users (id, name, email, password, role, department, year) VALUES (?, ?, ?, ?, ?, ?, ?)');
      stmt.run(id, name, email, password, role, department || null, year || null);
      const user = db.prepare('SELECT id, name, email, password, role, department, year FROM users WHERE id = ?').get(id);
      res.json(user);
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: 'Email already exists' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    try {
      const user = db.prepare('SELECT id, name, email, password, role, department, year FROM users WHERE email = ? AND password = ?').get(email, password);
      if (user) {
        res.json(user);
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/users/:id', (req, res) => {
    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
      res.json(user || null);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put('/api/users/:id', (req, res) => {
    const { email, password, department, year } = req.body;
    try {
      const stmt = db.prepare('UPDATE users SET email = ?, password = ?, department = ?, year = ? WHERE id = ?');
      stmt.run(email, password, department || null, year || null, req.params.id);
      const user = db.prepare('SELECT id, name, email, password, role, department, year FROM users WHERE id = ?').get(req.params.id);
      res.json(user);
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: 'Email already exists' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.get('/api/admin/users', (req, res) => {
    try {
      const users = db.prepare('SELECT * FROM users').all();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // OD Requests
  app.post('/api/od', upload.single('proof'), (req, res) => {
    const { student_id, student_name, department, year, date, ongoing_time, arrival_time, reason } = req.body;
    const proof_file = (req as any).file ? (req as any).file.filename : null;
    
    try {
      const stmt = db.prepare(`
        INSERT INTO od_requests (student_id, student_name, department, year, date, ongoing_time, arrival_time, reason, proof_file)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(student_id, student_name, department, year || null, date, ongoing_time || null, arrival_time || null, reason, proof_file);
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/od', (req, res) => {
    const { student_id, role } = req.query;
    try {
      let requests;
      if (role === 'student') {
        requests = db.prepare('SELECT * FROM od_requests WHERE student_id = ? ORDER BY created_at DESC').all(student_id);
      } else {
        requests = db.prepare('SELECT * FROM od_requests ORDER BY created_at DESC').all();
      }
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put('/api/od/:id', (req, res) => {
    const { status, remarks } = req.body;
    try {
      const stmt = db.prepare('UPDATE od_requests SET status = ?, remarks = ? WHERE id = ?');
      stmt.run(status, remarks, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
