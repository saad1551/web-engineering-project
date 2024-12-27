const multer = require('multer');

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory where images will be stored
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Unique file name
    },
});


// Specify file format that can be saved
function fileFilter (req, file, cb) {
    if (
        file.mimetype === "jpg" | "png" | "jpeg"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }  
};
  
  
const upload = multer({ storage });

// File Size Formatter
const fileSizeFormatter = (bytes, decimalPlaces = 2) => {
  if (bytes < 0) {
      throw new Error('File size cannot be negative.');
  }

  // Convert bytes to kilobytes
  const kilobytes = bytes / 1024;

  // Round to the specified number of decimal places
  return kilobytes.toFixed(decimalPlaces);
};

module.exports = { upload, fileSizeFormatter };