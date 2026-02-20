const express = require("express");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication APIs
 */

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     tags: [Authentication]
 *     summary: Sign in user
 *     description: Sign in using email and password and receive a sessionId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   example: sess_abc123
 *       401:
 *         description: Invalid credentials
 */

router.post("/signin", (req, res) => {
  const { email, password } = req.body;

  // TEMP LOGIC (no DB yet)
  if (email === "user@gmail.com" && password === "123456") {
    return res.json({ sessionId: "sess_demo_123" });
  }

  res.status(401).json({ message: "Invalid credentials" });
});

module.exports = router;