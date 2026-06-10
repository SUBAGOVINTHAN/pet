-- ================================================
-- PetStore E-Commerce Database Schema
-- Run this in MySQL Workbench or CLI:
-- mysql -u root -p < database.sql
-- ================================================

CREATE DATABASE IF NOT EXISTS petstore_db;
USE petstore_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2),
  stock INT DEFAULT 0,
  category_id INT,
  image VARCHAR(255),
  images JSON,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  pet_type ENUM('dog','cat','bird','fish','rabbit','other') DEFAULT 'other',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cart_item (user_id, product_id)
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_wishlist_item (user_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded') DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  payment_method ENUM('cod','stripe','razorpay') DEFAULT 'cod',
  payment_status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  payment_id VARCHAR(255),
  shipping_name VARCHAR(100),
  shipping_email VARCHAR(150),
  shipping_phone VARCHAR(20),
  shipping_address TEXT,
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(100),
  shipping_pincode VARCHAR(10),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_review (user_id, product_id)
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type ENUM('percentage','fixed') DEFAULT 'percentage',
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INT DEFAULT 100,
  used_count INT DEFAULT 0,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- SEED DATA
-- ================================================

-- Insert Categories
INSERT INTO categories (name, slug, description, image) VALUES
('Dog Food', 'dog-food', 'Premium nutrition for your dogs', '/uploads/cat-dog-food.jpg'),
('Cat Food', 'cat-food', 'Delicious food for cats', '/uploads/cat-cat-food.jpg'),
('Bird Supplies', 'bird-supplies', 'Everything for your birds', '/uploads/cat-bird.jpg'),
('Pet Accessories', 'pet-accessories', 'Toys, beds, and more', '/uploads/cat-accessories.jpg'),
('Health & Wellness', 'health-wellness', 'Vitamins and medicines', '/uploads/cat-health.jpg'),
('Grooming', 'grooming', 'Grooming tools and products', '/uploads/cat-grooming.jpg');

-- Insert Sample Products
INSERT INTO products (name, slug, description, price, discount_price, stock, category_id, image, is_featured, pet_type) VALUES
('Premium Dog Kibble', 'premium-dog-kibble', 'High protein, grain-free dog food for adult dogs. Made with real chicken and vegetables.', 1299.00, 999.00, 50, 1, '/uploads/product1.jpg', TRUE, 'dog'),
('Royal Canin Cat Food', 'royal-canin-cat-food', 'Scientifically formulated cat food for indoor cats with optimal digestive health.', 899.00, 749.00, 80, 2, '/uploads/product2.jpg', TRUE, 'cat'),
('Parrot Seed Mix', 'parrot-seed-mix', 'Nutritious seed mix for parrots with sunflower seeds, millet, and more.', 499.00, NULL, 100, 3, '/uploads/product3.jpg', FALSE, 'bird'),
('Dog Chew Toy Set', 'dog-chew-toy-set', 'Durable rubber chew toys for medium to large dogs. Non-toxic and safe.', 699.00, 549.00, 60, 4, '/uploads/product4.jpg', TRUE, 'dog'),
('Cat Scratching Post', 'cat-scratching-post', 'Tall sisal rope scratching post with cozy top perch for cats.', 1499.00, 1199.00, 30, 4, '/uploads/product1.jpg', TRUE, 'cat'),
('Pet Vitamin Drops', 'pet-vitamin-drops', 'Multi-vitamin supplement for dogs and cats. Supports immunity and coat health.', 399.00, NULL, 200, 5, '/uploads/product2.jpg', FALSE, 'other'),
('Dog Shampoo', 'dog-shampoo', 'Gentle, tear-free shampoo for dogs. Leaves coat shiny and fresh.', 299.00, 249.00, 150, 6, '/uploads/product3.jpg', FALSE, 'dog'),
('Automatic Pet Feeder', 'automatic-pet-feeder', 'Programmable auto feeder for cats and dogs. Holds up to 5L of dry food.', 2999.00, 2499.00, 25, 4, '/uploads/product4.jpg', TRUE, 'other');

-- Insert Admin User (password: Admin@123)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@petstore.com', '$2a$10$rOzEQ8vH9E3mQGJlEaTI5.eD5lFBGa5k.NaKJH.cFJLh/xH9xyaTi', 'admin');

-- Insert Sample Coupon
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, expires_at) VALUES
('WELCOME10', 'percentage', 10, 500, 1000, DATE_ADD(NOW(), INTERVAL 1 YEAR)),
('FLAT100', 'fixed', 100, 800, 500, DATE_ADD(NOW(), INTERVAL 6 MONTH));

DELIMITER $$
CREATE TRIGGER update_product_rating
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
  UPDATE products SET 
    rating = (SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id),
    reviews_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id)
  WHERE id = NEW.product_id;
END$$
DELIMITER ;

--db updation

USE petstore_db;

UPDATE categories SET name = 'Pets' WHERE slug = 'bird-supplies';
UPDATE categories SET name = 'Aquarium' WHERE slug = 'cat-food';
UPDATE categories SET name = 'Pet Foods' WHERE slug = 'dog-food';

-- Optional: Verify
SELECT id, name, slug FROM categories;


USE petstore_db;

UPDATE categories SET name = 'Pets'              WHERE slug = 'bird-supplies';
UPDATE categories SET name = 'Aquarium'          WHERE slug = 'cat-food';
UPDATE categories SET name = 'Pet Foods'         WHERE slug = 'dog-food';
UPDATE categories SET name = 'Grooming'          WHERE slug = 'grooming';
UPDATE categories SET name = 'Health & Wellness' WHERE slug = 'health-wellness';
UPDATE categories SET name = 'Pet Accessories'   WHERE slug = 'pet-accessories';

-- Check the changes
SELECT id, name, slug FROM categories;