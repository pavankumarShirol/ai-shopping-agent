const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// File paths
const cartsFile = path.join(__dirname, "../data/carts.json");
const productsFile = path.join(__dirname, "../data/products.json");

// ---------- Helper functions ----------

const readCarts = () => {
  const data = fs.readFileSync(cartsFile, "utf-8");
  return data ? JSON.parse(data) : [];
};

const writeCarts = (data) => {
  fs.writeFileSync(cartsFile, JSON.stringify(data, null, 2));
};

const readProducts = () => {
  const data = fs.readFileSync(productsFile, "utf-8");
  return data ? JSON.parse(data) : [];
};

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart management APIs
 */

/**
 * @swagger
 * /cart/add:
 *   post:
 *     tags: [Cart]
 *     summary: Add product to cart
 *     description: Add a product to user's cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - productId
 *               - quantity
 *             properties:
 *               userId:
 *                 type: string
 *                 example: u101
 *               productId:
 *                 type: string
 *                 example: p101
 *               quantity:
 *                 type: number
 *                 example: 1
 *     responses:
 *       200:
 *         description: Product added to cart
 */
router.post("/add", (req, res) => {
  const { userId, productId, quantity } = req.body;

  const products = readProducts();
  const productExists = products.find(p => p.id === productId);

  if (!productExists) {
    return res.status(404).json({ message: "Product not found" });
  }

  const carts = readCarts();
  carts.push({ userId, productId, quantity });

  writeCarts(carts);

  res.json({ message: "Added to cart" });
});

/**
 * @swagger
 * /cart/{userId}:
 *   get:
 *     tags: [Cart]
 *     summary: Get user's cart (raw)
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User cart items
 */
router.get("/:userId", (req, res) => {
  const { userId } = req.params;

  const carts = readCarts();
  const userCart = carts.filter(c => c.userId === userId);

  res.json(userCart);
});

/**
 * @swagger
 * /cart/summary/{userId}:
 *   get:
 *     tags: [Cart]
 *     summary: Get cart summary with prices and totals
 *     description: Returns derived cart view with product details and total amount
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: u101
 *     responses:
 *       200:
 *         description: Cart summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       quantity:
 *                         type: number
 *                       itemTotal:
 *                         type: number
 *                 cartTotal:
 *                   type: number
 */
router.get("/summary/:userId", (req, res) => {
  const { userId } = req.params;

  const carts = readCarts();
  const products = readProducts();

  const userCart = carts.filter(c => c.userId === userId);

  const items = userCart.map(c => {
    const product = products.find(p => p.id === c.productId);

    return {
      productId: c.productId,
      name: product.name,
      price: product.price,
      quantity: c.quantity,
      itemTotal: product.price * c.quantity
    };
  });

  const cartTotal = items.reduce(
    (sum, item) => sum + item.itemTotal,
    0
  );

  res.json({ items, cartTotal });
});

module.exports = router;