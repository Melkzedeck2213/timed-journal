import express, { Request, Response } from "express";
import cors from "cors";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer"; // Install with: pnpm add nodemailer
import crypto from "crypto"; // At the top of your file

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "melkzedeck2002",
  port: 5432,
});

const JWT_SECRET = "your_secret_key"; // Use env variable in production!

// --- AUTH MIDDLEWARE ---
function authMiddleware(req: Request, res: Response, next: Function) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    (req as any).userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// --- CODE GENERATOR ---
function generateCode() {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code
}

// --- SIGNUP ---
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  const code = generateCode();
  try {
    const result = await pool.query(
      "INSERT INTO users (email, password, is_verified, verification_code) VALUES ($1, $2, $3, $4) RETURNING id",
      [email, password, false, code]
    );
    // Send email (configure transporter for your email provider)
    const transporter = nodemailer.createTransport({
      // Example for Gmail:
      service: "gmail",
      auth: {
        user: "meshackzkl@gmail.com",
        pass: "jlyi psuj hffa ejji",
      },
    });
    await transporter.sendMail({
      from: "meshackzkl@gmail.com",
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is: ${code}`,
    });
    res.json({ userId: result.rows[0].id, message: "Verification code sent to email" });
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(400).json({ error: "Email already exists" });
    } else {
      console.log("Error during signup:", err);
      res.status(500).json({ error: "Signup failed" });
    }
  }
});

// --- LOGIN ---
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  const result = await pool.query("SELECT id, password FROM users WHERE email = $1", [email]);
  if (!result.rows.length || result.rows[0].password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ userId: result.rows[0].id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

// --- VERIFY CODE ---
app.post("/verify", async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: "Email and code required" });
  const result = await pool.query(
    "SELECT id, verification_code FROM users WHERE email = $1",
    [email]
  );
  if (!result.rows.length) return res.status(400).json({ error: "User not found" });
  if (result.rows[0].verification_code !== code)
    return res.status(400).json({ error: "Invalid code" });

  await pool.query(
    "UPDATE users SET is_verified = true, verification_code = NULL WHERE email = $1",
    [email]
  );
  // Issue JWT token after verification
  const token = jwt.sign({ userId: result.rows[0].id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

// --- NOTES TABLE (ensure user_id column) ---
pool.query(`
  CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// --- GET NOTES (auth required) ---
app.get("/notes", authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  try {
    const result = await pool.query(
      "SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching notes:", error); // <-- Add this line
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- CREATE NOTE (auth required) ---
app.post("/notes", authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  const { text, created_at } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text is required" });
  }
  try {
    let result;
    if (created_at) {
      result = await pool.query(
        "INSERT INTO notes (user_id, text, created_at) VALUES ($1, $2, $3) RETURNING *",
        [userId, text, created_at]
      );
    } else {
      result = await pool.query(
        "INSERT INTO notes (user_id, text) VALUES ($1, $2) RETURNING *",
        [userId, text]
      );
    }
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log("Error adding note:", err); // <-- Add this line
    res.status(500).json({ error: "Failed to add note" });
  }
});

// --- FORGOT PASSWORD ---
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  // Generate a reset token (random string)
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetTokenExpires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes from now

  // Save token and expiry to user
  const result = await pool.query(
    "UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3 RETURNING id",
    [resetToken, resetTokenExpires, email]
  );
  if (!result.rowCount) return res.status(400).json({ error: "Email not found" });

  // Send email with reset link or code
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "meshackzkl@gmail.com",
      pass: "jlyi psuj hffa ejji",
    },
  });
  await transporter.sendMail({
    from: "meshackzkl@gmail.com",
    to: email,
    subject: "Password Reset",
    text: `Your password reset code is: ${resetToken}`,
  });

  res.json({ message: "Password reset code sent to email" });
});

// --- RESET PASSWORD ---
app.post("/reset-password", async (req, res) => {
  const { email, resetToken, newPassword } = req.body;
  if (!email || !resetToken || !newPassword)
    return res.status(400).json({ error: "All fields are required" });

  // Check token and expiry
  const result = await pool.query(
    "SELECT reset_token, reset_token_expires FROM users WHERE email = $1",
    [email]
  );
  if (
    !result.rows.length ||
    result.rows[0].reset_token !== resetToken ||
    new Date(result.rows[0].reset_token_expires) < new Date()
  ) {
    return res.status(400).json({ error: "Invalid or expired reset token" });
  }

  // Update password and clear reset token
  await pool.query(
    "UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE email = $2",
    [newPassword, email]
  );
  res.json({ message: "Password has been reset" });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



