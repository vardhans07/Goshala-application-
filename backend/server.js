const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const QRCode = require('qrcode');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SECRET = process.env.JWT_SECRET || 'supersecretkey123';

app.use(cors());
app.use(express.json());

// ====================== AUTH ======================
app.post('/api/register', async (req, res) => {
  const { username, password, name, role = 'STAFF' } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({ 
      data: { username, passwordHash: hash, name, role } 
    });
    res.json({ message: 'User registered successfully', user });
  } catch (e) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '24h' });
    res.json({ 
      token, 
      user: { id: user.id, name: user.name, role: user.role } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Auth Middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  jwt.verify(token, SECRET, (err, u) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = u;
    next();
  });
};

// Animal + QR (photo optional)
app.post('/api/animals', auth, async (req, res) => {
  const { photoUrl, ...data } = req.body;
  const animal = await prisma.animal.create({ 
    data: { ...data, photoUrl: photoUrl || null } 
  });
  const qrDataUrl = await QRCode.toDataURL(animal.tagCode, { width: 300 });
  await prisma.animal.update({ 
    where: { id: animal.id }, 
    data: { qrCodeUrl: qrDataUrl } 
  });
  res.json({ ...animal, qrCodeUrl });
});

app.get('/api/animals', auth, async (req, res) => {
  res.json(await prisma.animal.findMany());
});

// Scan
app.post('/api/scans', auth, async (req, res) => {
  const { tagCode, latitude, longitude, scanMethod = 'QR', notes = '' } = req.body;
  const userId = req.user.id;

  const animal = await prisma.animal.findUnique({ where: { tagCode } });
  if (!animal) return res.status(404).json({ status: 'INVALID', message: 'Invalid tag' });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const duplicate = await prisma.scan.findFirst({
    where: { animalId: animal.id, scanTimestamp: { gte: today } }
  });

  const status = duplicate ? 'DUPLICATE' : 'VALID';

  const scan = await prisma.scan.create({
    data: {
      animalId: animal.id,
      userId,
      latitude,
      longitude,
      scanMethod,
      status,
      isDuplicate: !!duplicate,
      notes
    }
  });

  io.emit('scanUpdate', { scan, animal });
  res.json({ scan, status, message: duplicate ? 'Duplicate scan detected!' : 'Valid attendance marked' });
});

// Dashboard
app.get('/api/dashboard', auth, async (req, res) => {
  const totalAnimals = await prisma.animal.count();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const scannedToday = await prisma.scan.groupBy({
    by: ['animalId'],
    where: { scanTimestamp: { gte: today } }
  });

  res.json({
    totalAnimals,
    presentToday: scannedToday.length,
    missingToday: totalAnimals - scannedToday.length,
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`✅ Goshala Backend running on http://localhost:5000`);
});