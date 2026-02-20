const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AI Shopping APIs",
      version: "1.0.0",
      description: "E-commerce APIs (will be used for MCP & Agents)"
    },
    servers: [
      { url: "http://localhost:4000" }
    ]
  },
  apis: ["./routes/*.js"]   // 🔥 auto-discovery
};

module.exports = swaggerJsdoc(options);