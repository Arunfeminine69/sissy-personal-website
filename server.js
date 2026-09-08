const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'uploads');
const dataFile = path.join(__dirname, 'data.json');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function loadData() {
  if (!fs.existsSync(dataFile)) {
    return { media: [] };
  }

  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch {
    return { media: [] };
  }
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const safeName = file.originalname
      .replace(/[^a-zA-Z0-9._-]/g, '_');

    cb(null, Date.now() + '-' + safeName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 250 * 1024 * 1024
  }
});

app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(uploadDir));

/* Get all media */
app.get('/api/media', (req, res) => {
  const data = loadData();

  const items = data.media
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(items);
});

/* Upload media */
app.post('/api/media', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'No file uploaded'
    });
  }

  const data = loadData();

  const item = {
    id: Date.now().toString(),
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    caption: req.body.caption || '',
    createdAt: new Date().toISOString(),
    loves: 0,
    views: 0,
    tributes: [],
    comments: []
  };

  data.media.push(item);
  saveData(data);

  res.json(item);
});

/* Love ❤️ */
app.post('/api/media/:id/love', (req, res) => {
  const data = loadData();

  const item = data.media.find(x => x.id === req.params.id);

  if (!item) {
    return res.status(404).json({
      error: 'Post not found'
    });
  }

  item.loves = (item.loves || 0) + 1;

  saveData(data);

  res.json({
    loves: item.loves
  });
});

/* View 👁️ */
app.post('/api/media/:id/view', (req, res) => {
  const data = loadData();

  const item = data.media.find(x => x.id === req.params.id);

  if (!item) {
    return res.status(404).json({
      error: 'Post not found'
    });
  }

  item.views = (item.views || 0) + 1;

  saveData(data);

  res.json({
    views: item.views
  });
});

/* Add tribute 🕯️ */
app.post('/api/media/:id/tribute', (req, res) => {
  const data = loadData();

  const item = data.media.find(x => x.id === req.params.id);

  if (!item) {
    return res.status(404).json({
      error: 'Post not found'
    });
  }

  const message = String(req.body.message || '').trim();

  if (!message) {
    return res.status(400).json({
      error: 'Tribute message is required'
    });
  }

  if (message.length > 300) {
    return res.status(400).json({
      error: 'Tribute is too long'
    });
  }

  if (!Array.isArray(item.tributes)) {
    item.tributes = [];
  }

  item.tributes.push({
    id: Date.now().toString(),
    message,
    createdAt: new Date().toISOString()
  });

  saveData(data);

  res.json({
    tributes: item.tributes
  });
});

/* Add comment 💬 */
app.post('/api/media/:id/comment', (req, res) => {
  const data = loadData();

  const item = data.media.find(x => x.id === req.params.id);

  if (!item) {
    return res.status(404).json({
      error: 'Post not found'
    });
  }

  const name = String(req.body.name || 'Guest').trim();
  const message = String(req.body.message || '').trim();

  if (!message) {
    return res.status(400).json({
      error: 'Comment is required'
    });
  }

  if (message.length > 500) {
    return res.status(400).json({
      error: 'Comment is too long'
    });
  }

  if (!Array.isArray(item.comments)) {
    item.comments = [];
  }

  item.comments.push({
    id: Date.now().toString(),
    name: name.slice(0, 50),
    message,
    createdAt: new Date().toISOString()
  });

  saveData(data);

  res.json({
    comments: item.comments
  });
});

/* Delete media */
/* Edit caption */
app.put('/api/media/:id', (req, res) => {
  const data = loadData();

  const item = data.media.find(x => x.id === req.params.id);

  if (!item) {
    return res.status(404).json({ error: 'Post not found' });
  }

  item.caption = String(req.body.caption || '').trim().slice(0, 180);

  saveData(data);

  res.json(item);
});
app.delete('/api/media/:id', (req, res) => {
  const data = loadData();

  const index = data.media.findIndex(
    x => x.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      error: 'Post not found'
    });
  }

  const item = data.media[index];

  const filePath = path.join(uploadDir, item.filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  data.media.splice(index, 1);
  saveData(data);

  res.json({
    success: true
  });
});

app.listen(PORT, () => {
  console.log(`Sissy website running on port ${PORT}`);
});