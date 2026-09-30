const pool = require("../config/db");

// ============================================
// GET ALL REPORTS
// ============================================

const getAllWorkers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        email,
        role
      FROM users
      WHERE role = 'worker'
      ORDER BY name ASC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      workers: result.rows,
    });
  } catch (error) {
    console.error("Get all workers error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching workers",
    });
  }
};

// ============================================
// GET SINGLE REPORT
// ============================================

const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        r.*,

        -- Citizen information
        citizen.name AS citizen_name,
        citizen.email AS citizen_email,

        -- Assignment information
        a.id AS assignment_id,
        a.assigned_at,
        a.completed_at,

        -- Worker information
        worker.id AS worker_id,
        worker.name AS worker_name,
        worker.email AS worker_email

      FROM reports r

      -- Citizen
      JOIN users citizen
        ON r.user_id = citizen.id

      -- Assignment
      LEFT JOIN assignments a
        ON r.id = a.report_id

      -- Worker
      LEFT JOIN users worker
        ON a.worker_id = worker.id

      WHERE r.id = $1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.json({
      success: true,
      report: result.rows[0],
    });
  } catch (error) {
    console.error("Get report error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching report",
    });
  }
};

// ============================================
// EXPORT
// ============================================

module.exports = {
  getAllReports,
  getReportById,
  getAllWorkers,
};
