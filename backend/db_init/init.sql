CREATE DATABASE IF NOT EXISTS orders_products_db;
CREATE USER IF NOT EXISTS 'user'@'%' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL PRIVILEGES ON orders_products_db.* TO 'user'@'%';
FLUSH PRIVILEGES;
USE orders_products_db;

CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    order_date DATETIME NOT NULL,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    serial_number INT NOT NULL,
    is_new BOOLEAN NOT NULL DEFAULT TRUE,
    photo VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    specification TEXT,
    order_id INT,
    product_date DATETIME NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ProductGuarantees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL UNIQUE,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ProductPrices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    symbol VARCHAR(3) NOT NULL, 
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO Orders (id, title, order_date, description)
VALUES
    (1, 'Order 1', '2017-06-29 12:09:33', 'desc'),
    (2, 'Order 2', '2017-06-29 12:09:33', 'desc'),
    (3, 'Order 3', '2017-06-29 12:09:33', 'desc');

INSERT INTO Products (id, serial_number, is_new, photo, title, type, specification, order_id, product_date)
VALUES
    (1, 1234, 1, 'pathToFile1.jpg', 'Product 1', 'Monitors', 'Specification 1', 1, '2017-06-29 12:09:33');

INSERT INTO Products (id, serial_number, is_new, photo, title, type, specification, order_id, product_date)
VALUES
    (2, 5678, 1, 'pathToFile2.jpg', 'Product 2', 'Keyboards', 'Specification 2', 2, '2017-06-29 12:09:33');

INSERT INTO ProductGuarantees (product_id, start_date, end_date)
VALUES
    (1, '2017-06-29 12:09:33', '2018-06-29 12:09:33');

INSERT INTO ProductGuarantees (product_id, start_date, end_date)
VALUES
    (2, '2017-06-29 12:09:33', '2018-06-29 12:09:33');

INSERT INTO ProductPrices (product_id, value, symbol, is_default)
VALUES
    (1, 100.00, 'USD', 0),
    (1, 2600.00, 'UAH', 1);

INSERT INTO ProductPrices (product_id, value, symbol, is_default)
VALUES
    (2, 150.00, 'USD', 0),
    (2, 3900.00, 'UAH', 1);
