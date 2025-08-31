// middlewares/multer.js
import multer from "multer";
import path from "path";

const storage = multer.memoryStorage(); // File in memory, not disk

const fileFilter = (req, file, cb) => {
  // ✅ Use file.originalname, not file
  const ext = path.extname(file.originalname || "").toLowerCase();
  const allowedTypes = /jpeg|jpg|png|webp|gif/;

  if (allowedTypes.test(ext) && allowedTypes.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images (jpeg, jpg, png, webp, gif) are allowed"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

export default upload;
