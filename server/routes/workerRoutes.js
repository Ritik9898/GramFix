const express = require("express");

const router = express.Router();

const {
  getMyAssignments,
  getMyAssignmentById,
  updateAssignmentStatus,
} = require("../controllers/workerController");

const authenticate = require("../middleware/authMiddleware");

// ==========================================
// WORKER ASSIGNMENTS
// ==========================================

// Get all assignments for logged-in worker
router.get("/assignments", authenticate, getMyAssignments);

// Get one assignment
router.get("/assignments/:id", authenticate, getMyAssignmentById);

// Update assignment/report status
router.put("/assignments/:id/status", authenticate, updateAssignmentStatus);

module.exports = router;
