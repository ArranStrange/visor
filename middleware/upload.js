const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const imageUploadPath = path.join(__dirname, "..", "uploads", "images");
const presetUploadPath = path.join(__dirname, "..", "uploads", "presets");

[imageUploadPath, presetUploadPath].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, imageUploadPath);
    } else if (file.originalname.endsWith(".xmp")) {
      cb(null, presetUploadPath);
    } else {
      cb(new Error("Unsupported file type"), null);
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, filename);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (
    ["image/jpeg", "image/png"].includes(file.mimetype) ||
    file.originalname.endsWith(".xmp")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image or .xmp files allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

// Export individual upload middlewares
exports.uploadImage = upload.single("image");
exports.uploadXmp = upload.single("xmp");
exports.uploadMultipleImages = upload.array("images", 6);
