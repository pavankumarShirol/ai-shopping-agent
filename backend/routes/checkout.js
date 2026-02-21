const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const addressesFile = path.join(__dirname, "../data/addresses.json");
const checkoutFile = path.join(__dirname, "../data/checkout.json");
const paymentFile = path.join(__dirname, "../data/payment-methods.json");

const readJson = (file) => {
  const data = fs.readFileSync(file, "utf-8");
  return data ? JSON.parse(data) : Array.isArray(file) ? [] : {};
};

const writeJson = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

const readAddresses = () => readJson(addressesFile);
const readCheckout = () => readJson(checkoutFile);

/**
 * @swagger
 * tags:
 *   name: Checkout
 *   description: Checkout selection APIs
 */

/**
 * @swagger
 * /checkout/select-address:
 *   post:
 *     tags: [Checkout]
 *     summary: Select shipping address for checkout
 *     description: Stores only addressId after validating ownership
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - addressId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: u101
 *               addressId:
 *                 type: string
 *                 example: addr1
 *     responses:
 *       200:
 *         description: Address selected
 *       400:
 *         description: Address does not belong to user
 */
router.post("/select-address", (req, res) => {
  const { userId, addressId } = req.body;

  const addresses = readAddresses();
  const valid = addresses.find(
    (a) => a.id === addressId && a.userId === userId
  );

  if (!valid) {
    return res.status(400).json({ message: "Address does not belong to user" });
  }

  const checkout = readCheckout();
  checkout[userId] = {
    ...(checkout[userId] || {}),
    addressId
  };

  writeJson(checkoutFile, checkout);
  res.json({ message: "Address selected for checkout" });
});


/**
 * @swagger
 * /checkout/select-payment:
 *   post:
 *     tags: [Checkout]
 *     summary: Select payment method for checkout
 *     description: CVV is required for validation but never stored
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - paymentMethodId
 *               - cvv
 *             properties:
 *               userId:
 *                 type: string
 *                 example: u101
 *               paymentMethodId:
 *                 type: string
 *                 example: card1
 *               cvv:
 *                 type: string
 *                 example: "123"
 *     responses:
 *       200:
 *         description: Payment method selected
 *       400:
 *         description: Invalid payment method
 */
router.post("/select-payment", (req, res) => {
  const { userId, paymentMethodId, cvv } = req.body;

  if (!/^\d{3,4}$/.test(cvv)) {
    return res.status(400).json({ message: "Invalid CVV" });
  }

  const payments = readJson(paymentFile);
  const valid = payments.find(
    p => p.id === paymentMethodId && p.userId === userId
  );

  if (!valid) {
    return res.status(400).json({ message: "Payment method does not belong to user" });
  }

  const checkout = readCheckout();
  checkout[userId] = {
    ...(checkout[userId] || {}),
    paymentMethodId
  };

  writeJson(checkoutFile, checkout);
  res.json({ message: "Payment method selected" });
});

module.exports = router;