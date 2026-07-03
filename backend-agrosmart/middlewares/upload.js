const multer = require('multer');
const path = require('path');
const fs = require('fs');

const productosDir = path.join(__dirname, '..', 'uploads', 'productos');
const cursosDir = path.join(__dirname, '..', 'uploads', 'cursos');
if (!fs.existsSync(productosDir)) fs.mkdirSync(productosDir, { recursive: true });
if (!fs.existsSync(cursosDir)) fs.mkdirSync(cursosDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tipo = req.params.tipo || 'productos';
        const dir = tipo === 'cursos' ? cursosDir : productosDir;
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `img-${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes JPG, PNG, WEBP o GIF'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
