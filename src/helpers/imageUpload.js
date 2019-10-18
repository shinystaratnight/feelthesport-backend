const multer = require("multer");
const path = require("path");
const readChunk = require("read-chunk");
const fileType = require("file-type");

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype !== "image/jpeg" ||
      file.mimetype !== "image/jpg"
    ) {
      return cb(null, true);
    }

    cb(new Error("Only jpg/jpeg/png image files are allowed"));
  },
  limits: { fileSize: 1000000 }
}).single("uploadedImage");

module.exports = upload;
