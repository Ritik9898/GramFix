const express = require("express");

const {
  assignReport,
  getAllAssignments,
} = require("../controllers/assignmentController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin assigns a report
router.post("/", authenticateToken, authorizeRoles("admin"), assignReport);

// Admin views all assignments
router.get("/", authenticateToken, authorizeRoles("admin"), getAllAssignments);

module.exports = router;
