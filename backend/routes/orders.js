const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const cartsFile = path.join(__dirname, "../data/carts.json");
const checkoutFile = path.join(__dirname, "../data/checkout.json");
const productsFile = path.join(__dirname, "../data/products.json");
const addressesFile = path.join(__dirname, "../data/addresses.json");
const paymentsFile = path.join(__dirname, "../data/payment-methods.json");
const ordersFile = path.join(__dirname, "../data/orders.json");

const readJson = (file, fallback) => {
  const data = fs.readFileSync(file, "utf-8");
  return data ? JSON.parse(data) : fallback;
};

const writeJson = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order placement APIs
 */

/**
 * @swagger
 * /orders/place:
 *   post:
 *     tags: [Orders]
 *     summary: Place order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: u101
 *     responses:
 *       200:
 *         description: Order placed successfully
 */
router.post("/place", (req, res) => {
  const { userId } = req.body;

  const carts = readJson(cartsFile, []);
  const checkout = readJson(checkoutFile, {});
  const products = readJson(productsFile, []);
  const addresses = readJson(addressesFile, []);
  const payments = readJson(paymentsFile, []);
  const orders = readJson(ordersFile, []);

  const userCart = carts.filter(c => c.userId === userId);
  if (userCart.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const selection = checkout[userId];
  if (!selection?.addressId || !selection?.paymentMethodId) {
    return res.status(400).json({ message: "Checkout not completed" });
  }

  const address = addresses.find(a => a.id === selection.addressId);
  const payment = payments.find(p => p.id === selection.paymentMethodId);

  const items = userCart.map(c => {
    const product = products.find(p => p.id === c.productId);
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: c.quantity
    };
  });

  const totalAmount = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const order = {
    orderId: `ord_${Date.now()}`,
    userId,
    items,
    address,
    payment,
    totalAmount,
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  writeJson(ordersFile, orders);

  // clear cart
  const updatedCart = carts.filter(c => c.userId !== userId);
  writeJson(cartsFile, updatedCart);

  // clear checkout
  delete checkout[userId];
  writeJson(checkoutFile, checkout);

  res.json(order);
});

/**
 * @swagger
 * /orders/{userId}:
 *   get:
 *     tags: [Orders]
 *     summary: Get all orders for a user
 *     description: Returns full stored order history
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: u101
 *     responses:
 *       200:
 *         description: List of user orders
 */
router.get("/:userId", (req, res) => {
  const { userId } = req.params;

  const ordersFile = path.join(__dirname, "../data/orders.json");

  const ordersData = fs.readFileSync(ordersFile, "utf-8");
  const orders = ordersData ? JSON.parse(ordersData) : [];

  const userOrders = orders.filter(o => o.userId === userId);

  res.json(userOrders);
});

module.exports = router;