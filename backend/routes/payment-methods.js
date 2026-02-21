const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const paymentFile = path.join(__dirname, "../data/payment-methods.json");

const readPayments = () => {
  const data = fs.readFileSync(paymentFile, "utf-8");
  return data ? JSON.parse(data) : [];
};

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment method read APIs
 */

/**
 * @swagger
 * /payment-methods/{userId}:
 *   get:
 *     tags: [Payment]
 *     summary: Get user's payment methods
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of payment methods
 */
router.get("/:userId", (req, res) => {
  const methods = readPayments();
  const userMethods = methods.filter(m => m.userId === req.params.userId);
  res.json(userMethods);
});


/**
 * @swagger
 * /payment-methods:
 *   post:
 *     tags: [Payment]
 *     summary: Add new payment method for user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - last4
 *               - expiryMonth
 *             properties:
 *               userId:
 *                 type: string
 *                 example: u101
 *               type:
 *                 type: string
 *                 example: VISA
 *               last4:
 *                 type: string
 *                 example: "4242"
 *               expiryMonth:
 *                 type: string
 *                 example: "12/26"
 *     responses:
 *       200:
 *         description: Payment method added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: card_1700000000000
 *                 userId:
 *                   type: string
 *                   example: u101
 *                 type:
 *                   type: string
 *                   example: VISA
 *                 last4:
 *                   type: string
 *                   example: "4242"
 *                 expiryMonth:
 *                   type: string
 *                   example: "12/26"
 */
router.post("/", (req, res) => {
  const { userId, type, last4, expiryMonth } = req.body;

  if (!/^\d{4}$/.test(last4)) {
    return res.status(400).json({ message: "Invalid last4 digits" });
  }

  const payments = readPayments();

  const newPayment = {
    id: `card_${Date.now()}`,
    userId,
    type,
    last4,
    expiryMonth
  };

  payments.push(newPayment);
  fs.writeFileSync(paymentFile, JSON.stringify(payments, null, 2));

  res.json(newPayment);
});

module.exports = router;