// database.js

const mysql = require('mysql');
const config = require("./config/db_config.json");



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


// USER table operations




}

module.exports = { Database };
