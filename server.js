require("dotenv").config();
require("express-async-errors");

const express = require("express");

//
const helmet = require("helmet");
const cors = require("cors");
// const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

// routes
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const carRoutes = require("./src/routes/carRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const flagRoutes = require("./src/routes/flagRoutes");

// error handler
const notFoundMiddleware = require("./src/middleware/not-found");
const errorHandlerMiddleware = require("./src/middleware/error-handler");

const app = express();

app.use(express.json());

// app.set("trust proxy", 1);
// app.use(
//   rateLimiter({
//     windowMs: 15 * 60 * 1000,
//     max: 60, // limit each IP to 60 requests per windowMs
//   })
// );
app.use(helmet());
app.use(cors());
// app.use(xss());

app.get("/api/v1", (req, res) => {
  res.send("Welcome to the auto mart API!");
});

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/car", carRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/flag", flagRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = { app, server }; // for testing
