const express = require("express");
const router = express.Router();
const products = require("../data/products.json");

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product search APIs
 */

/**
 * @swagger
 * /products/search:
 *   get:
 *     tags: [Products]
 *     summary: Search products
 *     description: |
 *       Search products using a free-text query.
 *       Searches name, category, and description.
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         description: The search term to query products
 *         required: true
 *         schema:
 *           type: string
 *         example: running shoes
 *     responses:
 *       200:
 *         description: Matching products
 */
router.get("/search", (req, res) => {
  const q = (req.query.q || "").toLowerCase();

  const result = products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q)
  );

  res.json(result);
});

module.exports = router;