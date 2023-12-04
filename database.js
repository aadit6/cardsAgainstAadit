const mysql = require('mysql');
const express = require('express');
const configPath = './config/db_config.json';

let config;

try {
  config = require(configPath);
  console.log("config.json successfully loaded");
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.error("Error: config.json file not found. Make sure it exists by creating a config.json file in the config folder.");
  } else if (error instanceof SyntaxError) {
    console.error("Error: There is a syntax error in the config.json file. Please fix the syntax.");
  } else {
    console.error("An unexpected error occurred while reading config.json file:", error.message);
  }

  process.exit(1);
}

class Database {
  
    //initialising the database and error-handling
    
    constructor() {
        this.config = config; //directly assigns configuration
        this.connection = null;
    }

    connect() {
        this.connection = mysql.createConnection(this.config);

        this.connection.connect((err) => { //database doesnt exist etc.
            if (err) {
                console.error('Error connecting to the database:', err);
                throw err;
            } else {
            console.log('Connected to the database!');
        }});

        this.connection.on('error', (err) => { //error: connection lost
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        } else {
            console.error('Unexpected database error:', err);
        }
        });

        process.on('SIGINT', () => { //unexpectedly closed database -- eg ctrl^C server closed
        this.connection.end((err) => {
            if (err) {
            console.error('Error closing the database connection:', err);
            }
            process.exit();
        });
        });
    }

// creating database tables

    createTables() {
        const sql = `
            CREATE TABLE IF NOT EXISTS Users (
                UserID INT AUTO_INCREMENT PRIMARY KEY,
                Username VARCHAR(255) NOT NULL,
                Email VARCHAR(255) NOT NULL,
                PasswordHash VARCHAR(255) NOT NULL,
                Salt VARCHAR(255) NOT NULL
            )`;

        this.connection.query(sql, (err, result) => {
            if (err) {
                console.error('Error creating Users table:', err);
            } else {
                console.log('Users table created successfully!');
            }
        });
    }    


// login-registration based functions

    validateUser(email, username, password, errorMessage, callback) { //should i make it so i can pretty much get rid of the frontend js??

        if (email.length === 0 || username.length === 0 || pwd.length === 0) {
            
            errorMessage("You must not leave any fields blank")
            return false;
            
        }

        // password validation
        if (password.length < 10 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[!\"£$%&*#@?]/.test(password)) {
            errorMessage("The formatting of the password is incorrect. Ensure all the password complexity rules have been followed")
            return false;
        }
    
        // email validation
        if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
            errorMessage("Your email address is invalid")
            return false;
        }
    
        // username validation
        if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
            errorMessage("your username must not contain any special characters")
            return false;
        }
    
        errorMessage("none");
        return true;
        

    }

    checkUserExists() {
        const sql = "SELECT COUNT(*) AS count FROM users WHERE username = ?"
        const values = [username];

        this.connection.query(sql, values, (err, result) => {
            if (err) {
                console.error("Error checking username existence:", err);
                return callback(err);
            }
            const usernameExists = result[0].count > 0;
            callback(null, usernameExists)
        })
    }

    createNewUser(email, username, hashedPassword, callback) {
        const sql = "INSERT INTO users (email, username, password) VALUES (?, ?, ?)";
        const values = [email, username, hashedPassword];

        this.connection.query(sql, values, (err, result) => {
            if (queryErr) {
                console.error("Error inserting users into the database", err);
                return callback(queryErr);
            }
            console.log("User successfuly inserted into the database")
            callback(null, result);
        })
    }




}

module.exports = { Database };
