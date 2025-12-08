const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',        // Change this to your MySQL username
    password: 'admin',        // Change this to your MySQL password
    database: 'UrbanBarrels'
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database: UrbanBarrels');
});

// Login API endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Please provide both email and password' 
        });
    }

    // Query database for user with matching email
    const query = 'SELECT user_id, name, email, role FROM users WHERE email = ? AND password = ? AND role = ?';
    
    db.query(query, [email, password, 'admin'], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Server error occurred' 
            });
        }

        // Check if user found
        if (results.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // User authenticated successfully
        const user = results[0];
        res.json({ 
            success: true, 
            message: 'Login successful',
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    });
});

// Registration API endpoint (for customers)
app.post('/api/register', (req, res) => {
    const { name, email, password, dob } = req.body;

    // Validate input
    if (!name || !email || !password || !dob) {
        return res.status(400).json({ 
            success: false, 
            message: 'Please provide name, email, password, and date of birth' 
        });
    }

    // Check if email already exists
    const checkQuery = 'SELECT email FROM users WHERE email = ?';
    db.query(checkQuery, [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Server error occurred' 
            });
        }

        if (results.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        // Insert new user
        const insertQuery = 'INSERT INTO users (name, email, password, date_of_birth, role) VALUES (?, ?, ?, ?, ?)';
        db.query(insertQuery, [name, email, password, dob, 'customer'], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to register user' 
                });
            }

            res.status(201).json({ 
                success: true, 
                message: 'Registration successful',
                user: {
                    id: result.insertId,
                    name: name,
                    email: email,
                    role: 'customer'
                }
            });
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
