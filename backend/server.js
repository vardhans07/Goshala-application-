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
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SECRET = process.env.JWT_SECRET || 'supersecretkey123';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const normalizeText = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const normalizeRole = (value) => normalizeText(value).toUpperCase();

const parseOptionalInt = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? NaN : parsed;
};

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isMobile = (value) => /^[6-9]\d{9}$/.test(value);

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  jwt.verify(token, SECRET, (err, u) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = u;
    next();
  });
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admin can perform this action' });
  }
  next();
};

// In-memory OTP store
// For production, move this to Redis or DB
const otpStore = new Map();

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, message: 'Backend and DB are working' });
  } catch (e) {
    console.error('Health check error:', e);
    res.status(500).json({ ok: false, error: 'Database connection failed' });
  }
});

app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        mobile: true,
        name: true,
        role: true,
        goshalaId: true
      },
      orderBy: { id: 'desc' }
    });

    res.json(users);
  } catch (e) {
    console.error('Debug users error:', e);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/goshalas', async (req, res) => {
  try {
    const q = normalizeText(req.query.q);

    const goshalas = await prisma.goshala.findMany({
      where: q
        ? {
            name: { contains: q, mode: 'insensitive' }
          }
        : {},
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        location: true
      }
    });

    res.json(goshalas);
  } catch (e) {
    console.error('Fetch goshalas error:', e);
    res.status(500).json({ error: 'Failed to load goshalas' });
  }
});

