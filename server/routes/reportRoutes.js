const express = require("express");

const {
  createReport,
  getMyReports,
} = require("../controllers/reportController");

const authenticateToken = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Create report
router.post("/", authenticateToken, upload.single("image"), createReport);

// Get logged-in user's reports
router.get("/my", authenticateToken, getMyReports);

module.exports = router;
