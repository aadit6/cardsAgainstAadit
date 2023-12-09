const mysql = require('mysql');
const express = require('express');
const configPath = '../config/db_config.json';
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session); //maybe hardcode manually???


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
        if (!Database.instance) {
          this.config = config;
          this.connection = null;
          Database.instance = this;
        }
    
        return Database.instance;
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

//for sessions
    getSessionStore() {
        const sessionStore = new MySQLStore({
            expiration: 86400000,
            createDatabaseTable: true,
            schema: {
                tableName: 'sessions',
                columnNames: {
                    session_id: 'session_id',
                    expires: 'expires',
                    data: 'data'
                }
            }
        }, this.connection);

        return sessionStore
    }

// creating database tables

    createTables() { //only for dev => might need to remove the create tables function in the future.
        const userSql = `
            CREATE TABLE IF NOT EXISTS Users (
                UserID INT AUTO_INCREMENT PRIMARY KEY,
                Username VARCHAR(255) NOT NULL,
                Email VARCHAR(255) NOT NULL,
                Google_id VARCHAR(255)

            );
        `;


        this.connection.query(userSql, (err, result) => {
            if (err) {
                console.error('Error creating user table', err);
            } else {
                console.log('user table created successfully!');
            }
        });
    }
    


// login-registration based functions

    validateUser(email, username, password, errorMessage) {

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
            console.log(errorMessage);
            return false;
        }

        // If there are no errors, callback with 'none'
        errorMessage("");
        return true;
    }


    checkUser(username, googleid, callback) {
        let sql;
        let values;

        if (!googleid) {
            sql = "SELECT COUNT(*) AS count FROM users WHERE Username = ?"; //aggregate sql function, parameterised sql
            values = [username];
        } else if (googleid) {
            sql = "SELECT COUNT(*) AS count FROM users WHERE Google_id = ?";
            values = [googleid]    
        }
        this.connection.query(sql, values, (err, result) => {
            if (err) {
                console.error("Error checking user existence:", err);
                callback(false, "Server error checking existence of that user");
            } else if (result) {
                const count = result[0].count;
                if (count > 0) {
                    console.log("user already exists") //maybe try and show this message on screen like how i did in validation function
                    callback(false, "An account with that information already exists. If you would like you can sign in instead.");
                } else {
                    callback(true, "");
                    
                }   
            }  
        });
    }

    createNewUser(email, username, hashedPassword, profile, callback) {
        let values, sql;

        if (profile) {
            sql = "INSERT INTO users (email, username, Google_id) VALUES (?, ?, ?)";
            values = [profile.emails[0].value, profile.displayName, profile.id];
        } else {
            sql = "INSERT INTO users (email, username, passwordhash) VALUES (?, ?, ?)";
            values = [email, username, hashedPassword];
        }
        
        this.connection.query(sql, values, (err, result) => {
            if (err) {
                console.error("Error inserting user into the database", err);
                callback(false, "Error inserting user into the database");
            } else {
                console.log("User successfully inserted into the database");
                callback(true, null);
            }
        });
    }
    
}

module.exports = new Database();
