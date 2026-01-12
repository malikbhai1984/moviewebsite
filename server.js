
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const DB_FILE = 'database.json';
const CAT_FILE = 'categories.json'; // Nayi file categories ke liye

app.use(cors(), bodyParser.json(), express.static(__dirname));
app.use('/uploads', express.static('uploads'));

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const getData = () => fs.existsSync(DB_FILE) ? JSON.parse(fs.readFileSync(DB_FILE)) : [];
const getCats = () => fs.existsSync(CAT_FILE) ? JSON.parse(fs.readFileSync(CAT_FILE)) : ["movie", "naat", "drama", "tilawat"];

// API: Categories
app.get('/api/categories', (req, res) => res.json(getCats()));
app.post('/api/add-category', (req, res) => {
    let cats = getCats();
    if(!cats.includes(req.body.name)) cats.push(req.body.name);
    fs.writeFileSync(CAT_FILE, JSON.stringify(cats));
    res.json({ success: true });
});

// API: Content
app.get('/api/content', (req, res) => res.json(getData()));
app.post('/api/upload-image', upload.single('image'), (req, res) => res.json({ url: `/uploads/${req.file.filename}` }));

app.post('/api/save', (req, res) => {
    let db = getData();
    const { id, title, image, videoId, category, desc } = req.body;
    if (id) {
        const idx = db.findIndex(item => item.id == id);
        if (idx !== -1) db[idx] = { id, title, image, videoId, category, desc };
    } else {
        db.unshift({ id: Date.now(), title, image, videoId, category, desc });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    res.json({ success: true });
});

app.post('/api/delete', (req, res) => {
    let db = getData().filter(item => item.id != req.body.id);
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));
