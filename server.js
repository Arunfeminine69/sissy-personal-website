const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const MEDIA_DIR = path.join(ROOT, 'uploads');
const DATA_FILE = path.join(ROOT, 'media.json');

fs.mkdirSync(MEDIA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

app.use(express.json());
app.use(express.static(ROOT));
app.use('/uploads', express.static(MEDIA_DIR));

const allowed = new Set([
  'image/jpeg','image/png','image/webp','image/gif',
  'video/mp4','video/webm','video/quicktime'
]);

const storage = multer.diskStorage({
  destination: MEDIA_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, crypto.randomBytes(12).toString('hex') + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, allowed.has(file.mimetype))
});

function readMedia() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return []; }
}
function writeMedia(items) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}

app.get('/api/media', (req, res) => {
  res.json(readMedia().sort((a,b) => b.createdAt - a.createdAt));
});

app.post('/api/media', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Unsupported or missing file.' });
  const item = {
    id: crypto.randomUUID(),
    originalName: req.file.originalname,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    caption: String(req.body.caption || '').slice(0, 180),
    createdAt: Date.now()
  };
  const items = readMedia();
  items.push(item);
  writeMedia(items);
  res.status(201).json(item);
});

app.delete('/api/media/:id', (req, res) => {
  const items = readMedia();
  const index = items.findIndex(x => x.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  const [item] = items.splice(index, 1);
  const target = path.join(MEDIA_DIR, item.filename);
  if (fs.existsSync(target)) fs.unlinkSync(target);
  writeMedia(items);
  res.json({ ok: true });
});

app.get('*', (req, res) => res.sendFile(path.join(ROOT, 'index.html')));
app.listen(PORT, () => console.log(`Sissy site running at http://localhost:${PORT}`));
