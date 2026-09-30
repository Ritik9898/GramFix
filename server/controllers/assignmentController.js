const pool = require("../config/db");

// ============================================
// ADMIN: ASSIGN REPORT TO WORKER
// ============================================

const assignReport = async (req, res) => {
  try {
    const { report_id, worker_id } = req.body;

    // Validate input
    if (!report_id || !worker_id) {
      return res.status(400).json({
        success: false,
        message: "report_id and worker_id are required",
      });
    }

    // Check worker exists and has worker role
    const workerResult = await pool.query(
      `
      SELECT id, name, email, role
      FROM users
      WHERE id = $1 AND role = 'worker'
      `,
      [worker_id],
    );

    if (workerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    // Check report exists
    const reportResult = await pool.query(
      `
      SELECT id, status
      FROM reports
      WHERE id = $1
      `,
      [report_id],
    );

    if (reportResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Check whether report has EVER been assigned
    const existingAssignment = await pool.query(
      `
  SELECT id, completed_at
  FROM assignments
  WHERE report_id = $1
  ORDER BY assigned_at DESC
  LIMIT 1
  `,
      [report_id],
    );

    if (existingAssignment.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Report has already been assigned and cannot be reassigned",
      });
    }
    // Create assignment
    const assignmentResult = await pool.query(
      `
      INSERT INTO assignments
        (report_id, worker_id)
      VALUES
        ($1, $2)
      RETURNING *
      `,
      [report_id, worker_id],
    );

    // Update report status
    await pool.query(
      `
      UPDATE reports
      SET
        status = 'assigned',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [report_id],
    );

    res.status(201).json({
      success: true,
      message: "Report assigned successfully",
      assignment: assignmentResult.rows[0],
      worker: workerResult.rows[0],
    });
  } catch (error) {
    console.error("Assignment error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while assigning report",
    });
  }
};

// ============================================
// ADMIN: GET ALL ASSIGNMENTS
// ============================================

const getAllAssignments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT

        -- Assignment
        a.id AS assignment_id,
        a.assigned_at,
        a.completed_at,

        -- Report
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
        r.updated_at,

        -- Citizen
        citizen.id AS citizen_id,
        citizen.name AS citizen_name,
        citizen.email AS citizen_email,

        -- Worker
        worker.id AS worker_id,
        worker.name AS worker_name,
        worker.email AS worker_email

      FROM assignments a

      -- Report information
      JOIN reports r
        ON a.report_id = r.id

      -- Citizen information
      JOIN users citizen
        ON r.user_id = citizen.id

      -- Worker information
      JOIN users worker
        ON a.worker_id = worker.id

      ORDER BY a.assigned_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      assignments: result.rows,
    });
  } catch (error) {
    console.error("Get assignments error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching assignments",
    });
  }
};

// ============================================
// EXPORT
// ============================================

module.exports = {
  assignReport,
  getAllAssignments,
};

// ============================================
// END
// ============================================
