const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || 'supersecretkey123';

app.use(cors());
app.use(express.json());

// ====================== AUTH ======================
app.post('/api/register', async (req, res) => {
  const { username, password, name, role = 'STAFF' } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({ data: { username, passwordHash: hash, name, role } });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  jwt.verify(token, SECRET, (err, u) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = u;
    next();
  });
};

// ====================== ANIMAL ======================
app.post('/api/animals', auth, async (req, res) => {
  const animal = await prisma.animal.create({ data: req.body });
  res.json(animal);
});

app.get('/api/animals', auth, async (req, res) => {
  res.json(await prisma.animal.findMany());
});

app.get('/api/animals/:id/history', auth, async (req, res) => {
  const animal = await prisma.animal.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { scans: { include: { user: true }, orderBy: { scanTimestamp: 'desc' } } }
  });
  res.json(animal);
});

// ====================== SCAN (QR + RFID) ======================
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

  console.log(`✅ ${scanMethod} Scan - Tag: ${tagCode}, Status: ${status}, User: ${userId}`);

  io.emit('scanUpdate', { scan, animal });
  res.json({ scan, status, message: duplicate ? 'Duplicate scan detected!' : 'Valid attendance marked' });
});

// ====================== DASHBOARD ======================
app.get('/api/dashboard', auth, async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalAnimals = await prisma.animal.count();
  const scannedToday = await prisma.scan.groupBy({
    by: ['animalId'],
    where: { scanTimestamp: { gte: today } }
  });

  const sick = await prisma.animal.count({ where: { status: 'SICK' } });
  const missing = await prisma.animal.count({ where: { status: 'MISSING' } });

  const notScanned = await prisma.animal.findMany({
    where: { scans: { none: { scanTimestamp: { gte: new Date(Date.now() - 86400000) } } } },
    take: 10
  });

  res.json({
    totalAnimals,
    presentToday: scannedToday.length,
    missingToday: totalAnimals - scannedToday.length,
    sickAnimals: sick,
    alerts: notScanned.length,
    notScannedAnimals: notScanned
  });
});

// ====================== DONATIONS / FINANCE ======================
app.post('/api/donations', auth, async (req, res) => {
  const { donorName, donorEmail, amount, animalId } = req.body;
  const billNumber = `BILL-${Date.now()}`;
  const donation = await prisma.donation.create({
    data: { donorName, donorEmail, amount, billNumber, animalId: animalId ? parseInt(animalId) : null }
  });
  res.json(donation);
});

app.get('/api/donations', auth, async (req, res) => {
  res.json(await prisma.donation.findMany({ include: { animal: true } }));
});

// Reports (simplified)
app.get('/api/reports/daily', auth, async (req, res) => {
  const data = await prisma.scan.findMany({ include: { animal: true, user: true }, orderBy: { scanTimestamp: 'desc' } });
  res.json(data);
});

// Socket
io.on('connection', () => console.log('Client connected'));

server.listen(process.env.PORT || 5000, () => {
  console.log(`✅ Backend running on http://localhost:${process.env.PORT || 5000}`);
});
