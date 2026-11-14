require('dotenv').config();
const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8080;

// ─── Firebase Init ────────────────────────────────────────────────────────────
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // On Render: stored as environment variable (JSON string)
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Local development: use the downloaded key file
  serviceAccount = require('./serviceAccountKey.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const classroomsCol = db.collection('classrooms');

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Routes ───────────────────────────────────────────────────────────────────

// Home – classroom entry form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// All classrooms list
app.get('/classrooms', async (req, res) => {
  try {
    const snapshot = await classroomsCol.orderBy('created_at', 'desc').get();
    const classrooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.render('classrooms', { classrooms });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading classrooms.');
  }
});

// Submit classroom form
app.post('/submit', async (req, res) => {
  try {
    const id = uuidv4();
    const {
      school_name, classroom_number, grade_class, class_teacher,
      num_tables, num_chairs, num_desks, num_whiteboards,
      num_fans, num_lights, num_computers, other_facilities,
      total_students, male_students, female_students
    } = req.body;

    const data = {
      school_name:       school_name || '',
      classroom_number:  classroom_number || '',
      grade_class:       grade_class || '',
      class_teacher:     class_teacher || '',
      num_tables:        parseInt(num_tables) || 0,
      num_chairs:        parseInt(num_chairs) || 0,
      num_desks:         parseInt(num_desks) || 0,
      num_whiteboards:   parseInt(num_whiteboards) || 0,
      num_fans:          parseInt(num_fans) || 0,
      num_lights:        parseInt(num_lights) || 0,
      num_computers:     parseInt(num_computers) || 0,
      other_facilities:  other_facilities || '',
      total_students:    parseInt(total_students) || 0,
      male_students:     parseInt(male_students) || 0,
      female_students:   parseInt(female_students) || 0,
      created_at:        admin.firestore.FieldValue.serverTimestamp()
    };

    await classroomsCol.doc(id).set(data);
    res.redirect(`/success/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving classroom data: ' + err.message);
  }
});

// Success page with QR code
app.get('/success/:id', async (req, res) => {
  try {
    const doc = await classroomsCol.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).send('Classroom not found.');

    const classroom = { id: doc.id, ...doc.data() };
    const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
    const classroomUrl = `${BASE_URL}/classroom/${classroom.id}`;

    const qrCodeDataUrl = await QRCode.toDataURL(classroomUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#1a237e', light: '#ffffff' }
    });

    res.render('success', { classroom, qrCodeDataUrl, classroomUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating QR code.');
  }
});

// Classroom info display page (opened when QR is scanned)
app.get('/classroom/:id', async (req, res) => {
  try {
    const doc = await classroomsCol.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    const classroom = { id: doc.id, ...doc.data() };
    res.render('classroom', { classroom });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading classroom.');
  }
});

// API: QR code as data URL
app.get('/api/qr/:id', async (req, res) => {
  try {
    const doc = await classroomsCol.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });

    const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
    const classroomUrl = `${BASE_URL}/classroom/${req.params.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(classroomUrl, {
      width: 400, margin: 2,
      color: { dark: '#1a237e', light: '#ffffff' }
    });

    res.json({ qrCode: qrCodeDataUrl, url: classroomUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ Smart Classroom System running at http://localhost:${PORT}\n`);
});
