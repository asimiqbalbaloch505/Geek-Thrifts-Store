import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET ?? "geekthrifts-fallback-secret";
const FRONTEND_PUBLIC = path.resolve(process.cwd(), "../geekthrifts/public");

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const slug = ((req.query.category as string) || "misc")
      .replace(/[^a-z0-9-]/gi, "")
      .toLowerCase() || "misc";
    const dir = path.join(FRONTEND_PUBLIC, "products", slug);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = path.basename(file.originalname, ext)
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()
      .slice(0, 40);
    cb(null, `${name}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

router.post("/upload", (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { role?: string };
    if (payload.role !== "admin") throw new Error("Not admin");
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}, upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  const slug = ((req.query.category as string) || "misc")
    .replace(/[^a-z0-9-]/gi, "")
    .toLowerCase() || "misc";
  const imageUrl = `/products/${slug}/${req.file.filename}`;
  res.json({ imageUrl });
});

export default router;
