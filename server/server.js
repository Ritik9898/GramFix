const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const workerRoutes = require("./routes/workerRoutes");

require("dotenv").config();

const pool = require("./config/db");

const app = express();

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/assignments", assignmentRoutes);
app.use("/api/worker", workerRoutes);

// Test API
app.get("/", (req, res) => {
  res.json({
    message: "GramFix API is running successfully 🚀",
  });
});

// Database test API
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "Database connection successful",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`GramFix server running on port ${PORT}`);
});
