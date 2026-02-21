const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const addressesFile = path.join(__dirname, "../data/addresses.json");

const readAddresses = () => {
  const data = fs.readFileSync(addressesFile, "utf-8");
  return data ? JSON.parse(data) : [];
};

/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: User address APIs
 */

/**
 * @swagger
 * /addresses/{userId}:
 *   get:
 *     tags: [Addresses]
 *     summary: Get all addresses for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: u101
 *     responses:
 *       200:
 *         description: List of user addresses
 */
router.get("/:userId", (req, res) => {
  const { userId } = req.params;

  const addresses = readAddresses();
  const userAddresses = addresses.filter(a => a.userId === userId);

  res.json(userAddresses);
});


/**
 * @swagger
 * /addresses:
 *   post:
 *     tags: [Addresses]
 *     summary: Add new address for user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - label
 *               - area
 *               - city
 *               - pincode
 *             properties:
 *               userId:
 *                 type: string
 *                 example: u101
 *               label:
 *                 type: string
 *                 example: Home
 *               area:
 *                 type: string
 *                 example: Indiranagar
 *               city:
 *                 type: string
 *                 example: Bangalore
 *               pincode:
 *                 type: string
 *                 example: "560001"
 *     responses:
 *       200:
 *         description: Address created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: addr_1700000000000
 *                 userId:
 *                   type: string
 *                   example: u101
 *                 label:
 *                   type: string
 *                   example: Home
 *                 area:
 *                   type: string
 *                   example: Indiranagar
 *                 city:
 *                   type: string
 *                   example: Bangalore
 *                 pincode:
 *                   type: string
 *                   example: "560001"
 */
router.post("/", (req, res) => {
  const { userId, label, area, city, pincode } = req.body;

  const addresses = readAddresses();

  const newAddress = {
    id: `addr_${Date.now()}`,
    userId,
    label,
    area,
    city,
    pincode
  };

  addresses.push(newAddress);
  fs.writeFileSync(addressesFile, JSON.stringify(addresses, null, 2));

  res.json(newAddress);
});

module.exports = router;