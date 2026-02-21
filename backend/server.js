const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use("/auth", require("./routes/auth"));
app.use("/products", require("./routes/products"));
app.use("/cart", require("./routes/cart"));
app.use("/addresses", require("./routes/addresses"));
app.use("/checkout", require("./routes/checkout"));
app.use("/payment-methods", require("./routes/payment-methods"));
app.use("/orders", require("./routes/orders"));

app.listen(4000, () => {
  console.log("Server running on port 4000");
});