require("dotenv").config();
require("express-async-errors");

const express = require("express");

// routes
const authRoutes = require("./src/routes/authRoutes");

// error handler
const notFoundMiddleware = require("./src/middleware/not-found");
const errorHandlerMiddleware = require("./src/middleware/error-handler");

const app = express();

app.use(express.json());

app.get("/api/v1", (req, res) => {
  res.send("Welcome to the auto mart API!");
});

// routes
app.use("/api/v1/auth", authRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app; // for testing
