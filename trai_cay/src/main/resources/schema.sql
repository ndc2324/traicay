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

-- Create News Table
CREATE TABLE IF NOT EXISTS news (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(500),
    category VARCHAR(50),
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_published (is_published),
    INDEX idx_published_at (published_at),
    FULLTEXT INDEX ft_title (title)
);

-- Insert Default Categories
INSERT INTO categories (name, description, image_url) VALUES
('Táo', 'Các loại táo nhập khẩu tươi ngon', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300'),
('Quả mọng', 'Dâu tây, việt quất, cherry và các quả mọng khác', 'https://images.unsplash.com/photo-1595521624823-fdfb45c9e3fd?w=300'),
('Xoài', 'Xoài Úc, xoài Thái và các loại xoài tuyệt hảo', 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300'),
('Nho', 'Nho Mẫu Đơn, nho Pháp và các loại nho khác', 'https://images.unsplash.com/photo-1596363505729-4190a9505ce7?w=300'),
('Lê', 'Lê Hàn Quốc, lê Trung Quốc và các loại lê khác', 'https://images.unsplash.com/photo-1596527133280-8684b6f6119e?w=300');

INSERT INTO products (name, description, price, image_url, origin, quantity, available, category_id) VALUES

-- Trái cây
('Xoài Cát Hòa Lộc', 'Xoài cát Hòa Lộc thơm ngon, ngọt dịu, thịt vàng mịn, ít xơ, trọng lượng 300-500g/quả.', 85000.00, 'https://example.com/images/xoai-cat-hoa-loc.jpg', 'Tiền Giang', 150, TRUE, 1),

('Bưởi Da Xanh', 'Bưởi da xanh Bến Tre múi hồng, vị ngọt thanh, ít hạt, giàu vitamin C, trọng lượng 1-1.5kg/quả.', 65000.00, 'https://example.com/images/buoi-da-xanh.jpg', 'Bến Tre', 200, TRUE, 1),
('Dưa Hấu Không Hạt', 'Dưa hấu không hạt ruột đỏ tươi, ngọt mát, thích hợp làm nước ép hoặc ăn trực tiếp.', 35000.00, 'https://example.com/images/dua-hau-khong-hat.jpg', 'Long An', 100, TRUE, 1),

('Nho Xanh Mỹ', 'Nho xanh nhập khẩu từ Mỹ, hạt nhỏ, vỏ mỏng, vị ngọt thanh giòn, 500g/túi.', 120000.00, 'https://example.com/images/nho-xanh-my.jpg', 'Mỹ', 80, TRUE, 1),

-- Rau củ
('Cà Rốt Đà Lạt', 'Cà rốt Đà Lạt tươi, màu cam đẹp, giòn ngọt, giàu vitamin A, phù hợp nấu canh hoặc ép nước.', 25000.00, 'https://example.com/images/ca-rot-da-lat.jpg', 'Đà Lạt', 300, TRUE, 2),

('Bông Cải Xanh', 'Bông cải xanh (broccoli) tươi ngon, cụm hoa chắc mịn, giàu chất xơ và vitamin, 500g/gói.', 30000.00, 'https://example.com/images/bong-cai-xanh.jpg', 'Đà Lạt', 250, TRUE, 2),

('Khoai Lang Mật', 'Khoai lang mật vỏ tím ruột vàng, vị ngọt bùi tự nhiên, thích hợp nướng hoặc hấp, 1kg/túi.', 28000.00, 'https://example.com/images/khoai-lang-mat.jpg', 'Vĩnh Long', 400, TRUE, 2),
-- Insert Default Admin User (password: admin123)


INSERT INTO users (username, password, full_name, email, phone, address, role, enabled) 
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/tvO', 'Admin User', 'admin@freshfruit.vn', '0909123456', 'Ho Chi Minh', 'ADMIN', TRUE);

-- Insert Default Customer User (password: customer123)
INSERT INTO users (username, password, full_name, email, phone, address, role, enabled) 
VALUES ('customer1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/tvO', 'Nguyễn Văn A', 'customer1@example.com', '0912345678', '123 Nguyen Hue, District 1, HCMC', 'CUSTOMER', TRUE);

-- Create necessary indexes for performance
CREATE INDEX idx_order_status_date ON orders(status, created_at);
CREATE INDEX idx_product_category_available ON products(category_id, available);
