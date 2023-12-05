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

    createTables() { //only for dev => might need to remove the create tables function in the future.
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

    validateUser(email, username, password, errorMessage, callback) {

        // for debugging
        console.log('Email:', email);
        console.log('Username:', username);
        console.log('Password:', password);

        var errors = [];

        if (!email || !password || !username || email.trim() === '' || password.trim() === '' || username.trim() === '') {
            errors.push("You must not leave any fields blank");
        }

        // password validation
        if (password.length < 10 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[!\"£$%&*#@?]/.test(password)) {
            errors.push("The formatting of the password is incorrect. Ensure all the password complexity rules have been followed");
        }

        // email validation
        if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
            errors.push("Your email address is invalid");
        }

        // username validation
       // username validation
        if (!/^[a-zA-Z0-9_]{3,}$/.test(username)) {
            errors.push("Your username must not contain any special characters");
        }


        // Check if there are any validation errors
        if (errors.length > 0) {
            errorMessage(errors.join(". "));
            return false;
        }

        // If there are no errors, callback with 'none'
        errorMessage("");
        return true;
    }



    checkUser(username, callback) {
    const sql = "SELECT COUNT(*) AS count FROM users WHERE username = ?"; //aggregate sql function, parameterised sql
    const values = [username];

    this.connection.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error checking username existence:", err);
            callback(false, "Error checking existence of that username");
        } else if (result) {
            const count = result[0].count;
            if (count > 0) {
                console.log("username already exists") //maybe try and show this message on screen like how i did in validation function
                callback(false, "An account with that username already exists. If you would like you can sign in instead.");
            } else {
                callback(true, "");
                
            }
            
        }
       
        
    });
    }



        createNewUser(email, username, hashedPassword, callback) {
            const sql = "INSERT INTO users (email, username, passwordhash) VALUES (?, ?, ?)";
            const values = [email, username, hashedPassword];
        
            this.connection.query(sql, values, (err, result) => {
                if (err) {
                    console.error("Error inserting users into the database", err);
                    callback(false, "Error inserting user into the database");
                } else {
                    console.log("User successfully inserted into the database");
                    callback(true, "");
                }
            });
        }
    

    // createNewUser(email, pass, user) {
    //     var sql = "INSERT INTO users (Email, PasswordHash, Username) VALUES ('" + email + "', '" + pass + "', '" + user + "')"
    //     this.connection.query(sql, (err, result) => {
    //         if(err) {
    //             console.log("Error while inserting user")
    //             console.log(err)
    //             return false;
    //         } else {
    //             console.log("Successfully added user!")
    //             return true;
    //         }
    //     })
    // }


   


}

module.exports = { Database };
