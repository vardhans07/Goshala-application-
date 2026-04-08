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
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SECRET = process.env.JWT_SECRET || 'supersecretkey123';

app.use(cors());
app.use(express.json());

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  jwt.verify(token, SECRET, (err, u) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = u;
    next();
  });
};

// Auth
app.post('/api/register', async (req, res) => {
  const { username, password, name, role = 'STAFF', goshalaId } = req.body;
  if (!goshalaId) return res.status(400).json({ error: 'goshalaId is required' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({ 
      data: { username, passwordHash: hash, name, role, goshalaId: parseInt(goshalaId) } 
    });
    res.json({ message: 'User registered successfully', user });
  } catch (e) {
    if (e.code === 'P2002') return res.status(400).json({ error: 'Username already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role, goshalaId: user.goshalaId }, SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Animals
app.post('/api/animals', auth, async (req, res) => {
  const { photoUrl, age, ...data } = req.body;
  try {
    const animal = await prisma.animal.create({
      data: {
        ...data,
        age: age ? parseInt(age) : null,
        photoUrl: photoUrl || null,
        goshalaId: req.user.goshalaId
      }
    });
    const qrDataUrl = await QRCode.toDataURL(animal.tagCode, { width: 300 });
    await prisma.animal.update({ where: { id: animal.id }, data: { qrCodeUrl: qrDataUrl } });
    res.json({ ...animal, qrCodeUrl });
  } catch (e) {
    res.status(400).json({ error: e.code === 'P2002' ? 'Tag Code already exists' : 'Failed to register animal' });
  }
});

app.get('/api/animals', auth, async (req, res) => {
  const where = req.user.role === 'ADMIN' ? {} : { goshalaId: req.user.goshalaId };
  res.json(await prisma.animal.findMany({ where }));
});

app.put('/api/animals/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { photoUrl, age, ...data } = req.body;
  try {
    const updated = await prisma.animal.update({
      where: { id: parseInt(id) },
      data: { ...data, age: age ? parseInt(age) : null, photoUrl: photoUrl || null }
    });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: 'Failed to update animal' });
  }
});

// Scan
app.post('/api/scans', auth, async (req, res) => {
  const { tagCode, scanMethod = 'QR' } = req.body;
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
      scanMethod,
      status,
      isDuplicate: !!duplicate
    }
  });

  io.emit('scanUpdate', { scan, animal });
  res.json({ scan, status, message: duplicate ? 'Duplicate scan detected!' : 'Attendance marked successfully' });
});

// Dashboard
app.get('/api/dashboard', auth, async (req, res) => {
  const where = req.user.role === 'ADMIN' ? {} : { goshalaId: req.user.goshalaId };
  const totalAnimals = await prisma.animal.count({ where });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scannedToday = await prisma.scan.groupBy({
    by: ['animalId'],
    where: { scanTimestamp: { gte: today }, animal: where }
  });
  res.json({
    totalAnimals,
    presentToday: scannedToday.length,
    missingToday: totalAnimals - scannedToday.length,
    attendancePercent: totalAnimals ? Math.round((scannedToday.length / totalAnimals) * 100) : 0
  });
});

// FIXED EXCEL DOWNLOAD
app.get('/api/reports/excel', auth, async (req, res) => {
  try {
    const scans = await prisma.scan.findMany({ 
      include: { animal: true, user: true },
      orderBy: { scanTimestamp: 'desc' }
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Goshala Attendance');

    sheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Tag Code', key: 'tag', width: 15 },
      { header: 'Animal', key: 'name', width: 25 },
      { header: 'Scanned By', key: 'user', width: 20 },
      { header: 'Status', key: 'status', width: 12 }
    ];

    scans.forEach(s => {
      sheet.addRow({
        date: s.scanTimestamp.toISOString().split('T')[0],
        tag: s.animal.tagCode,
        name: s.animal.name || '-',
        user: s.user.name,
        status: s.status
      });
    });

    // CRITICAL FIX FOR PROPER .xlsx
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Goshala_Report_${new Date().toISOString().split('T')[0]}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate Excel report' });
  }
});

app.get('/api/reports/pdf', auth, async (req, res) => {
  const scans = await prisma.scan.findMany({ include: { animal: true, user: true } });
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Goshala_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  doc.pipe(res);
  doc.fontSize(20).text('Goshala Attendance Report', { align: 'center' });
  doc.moveDown();
  scans.forEach((s, i) => {
    doc.fontSize(12).text(`${i+1}. ${s.scanTimestamp.toISOString().split('T')[0]} | ${s.animal.tagCode} | ${s.user.name} | ${s.status}`);
    doc.moveDown(0.5);
  });
  doc.end();
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`✅ Goshala Backend running on http://localhost:5000`);
});