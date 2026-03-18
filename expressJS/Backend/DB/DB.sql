CREATE DATABASE IF NOT EXIST furrylanddb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
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
               creates_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
           );