const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let upload;

// Check for Cloudinary credentials
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'samachar_uploads',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
  });

  upload = multer({ storage: storage });
  console.log('☁️  Cloudinary storage initialized for image uploads.');
} else {
  // Fallback to local storage
  const uploadDir = path.join(__dirname, '../public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png|webp/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);
      if (extname && mimetype) {
        return cb(null, true);
      }
      cb(new Error('Only images (JPEG/JPG/PNG/WEBP) are allowed'));
    }
  });
  
  // Export uploadDir for local serving
  module.exports.uploadDir = uploadDir;
  console.log('📁 Local disk storage initialized for image uploads.');
}

module.exports.upload = upload;
