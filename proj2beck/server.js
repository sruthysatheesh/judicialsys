const express = require("express");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const casesRouter = require("./cases"); // Import cases.js

const app = express();
app.use(express.json());
app.use(cors()); // Allow frontend to call the backend
app.use("/cases", casesRouter);

// Create MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "helloworld",
    database: "judicialsys",
});

db.connect((err) => {
    if (err) throw err;
    console.log("✅ MySQL connected!");
});

// Login Route
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    console.log("🔹 Received login request:", username, password);

    if (!username || !password) {
        console.log("🔴 Missing credentials");
        return res.status(400).json({ message: "Username and password required" });
    }

    const sql = "SELECT * FROM users WHERE username = ?;";
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error("🔴 Database error:", err);
            return res.status(500).json({ error: err.message });
        }
    
        console.log("🔹 DB Query Result:", results); // Debugging log
    
        if (results.length === 0) {
            console.log("🔴 User not found in database");
            return res.status(400).json({ message: "User not found" });
        }
    
        const user = results[0];
        console.log("🔹 Extracted User Data:", user); // Log user object
    
        console.log(`🔹 Comparing password: Entered(${password}) vs Stored(${user.passwords})`);
    
        if (password.toString().trim() !== user.passwords.toString().trim()) {
            console.log("🔴 Passwords do not match!");
            return res.status(400).json({ message: "Invalid credentials" });
        }
    
        console.log("✅ Password match!");
    
        // Generate JWT Token
        const token = jwt.sign(
            { id: user.id, username: user.username, rolee: user.rolee },
            "your_secret_key",
            { expiresIn: "1h" }
        );
    
        console.log(`🔹 Sending response: id=${user.id}, rolee=${user.rolee}`);
    
        res.json({ 
            message: "Login successful", 
            token, 
            rolee: user.rolee,  
            id: user.id  // Ensure this is included
        });
    
    });
});


// Use Cases Routes
app.use("/cases", casesRouter);

// Start Server
app.listen(5000, () => {
    console.log("✅ Server running on port 5000");
});
