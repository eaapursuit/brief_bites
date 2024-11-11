// DEPENDENCIES
const express = require("express");
const cors = require("cors");
const newsRoutes = require("./routes/newsRoutes");

// CONFIGURATION
const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
})



// ROUTES
app.use("/api/newsSearches", newsRoutes);

// 404 PAGE
app.get("*", (req, res) => {
  res.status(404).send("Page not found");
});

// EXPORT
module.exports = app;