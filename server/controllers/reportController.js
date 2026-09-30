const pool = require("../config/db");

// CREATE REPORT
const createReport = async (req, res) => {
  try {
    const { category, title, description, latitude, longitude, priority } =
      req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!category || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "Category, title and description are required",
      });
    }

    // Get uploaded image path
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Insert report into database
    const result = await pool.query(
      `INSERT INTO reports
            (
                user_id,
                category,
                title,
                description,
                image_url,
                latitude,
                longitude,
                priority
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
      [
        userId,
        category,
        title,
        description,
        imageUrl,
        latitude || null,
        longitude || null,
        priority || "medium",
      ],
    );

    const report = result.rows[0];

    // Create initial status history
    await pool.query(
      `INSERT INTO status_history
            (report_id, status, changed_by)
            VALUES ($1, $2, $3)`,
      [report.id, "submitted", userId],
    );

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      report,
    });
  } catch (error) {
    console.error("Create report error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating report",
    });
  }
};

// GET MY REPORTS
const getMyReports = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT *
             FROM reports
             WHERE user_id = $1
             ORDER BY created_at DESC`,
      [userId],
    );

    res.json({
      success: true,
      count: result.rows.length,
      reports: result.rows,
    });
  } catch (error) {
    console.error("Get reports error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching reports",
    });
  }
};

module.exports = {
  createReport,
  getMyReports,
};
