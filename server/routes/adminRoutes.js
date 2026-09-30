const express = require("express");

const {
  getAllReports,
  getReportById,
  getAllWorkers,
} = require("../controllers/adminController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/reports",
  authenticateToken,
  authorizeRoles("admin"),
  getAllReports,
);

router.get(
  "/reports/:id",
  authenticateToken,
  authorizeRoles("admin"),
  getReportById,
);

router.get(
  "/workers",
  authenticateToken,
  authorizeRoles("admin"),
  getAllWorkers,
);

module.exports = router;
