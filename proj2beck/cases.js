const express = require("express");
const router = express.Router();
const mysql = require("mysql");

// Create MySQL Connection Pool
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "helloworld",
    database: "judicialsys",
    connectionLimit: 10,
});

// Middleware to ensure database connection
db.getConnection((err) => {
    if (err) {
        console.error("❌ Database connection error:", err.message);
    } else {
        console.log("✅ MySQL connected!");
    }
});

// Get all cases
router.get("/", (req, res) => {
    const sql = "SELECT * FROM cases WHERE status != 'Resolved' ORDER BY created_at DESC;";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get a specific case by ID
router.get("/:id", (req, res) => {
    const sql = "SELECT * FROM cases WHERE id = ?;";
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Case not found" });
        res.json(results[0]);
    });
});

// Add a new case
router.post("/", (req, res) => {
    console.log("✅ Received request at /cases with body:", req.body);

    const { case_number, case_type, court_id, status } = req.body;

    if (!case_number || !case_type || !court_id || !status) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const sql = "INSERT INTO cases (case_number, case_type, court_id, status) VALUES (?, ?, ?, ?);";
    
    db.query(sql, [case_number, case_type, parseInt(court_id), status], (err, result) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });
        res.json({ message: "✅ Case added successfully", id: result.insertId });
    });
});

// Update an existing case
router.put("/:id", (req, res) => {
    console.log("✏️ Updating case ID:", req.params.id, "with data:", req.body);

    const { case_number, case_type, court_id, status } = req.body;
    if (!case_number || !case_type || !court_id || !status) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const sql = "UPDATE cases SET case_number = ?, case_type = ?, court_id = ?, status = ? WHERE id = ?;";
    db.query(sql, [case_number, case_type, parseInt(court_id), status, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Case not found" });
        res.json({ message: "✅ Case updated successfully" });
    });
});

// Delete a case


module.exports = router;
