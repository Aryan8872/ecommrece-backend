import bodyParser from "body-parser"
import cors from "cors"
import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import { dbConnect } from "./config/db.config.js"
import productRouter from "./routes/product.route.js"
import userRouter from "./routes/user.route.js"
import upload from './utls/multer.js'
import dotenv from "dotenv"

dotenv.config()
const app = express()
const port = 8080

app.use(bodyParser.json())
app.use(cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE,PATCH",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}))
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploaded files are accessible for download/preview (optional)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// === 3) Routes ===
// Show a simple HTML form for testing
app.get("/", (req, res) => {
    res.send(`
    <h2>Upload a file</h2>
    <form method="POST" action="/upload" enctype="multipart/form-data">
      <input type="file" name="avatar" />
      <button type="submit">Upload</button>
    </form>
  `);
});

// Route that handles single-file upload under field name "avatar"
app.post("/upload", upload.single("avatar"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    res.send({
        message: "File uploaded successfully",
        file: {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            filenameOnServer: req.file.filename,
            url: `/uploads/${req.file.filename}`,
        },
    });
});



dbConnect()


app.use("/api", productRouter, userRouter)


app.listen(port, () => {
    console.log(`server is running at http://localhost:${port}`)
})