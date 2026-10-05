import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'isot2026-secret-jwt-key-conference-hyderabad';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Paths to storage
const DATA_DIR = path.join(__dirname, 'data');
const PROGRAMME_FILE = path.join(DATA_DIR, 'programme.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Admin Users
const DEFAULT_USERS = [
  {
    id: 'admin-1',
    username: 'admin',
    name: 'ISOT Organizing Committee Admin',
    email: 'admin@isot2026.com',
    role: 'super_admin',
    // Hash for 'admin123'
    passwordHash: bcrypt.hashSync('admin123', 10),
  },
  {
    id: 'admin-2',
    username: 'secretariat',
    name: 'Scientific Secretariat',
    email: 'secretariat@isot2026.com',
    role: 'editor',
    // Hash for 'isot2026'
    passwordHash: bcrypt.hashSync('isot2026', 10),
  },
];

// Initialize users file if missing
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(DEFAULT_USERS, null, 2), 'utf-8');
}

// Helper to read users
function getUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading users file:', err);
    return DEFAULT_USERS;
  }
}

// Helper to read programme
function getProgramme() {
  try {
    if (fs.existsSync(PROGRAMME_FILE)) {
      const raw = fs.readFileSync(PROGRAMME_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading programme file:', err);
  }
  return null;
}

// Helper to write programme
function saveProgramme(data) {
  try {
    fs.writeFileSync(PROGRAMME_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving programme file:', err);
    return false;
  }
}

// Authentication Middleware
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }
}

// ==========================================
// API ROUTES
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ISOT 2026 Conference Backend API',
  });
});

// Admin Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username/Email and Password are required' });
  }

  const users = getUsers();
  const user = users.find(
    (u) =>
      u.username.toLowerCase() === username.toLowerCase() ||
      u.email.toLowerCase() === username.toLowerCase()
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User not found.' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
  }

  // Generate JWT token (valid for 7 days)
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// Verify Current User Session
app.get('/api/auth/me', authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// Get Live Programme (Public for all attendees)
app.get('/api/programme', (req, res) => {
  const data = getProgramme();
  if (!data) {
    return res.json({
      hasCustomData: false,
      sessions: null,
      message: 'No custom backend data saved yet. Using baseline schedule.',
    });
  }

  res.json({
    hasCustomData: true,
    sessions: data.sessions || data,
    lastUpdated: data.lastUpdated || null,
    updatedBy: data.updatedBy || null,
  });
});

// Update Live Programme (PROTECTED: Admin Only)
app.put('/api/programme', authenticateAdmin, (req, res) => {
  const { sessions } = req.body;

  if (!sessions || !Array.isArray(sessions)) {
    return res.status(400).json({ error: 'Invalid programme payload. sessions array required.' });
  }

  const payload = {
    sessions,
    lastUpdated: new Date().toISOString(),
    updatedBy: req.user.name || req.user.username,
    version: Date.now(),
  };

  const success = saveProgramme(payload);
  if (!success) {
    return res.status(500).json({ error: 'Failed to persist programme changes on the server.' });
  }

  res.json({
    success: true,
    message: 'Programme updated successfully on server.',
    lastUpdated: payload.lastUpdated,
    updatedBy: payload.updatedBy,
    sessionCount: sessions.length,
  });
});

// Reset Programme to Baseline (PROTECTED: Admin Only)
app.post('/api/programme/reset', authenticateAdmin, (req, res) => {
  try {
    if (fs.existsSync(PROGRAMME_FILE)) {
      fs.unlinkSync(PROGRAMME_FILE);
    }
    res.json({
      success: true,
      message: 'Programme reset to official default schedule.',
    });
  } catch {
    res.status(500).json({ error: 'Failed to reset programme file.' });
  }
});

// Serve frontend in production if built
if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, '../dist'))) {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Start Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[ISOT 2026 Backend] Server running at http://localhost:${PORT}`);
  console.log(`[ISOT 2026 Backend] Health check: http://localhost:${PORT}/api/health`);
});

// Keep process active and log unhandled errors
process.on('uncaughtException', (err) => {
  console.error('[ISOT Backend Uncaught Exception]:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[ISOT Backend Unhandled Rejection]:', reason);
});

// Keep event loop active
setInterval(() => {}, 1 << 30);
