# Creating Databas
CREATE DATABASE UrbanBarrels;
USE UrbanBarrels;
# Creating tables
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','customer') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

#Inserting admins
INSERT INTO users (name, email, password, role)
VALUES 
('Anudan Sainju', '123anudansainju@gmail.com', 'admin', 'admin'),
('Prajay Dutta', 'prajaydutta77@gmail.com', 'admin', 'admin'),
('Urban Barrels Admin', 'barrelsurban@gmail.com', 'admin', 'admin');

select * from users;

