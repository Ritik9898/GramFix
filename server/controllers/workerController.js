const pool = require("../config/db");

// ==========================================
// GET ALL ASSIGNMENTS FOR LOGGED-IN WORKER
// ==========================================
const getMyAssignments = async (req, res) => {
  try {
    const workerId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        a.id AS assignment_id,
        a.assigned_at,
        a.completed_at,
        r.id AS report_id,
        r.category,
        r.title,
        r.description,
        r.image_url,
        r.latitude,
        r.longitude,
        r.priority,
        r.status,
        r.created_at,
        r.updated_at
      FROM assignments a
      JOIN reports r
        ON a.report_id = r.id
      WHERE a.worker_id = $1
      ORDER BY a.assigned_at DESC
      `,
      [workerId],
    );

    res.json({
      success: true,
      count: result.rows.length,
      assignments: result.rows,
    });
  } catch (error) {
    console.error("Worker assignments error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching worker assignments",
    });
  }
};

// ==========================================
// GET ONE ASSIGNMENT
// ==========================================
const getMyAssignmentById = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        a.id AS assignment_id,
        a.assigned_at,
        a.completed_at,
        r.id AS report_id,
        r.category,
        r.title,
        r.description,
        r.image_url,
        r.latitude,
        r.longitude,
        r.priority,
        r.status,
        r.created_at,
        r.updated_at
      FROM assignments a
      JOIN reports r
        ON a.report_id = r.id
      WHERE a.id = $1
      AND a.worker_id = $2
      `,
      [id, workerId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.json({
      success: true,
      assignment: result.rows[0],
    });
  } catch (error) {
    console.error("Worker assignment error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching assignment",
    });
  }
};

// ==========================================
// UPDATE ASSIGNMENT STATUS
// ==========================================
const updateAssignmentStatus = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    // Status values allowed for workers
    const allowedStatuses = ["assigned", "in_progress", "resolved"];

    // Check status
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
        allowedStatuses: allowedStatuses,
      });
    }

    // Check whether assignment belongs to logged-in worker
    const assignment = await pool.query(
      `
      SELECT
        a.id AS assignment_id,
        a.report_id
      FROM assignments a
      WHERE a.id = $1
      AND a.worker_id = $2
      `,
      [id, workerId],
    );

    if (assignment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const reportId = assignment.rows[0].report_id;

    // Update report status
    const result = await pool.query(
      `
      UPDATE reports
      SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, title, status, updated_at
      `,
      [status, reportId],
    );

    // If resolved, mark assignment as completed
    if (status === "resolved") {
      await pool.query(
        `
        UPDATE assignments
        SET completed_at = CURRENT_TIMESTAMP
        WHERE id = $1
        `,
        [id],
      );
    }

    res.json({
      success: true,
      message: "Report status updated successfully",
      report: result.rows[0],
    });
  } catch (error) {
    console.error("Worker status update error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating report status",
    });
  }
};

// ==========================================
// EXPORT FUNCTIONS
// ==========================================
module.exports = {
  getMyAssignments,
  getMyAssignmentById,
  updateAssignmentStatus,
};
