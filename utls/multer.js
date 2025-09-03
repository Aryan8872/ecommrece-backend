// upload.js
import path from "path";
import multer from "multer";
import crypto from "crypto";
import { fileURLToPath } from "url";

// __dirname is not available in ES modules by default
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === 1) Configure storage ===
// diskStorage defines where and how files are saved on disk
const storage = multer.diskStorage({
  // destination decides the folder where files are stored
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads")); // store in ../uploads (project root)
  },
  // filename decides the saved file's name
  filename: function (req, file, cb) {
    // generate 16 random bytes, convert to hex, keep original extension
    const randomName = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname); // e.g. ".png"
    cb(null, randomName + ext);
  },
});

// === 2) Create upload middleware ===
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB file size limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only jpeg and png images in this example
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Only .png and .jpg images are allowed."));
    }
  },
});

export default upload;
