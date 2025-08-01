const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png"];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Only .jpg and .png allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 }, // 1MB max
});

module.exports = upload;
