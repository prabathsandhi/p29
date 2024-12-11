CREATE DATABASE p29;

USE p29;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);

-- Insert a test user (First Name as both username and password)
INSERT INTO users (first_name, last_name, username, password)
VALUES ('Prabath ', 'Prabath ', 'Prabath ', 'Prabath ');
