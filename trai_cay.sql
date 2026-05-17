-- Fresh Fruit Store Database Schema
-- This file creates the complete database structure for the Fresh Fruit e-commerce application

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    role ENUM('GUEST', 'CUSTOMER', 'ADMIN') DEFAULT 'CUSTOMER',
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL;

-- Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    origin VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    available BOOLEAN DEFAULT TRUE,
    category_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_category (category_id),
    INDEX idx_available (available),
    FULLTEXT INDEX ft_name (name),
    FULLTEXT INDEX ft_description (description)
);

-- Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    notes TEXT,
    payment_method ENUM('TRANSFER', 'COD', 'EWALLET') DEFAULT 'COD',
    total_amount DECIMAL(12, 2) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Create Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    order_id BIGINT NOT NULL,
    product_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
);

-- Insert Default Categories
INSERT INTO categories (name, description, image_url) VALUES
('Táo', 'Các loại táo nhập khẩu tươi ngon', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300'),
('Quả mọng', 'Dâu tây, việt quất, cherry và các quả mọng khác', 'https://images.unsplash.com/photo-1595521624823-fdfb45c9e3fd?w=300'),
('Xoài', 'Xoài Úc, xoài Thái và các loại xoài tuyệt hảo', 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300'),
('Nho', 'Nho Mẫu Đơn, nho Pháp và các loại nho khác', 'https://images.unsplash.com/photo-1596363505729-4190a9505ce7?w=300'),
('Lê', 'Lê Hàn Quốc, lê Trung Quốc và các loại lê khác', 'https://images.unsplash.com/photo-1596527133280-8684b6f6119e?w=300');

-- Insert Default Admin User (password: admin123)
INSERT INTO users (username, password, full_name, email, phone, address, role, enabled) 
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/tvO', 'Admin User', 'admin@freshfruit.vn', '0909123456', 'Ho Chi Minh', 'ADMIN', TRUE);

-- Insert Default Customer User (password: customer123)
INSERT INTO users (username, password, full_name, email, phone, address, role, enabled) 
VALUES ('customer1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/tvO', 'Nguyễn Văn A', 'customer1@example.com', '0912345678', '123 Nguyen Hue, District 1, HCMC', 'CUSTOMER', TRUE);

-- Create necessary indexes for performance
CREATE INDEX idx_order_status_date ON orders(status, created_at);
CREATE INDEX idx_product_category_available ON products(category_id, available);
