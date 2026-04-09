CREATE DATABASE IF NOT EXISTS furrylanddb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
       USE furrylanddb;

           CREATE TABLE categories (
               id INT AUTO_INCREMENT PRIMARY KEY,
               name VARCHAR(100) NOT NULL
           );

           CREATE TABLE users (
               id INT AUTO_INCREMENT PRIMARY KEY,
               username VARCHAR(50) NOT NULL UNIQUE,
               email VARCHAR(100) NOT NULL UNIQUE,
               password_hash VARCHAR(255) NOT NULL,
               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
           );

           CREATE TABLE products (
               id INT AUTO_INCREMENT PRIMARY KEY,
               category_id INT NOT NULL,
               name VARCHAR(150) NOT NULL,
               description TEXT,
               price DECIMAL(10,2) NOT NULL,
               stock INT DEFAULT 0,
               discount INT DEFAULT 0,
               currency VARCHAR(10) DEFAULT 'EUR',
               image_url_1 VARCHAR(255),
               image_url_2 VARCHAR(255),
               image_url_3 VARCHAR(255),
               FOREIGN KEY (category_id) REFERENCES categories(id)
           );

           CREATE TABLE orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                status ENUM('pending', 'paid', 'shipped', 'cancelled') DEFAULT 'pending',
                total_price DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
           );

           CREATE TABLE order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                unit_price DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
           );

           CREATE TABLE cart_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
           );

           CREATE TABLE product_attributes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                attribute_type VARCHAR(50) NOT NULL,
                attribute_value VARCHAR(100) NOT NULL,
                FOREIGN KEY (product_id) REFERENCES products(id)
           );

           CREATE TABLE favorites (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
           );

           CREATE TABLE addresses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                street VARCHAR(255) NOT NULL,
                city VARCHAR(100) NOT NULL,
                postal_code VARCHAR(20) NOT NULL,
                country VARCHAR(100) DEFAULT 'France',
                FOREIGN KEY (user_id) REFERENCES users(id)
           );