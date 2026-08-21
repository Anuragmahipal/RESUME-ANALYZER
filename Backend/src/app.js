const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const multer = require("multer")

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)


/* central error handler: turns multer upload errors (bad file type,
   file too large) into clean JSON instead of Express's default HTML error page */
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                message: "File is too large. Max size is 5MB."
            })
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                message: "Unsupported file type. Please upload a PDF or DOCX resume."
            })
        }
        return res.status(400).json({ message: err.message })
    }

    console.error(err)
    res.status(err.status || 500).json({
        message: err.message || "Something went wrong"
    })
})

module.exports = app