const multer = require("multer")

const ALLOWED_MIME_TYPES = new Set([
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
])

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB, matches the "PDF or DOCX (Max 5MB)" UI copy
    },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
            return cb(null, true)
        }
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "resume"))
    }
})


module.exports = upload