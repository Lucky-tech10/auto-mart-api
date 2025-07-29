const express = require("express");

const app = express();

app.use(express.json());

app.get("/api/v1", (req, res) => {
  res.send("Welcome to the auto mart API!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app; // for testing
