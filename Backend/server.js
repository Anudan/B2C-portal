const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

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
    password: 'admin',   // Change this to your MySQL password
    database: 'UrbanBarrels'
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database: UrbanBarrels');

    // Self-healing: Ensure products table has stock_quantity column
    const checkColumnsQuery = "SHOW COLUMNS FROM products LIKE 'stock_quantity'";
    db.query(checkColumnsQuery, (err, results) => {
        if (!err && results.length === 0) {
            console.log('Adding missing stock_quantity column to products table...');
            const addColumnQuery = "ALTER TABLE products ADD COLUMN stock_quantity INT DEFAULT 0 AFTER price";
            db.query(addColumnQuery, (err) => {
                if (err) console.error('Error adding stock_quantity column:', err);
                else console.log('Successfully added stock_quantity column.');
            });
        }
    });
});

// ============ FILE UPLOAD CONFIGURATION ============

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../assets/images/'));
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp + original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        // Accept only image files
        const allowedTypes = /jpeg|jpg|png|gif|webp|jfif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Image upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded'
        });
    }
    
    res.json({
        success: true,
        message: 'File uploaded successfully',
        filename: req.file.filename
    });
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
    const query = 'SELECT user_id, name, email, role FROM users WHERE email = ? AND password = ?';
    
    db.query(query, [email, password], (err, results) => {
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

// ============ PRODUCT MANAGEMENT API ENDPOINTS ============

// GET all products
app.get('/api/products', (req, res) => {
    const query = 'SELECT * FROM products ORDER BY created_at DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to fetch products' 
            });
        }
        
        res.json({ 
            success: true, 
            products: results 
        });
    });
});

// POST - Create new product
app.post('/api/products', (req, res) => {
    const { product_name, description, category, price, stock_quantity, image_url } = req.body;
    
    // Validate required fields
    if (!product_name || !price) {
        return res.status(400).json({ 
            success: false, 
            message: 'Product name and price are required' 
        });
    }
    
    const query = `INSERT INTO products 
        (product_name, description, category, price, stock_quantity, image_url) 
        VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.query(query, [
        product_name, 
        description || null, 
        category || null, 
        price, 
        stock_quantity || 0, 
        image_url || null
    ], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to create product' 
            });
        }
        
        res.status(201).json({ 
            success: true, 
            message: 'Product created successfully',
            product_id: result.insertId
        });
    });
});

// PUT - Update existing product
app.put('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const { product_name, description, category, price, stock_quantity, image_url, is_active } = req.body;
    
    // Validate required fields
    if (!product_name || !price) {
        return res.status(400).json({ 
            success: false, 
            message: 'Product name and price are required' 
        });
    }
    
    const query = `UPDATE products 
        SET product_name = ?, description = ?, category = ?, price = ?, 
            stock_quantity = ?, image_url = ?, is_active = ?
        WHERE product_id = ?`;
    
    db.query(query, [
        product_name, 
        description || null, 
        category || null, 
        price, 
        stock_quantity || 0, 
        image_url || null,
        is_active !== undefined ? is_active : true,
        productId
    ], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to update product' 
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Product updated successfully' 
        });
    });
});

// DELETE - Remove product (hard delete)
app.delete('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    
    // Hard delete - permanently remove from database
    const query = 'DELETE FROM products WHERE product_id = ?';
    
    db.query(query, [productId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to delete product' 
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Product deleted successfully' 
        });
    });
});

// ============ ORDER API ENDPOINTS ============

// POST - Place a new order
app.post('/api/orders', (req, res) => {
    const { firstName, lastName, email, address, city, phone, paymentMethod, items, totalAmount } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !address || !city || !phone || !items || !items.length || !totalAmount) {
        return res.status(400).json({
            success: false,
            message: 'Missing required order fields'
        });
    }

    const shippingAddress = `${address}, ${city}`;
    const userId = req.body.userId || null; // optional, if user is logged in

    // Step 1: Insert into orders table
    const orderQuery = `INSERT INTO orders (user_id, total_amount, status, shipping_address, contact_number)
                        VALUES (?, ?, 'pending', ?, ?)`;

    db.query(orderQuery, [userId, totalAmount, shippingAddress, phone], (err, orderResult) => {
        if (err) {
            console.error('Error creating order:', err);
            return res.status(500).json({ success: false, message: 'Failed to place order' });
        }

        const orderId = orderResult.insertId;

        // Step 2: Insert each item into order_items table
        const itemValues = items.map(item => [orderId, item.productId || null, item.quantity, item.price]);
        const itemsQuery = `INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES ?`;

        db.query(itemsQuery, [itemValues], (err) => {
            if (err) {
                console.error('Error inserting order items:', err);
                return res.status(500).json({ success: false, message: 'Order created but failed to save items' });
            }

            res.status(201).json({
                success: true,
                message: 'Order placed successfully',
                orderId: orderId
            });
        });
    });
});

// GET - Fetch all orders (admin use)
app.get('/api/orders', (req, res) => {
    const query = `
        SELECT o.order_id, o.total_amount, o.status, o.shipping_address, o.contact_number, o.created_at,
               u.name AS customer_name, u.email AS customer_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.user_id
        ORDER BY o.created_at DESC
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
        }
        res.json({ success: true, orders: results });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