// SEND OTP - EMAIL ONLY
app.post('/api/register-owner/send-otp', async (req, res) => {
  const email = normalizeText(req.body.email).toLowerCase();
  const mobile = normalizeText(req.body.mobile);

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required for OTP' });
    }

    if (!isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore.set(email, {
      otp,
      expiresAt,
      verified: false,
      mobile: mobile || null
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Goshala Owner Registration OTP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>OTP Verification</h2>
          <p>Your OTP for Goshala Owner registration is:</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
        </div>
      `
    });

    return res.json({ message: 'OTP sent successfully to email' });
  } catch (e) {
    console.error('Send OTP error:', e);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// VERIFY OTP
app.post('/api/register-owner/verify-otp', async (req, res) => {
  const email = normalizeText(req.body.email).toLowerCase();
  const otp = normalizeText(req.body.otp);

  try {
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const otpData = otpStore.get(email);

    if (!otpData) {
      return res.status(400).json({ error: 'OTP not found. Please send OTP first' });
    }

    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP expired. Please request a new OTP' });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    otpStore.set(email, {
      ...otpData,
      verified: true
    });

    return res.json({ message: 'OTP verified successfully' });
  } catch (e) {
    console.error('Verify OTP error:', e);
    return res.status(500).json({ error: 'OTP verification failed' });
  }
});

// Register new goshala owner as ADMIN
app.post('/api/register-owner', async (req, res) => {
  const goshalaName = normalizeText(req.body.goshalaName);
  const location = normalizeText(req.body.location);
  const ownerName = normalizeText(req.body.ownerName);
  const username = normalizeText(req.body.username);
  const password = normalizeText(req.body.password);
  const email = normalizeText(req.body.email).toLowerCase();
  const mobile = normalizeText(req.body.mobile);

  if (!goshalaName || !ownerName || !username || !password) {
    return res.status(400).json({ error: 'Goshala name, owner name, username and password are required' });
  }

  if (!email && !mobile) {
    return res.status(400).json({ error: 'Email or mobile is required' });
  }

  if (email && !isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (mobile && !isMobile(mobile)) {
    return res.status(400).json({ error: 'Invalid mobile number' });
  }

  if (email) {
    const otpData = otpStore.get(email);

    if (!otpData || !otpData.verified) {
      return res.status(400).json({ error: 'Please verify OTP before registration' });
    }

    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP expired. Please verify again' });
    }
  }

  try {
    const existingGoshala = await prisma.goshala.findFirst({
      where: {
        OR: [
          { name: goshalaName },
          ...(email ? [{ ownerEmail: email }] : []),
          ...(mobile ? [{ ownerMobile: mobile }] : [])
        ]
      }
    });

    if (existingGoshala) {
      return res.status(400).json({ error: 'Goshala already exists with same name or owner contact' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          ...(email ? [{ email }] : []),
          ...(mobile ? [{ mobile }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username, email or mobile already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const goshala = await tx.goshala.create({
        data: {
          name: goshalaName,
          location: location || null,
          ownerEmail: email || null,
          ownerMobile: mobile || null
        }
      });

      const user = await tx.user.create({
        data: {
          username,
          email: email || null,
          mobile: mobile || null,
          passwordHash,
          name: ownerName,
          role: 'ADMIN',
          goshalaId: goshala.id
        }
      });

      return { goshala, user };
    });

    if (email) otpStore.delete(email);

    res.json({
      message: 'Goshala owner registered successfully as ADMIN',
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        mobile: result.user.mobile,
        name: result.user.name,
        role: result.user.role,
        goshalaId: result.user.goshalaId
      }
    });
  } catch (e) {
    console.error('Register owner error:', e);
    if (e.code === 'P2002') {
      return res.status(400).json({ error: 'Duplicate entry for username, email, mobile or goshala' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin creates staff only for same goshala
app.post('/api/staff', auth, adminOnly, async (req, res) => {
  const name = normalizeText(req.body.name);
  const username = normalizeText(req.body.username);
  const password = normalizeText(req.body.password);
  const email = normalizeText(req.body.email).toLowerCase();
  const mobile = normalizeText(req.body.mobile);

  if (!name || !username || !password) {
    return res.status(400).json({ error: 'Name, username and password are required' });
  }

  if (email && !isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (mobile && !isMobile(mobile)) {
    return res.status(400).json({ error: 'Invalid mobile number' });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          ...(email ? [{ email }] : []),
          ...(mobile ? [{ mobile }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username, email or mobile already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email: email || null,
        mobile: mobile || null,
        passwordHash,
        name,
        role: 'STAFF',
        goshalaId: req.user.goshalaId
      }
    });

    res.json({
      message: 'Staff created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        name: user.name,
        role: user.role,
        goshalaId: user.goshalaId
      }
    });
  } catch (e) {
    console.error('Create staff error:', e);
    if (e.code === 'P2002') {
      return res.status(400).json({ error: 'Duplicate username, email or mobile' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/register', async (req, res) => {
  const name = normalizeText(req.body.name);
  const emailOrMobile = normalizeText(req.body.emailOrMobile);
  const password = normalizeText(req.body.password);
  const goshalaId = parseOptionalInt(req.body.goshalaId);

  if (!name || !emailOrMobile || !password || goshalaId === null) {
    return res.status(400).json({ error: 'All required fields must be filled' });
  }

  if (Number.isNaN(goshalaId)) {
    return res.status(400).json({ error: 'Invalid goshalaId' });
  }

  if (!isEmail(emailOrMobile) && !isMobile(emailOrMobile)) {
    return res.status(400).json({ error: 'Enter valid email or 10-digit mobile number' });
  }

  try {
    const goshala = await prisma.goshala.findUnique({
      where: { id: goshalaId }
    });

    if (!goshala) {
      return res.status(400).json({ error: 'Selected goshala does not exist' });
    }

    const existingAdmin = await prisma.user.findFirst({
      where: {
        goshalaId,
        role: 'ADMIN'
      }
    });

    if (existingAdmin) {
      return res.status(400).json({
        error: 'This goshala already has one admin. Please login or contact support.'
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: emailOrMobile },
          ...(isEmail(emailOrMobile) ? [{ email: emailOrMobile.toLowerCase() }] : []),
          ...(isMobile(emailOrMobile) ? [{ mobile: emailOrMobile }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email or mobile already registered' });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username: emailOrMobile,
        email: isEmail(emailOrMobile) ? emailOrMobile.toLowerCase() : null,
        mobile: isMobile(emailOrMobile) ? emailOrMobile : null,
        passwordHash: hash,
        name,
        role: 'ADMIN',
        goshalaId
      }
    });

    res.json({
      message: 'Goshala owner registered successfully as ADMIN',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        name: user.name,
        role: user.role,
        goshalaId: user.goshalaId
      }
    });
  } catch (e) {
    console.error('Register error:', e);
    if (e.code === 'P2002') {
      return res.status(400).json({ error: 'Email or mobile already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const identifier = normalizeText(req.body.identifier || req.body.username);
  const password = normalizeText(req.body.password);
  const goshalaId =
    req.body.goshalaId !== undefined && req.body.goshalaId !== null && req.body.goshalaId !== ''
      ? parseInt(req.body.goshalaId, 10)
      : null;

  if (!identifier || !password || goshalaId === null) {
    return res.status(400).json({ error: 'Identifier, password and goshala are required' });
  }

  if (Number.isNaN(goshalaId)) {
    return res.status(400).json({ error: 'Invalid goshalaId' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        goshalaId,
        OR: [
          { username: identifier },
          { email: identifier.toLowerCase() },
          { mobile: identifier }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);

    if (!passwordOk) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, goshalaId: user.goshalaId, username: user.username },
      SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        name: user.name,
        role: user.role,
        goshalaId: user.goshalaId
      }
    });
  } catch (err) {
    console.error('Login error =>', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users', auth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { goshalaId: req.user.goshalaId },
      select: {
        id: true,
        username: true,
        email: true,
        mobile: true,
        name: true,
        role: true,
        goshalaId: true,
        createdAt: true
      },
      orderBy: { id: 'desc' }
    });

    res.json(users);
  } catch (e) {
    console.error('Users list error:', e);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.put('/api/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const name = normalizeText(req.body.name);
    const email = normalizeText(req.body.email).toLowerCase();
    const mobile = normalizeText(req.body.mobile);

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.goshalaId !== req.user.goshalaId) {
      return res.status(403).json({ error: 'You cannot edit users of another goshala' });
    }

    if (user.role === 'ADMIN' && user.id !== req.user.id) {
      return res.status(403).json({ error: 'Another admin cannot be edited' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: name || user.name,
        email: email || user.email,
        mobile: mobile || user.mobile
      }
    });

    res.json({ message: 'User updated successfully', user: updated });
  } catch (e) {
    console.error('Update user error:', e);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.goshalaId !== req.user.goshalaId) {
      return res.status(403).json({ error: 'You cannot delete users of another goshala' });
    }
    if (user.role === 'ADMIN') {
      return res.status(403).json({ error: 'Admin cannot be deleted' });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'Staff deleted successfully' });
  } catch (e) {
    console.error('Delete user error:', e);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});


// Forgot Password - Send OTP
app.post('/api/forgot-password/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email || !isEmail(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(404).json({ error: 'No account found with this email' });

    const otp = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(email.toLowerCase(), { otp, expiresAt, verified: false });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Goshala QR - Password Reset OTP',
      html: `
        <h2>Password Reset OTP</h2>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP is valid for 10 minutes.</p>
      `
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
app.post('/api/forgot-password/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const lowerEmail = email.toLowerCase();

  try {
    const data = otpStore.get(lowerEmail);
    if (!data) return res.status(400).json({ error: 'No OTP request found' });
    if (Date.now() > data.expiresAt) {
      otpStore.delete(lowerEmail);
      return res.status(400).json({ error: 'OTP expired' });
    }
    if (data.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

    data.verified = true;
    otpStore.set(lowerEmail, data);

    res.json({ message: 'OTP verified successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Reset Password
app.post('/api/forgot-password/reset', async (req, res) => {
  const { email, newPassword } = req.body;
  const lowerEmail = email.toLowerCase();

  try {
    const data = otpStore.get(lowerEmail);
    if (!data || !data.verified) return res.status(400).json({ error: 'OTP not verified' });

    const user = await prisma.user.findUnique({ where: { email: lowerEmail } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email: lowerEmail },
      data: { passwordHash: hash }
    });

    otpStore.delete(lowerEmail);

    res.json({ message: 'Password reset successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const name = normalizeText(req.body.name);
    const email = normalizeText(req.body.email);
    const mobile = normalizeText(req.body.mobile);
    const message = normalizeText(req.body.message);

    if (!name || !email || !mobile || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const feedback = await prisma.feedback.create({
      data: { name, email, mobile, message }
    });

    res.json({
      message: 'Feedback submitted successfully',
      createdAt: feedback.createdAt,
      feedback
    });
  } catch (e) {
    console.error('Feedback error:', e);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

app.post('/api/animals', auth, async (req, res) => {
  const tagCode = normalizeText(req.body.tagCode);
  const name = normalizeText(req.body.name);
  const breed = normalizeText(req.body.breed);
  const healthNotes = normalizeText(req.body.healthNotes);
  const status = normalizeText(req.body.status) || 'ACTIVE';
  const photoUrl = req.body.photoUrl || null;
  const age = parseOptionalInt(req.body.age);

  try {
    if (!tagCode) return res.status(400).json({ error: 'Tag Code is required' });
    if (!breed) return res.status(400).json({ error: 'Breed is required' });
    if (Number.isNaN(age)) return res.status(400).json({ error: 'Age must be a valid number' });

    const animal = await prisma.animal.create({
      data: {
        tagCode,
        name: name || null,
        breed,
        age,
        healthNotes: healthNotes || null,
        photoUrl,
        status,
        goshalaId: req.user.goshalaId
      }
    });

    const qrDataUrl = await QRCode.toDataURL(animal.tagCode, { width: 160, margin: 1 });

    const updatedAnimal = await prisma.animal.update({
      where: { id: animal.id },
      data: { qrCodeUrl: qrDataUrl }
    });

    res.json(updatedAnimal);
  } catch (e) {
    console.error('Create animal error:', e);
    if (e.code === 'P2002') return res.status(400).json({ error: 'Tag Code already exists' });
    res.status(400).json({ error: 'Failed to register animal' });
  }
});

app.get('/api/animals', auth, async (req, res) => {
  try {
    const where = { goshalaId: req.user.goshalaId };
    const animals = await prisma.animal.findMany({
      where,
      orderBy: { id: 'desc' }
    });
    res.json(animals);
  } catch (e) {
    console.error('Fetch animals error:', e);
    res.status(500).json({ error: 'Failed to fetch animals' });
  }
});

app.put('/api/animals/:id', auth, adminOnly, async (req, res) => {
  const parsedId = parseInt(req.params.id, 10);
  const tagCode = normalizeText(req.body.tagCode);
  const name = normalizeText(req.body.name);
  const breed = normalizeText(req.body.breed);
  const healthNotes = normalizeText(req.body.healthNotes);
  const status = normalizeText(req.body.status) || 'ACTIVE';
  const photoUrl = req.body.photoUrl || null;
  const age = parseOptionalInt(req.body.age);

  try {
    const animal = await prisma.animal.findUnique({ where: { id: parsedId } });
    if (!animal) return res.status(404).json({ error: 'Animal not found' });
    if (animal.goshalaId !== req.user.goshalaId) {
      return res.status(403).json({ error: 'You cannot edit another goshala animal' });
    }
    if (Number.isNaN(age)) return res.status(400).json({ error: 'Age must be a valid number' });

    const updated = await prisma.animal.update({
      where: { id: parsedId },
      data: {
        tagCode: tagCode || animal.tagCode,
        name: name || null,
        breed: breed || animal.breed,
        age,
        healthNotes: healthNotes || null,
        photoUrl,
        status
      }
    });

    if (tagCode && tagCode !== animal.tagCode) {
      const qrDataUrl = await QRCode.toDataURL(tagCode, { width: 160, margin: 1 });
      const updatedWithQr = await prisma.animal.update({
        where: { id: parsedId },
        data: { qrCodeUrl: qrDataUrl }
      });
      return res.json(updatedWithQr);
    }

    res.json(updated);
  } catch (e) {
    console.error('Update animal error:', e);
    if (e.code === 'P2002') return res.status(400).json({ error: 'Tag Code already exists' });
    res.status(400).json({ error: 'Failed to update animal' });
  }
});

app.delete('/api/animals/:id', auth, adminOnly, async (req, res) => {
  try {
    const animal = await prisma.animal.findUnique({
      where: { id: parseInt(req.params.id, 10) }
    });

    if (!animal) return res.status(404).json({ error: 'Animal not found' });
    if (animal.goshalaId !== req.user.goshalaId) {
      return res.status(403).json({ error: 'You cannot delete another goshala animal' });
    }

    await prisma.animal.delete({ where: { id: parseInt(req.params.id, 10) } });
    res.json({ message: 'Animal deleted successfully' });
  } catch (e) {
    console.error('Delete animal error:', e);
    res.status(400).json({ error: 'Failed to delete animal' });
  }
});

app.post('/api/scans', auth, async (req, res) => {
  try {
    const tagCode = normalizeText(req.body.tagCode);
    const scanMethod = normalizeText(req.body.scanMethod) || 'QR';
    const userId = req.user.id;

    if (!tagCode) {
      return res.status(400).json({ status: 'INVALID', message: 'Tag code is required' });
    }

    const animal = await prisma.animal.findUnique({ where: { tagCode } });
    if (!animal) return res.status(404).json({ status: 'INVALID', message: 'Invalid tag' });

    if (animal.goshalaId !== req.user.goshalaId) {
      return res.status(403).json({ status: 'INVALID', message: 'This animal does not belong to your goshala' });
    }

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

    res.json({
      scan,
      status,
      message: duplicate ? 'Duplicate scan detected!' : 'Attendance marked successfully'
    });
  } catch (e) {
    console.error('Scan error:', e);
    res.status(500).json({ status: 'INVALID', message: 'Failed to process scan' });
  }
});

app.get('/api/dashboard', auth, async (req, res) => {
  try {
    const where = { goshalaId: req.user.goshalaId };
    const totalAnimals = await prisma.animal.count({ where });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scannedToday = await prisma.scan.groupBy({
      by: ['animalId'],
      where: {
        scanTimestamp: { gte: today },
        animal: where
      }
    });

    res.json({
      totalAnimals,
      presentToday: scannedToday.length,
      missingToday: totalAnimals - scannedToday.length,
      attendancePercent: totalAnimals ? Math.round((scannedToday.length / totalAnimals) * 100) : 0
    });
  } catch (e) {
    console.error('Dashboard error:', e);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

app.get('/api/reports/excel', auth, async (req, res) => {
  try {
    const where = { animal: { goshalaId: req.user.goshalaId } };
    const scans = await prisma.scan.findMany({
      where,
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

    scans.forEach((s) => {
      sheet.addRow({
        date: s.scanTimestamp.toISOString().split('T')[0],
        tag: s.animal.tagCode,
        name: s.animal.name || '-',
        user: s.user.name,
        status: s.status
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Goshala_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (e) {
    console.error('Excel report error:', e);
    res.status(500).json({ error: 'Failed to export Excel report' });
  }
});

app.get('/api/reports/pdf', auth, async (req, res) => {
  try {
    const where = { animal: { goshalaId: req.user.goshalaId } };
    const scans = await prisma.scan.findMany({
      where,
      include: { animal: true, user: true },
      orderBy: { scanTimestamp: 'desc' }
    });

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Goshala_Report_${new Date().toISOString().split('T')[0]}.pdf`);

    doc.pipe(res);
    doc.fontSize(20).text('Goshala Attendance Report', { align: 'center' });
    doc.moveDown();

    scans.forEach((s, i) => {
      doc.fontSize(12).text(
        `${i + 1}. ${s.scanTimestamp.toISOString().split('T')[0]} | ${s.animal.tagCode} | ${s.user.name} | ${s.status}`
      );
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (e) {
    console.error('PDF report error:', e);
    res.status(500).json({ error: 'Failed to export PDF report' });
  }
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`✅ Goshala Backend running on http://localhost:5000`);
});