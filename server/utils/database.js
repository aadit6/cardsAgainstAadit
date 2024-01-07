const mysql = require('mysql');
const express = require('express');
const configPath = '../../config/db_config.json';
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session); 


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
getSessionStore(callback) {
    try {
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

        callback(null, sessionStore);
    } catch (error) {
        callback(error, null);
    }
}


// DDL SCRIPTS

    initTables() { 
        //NOTE: LOOK AT ALL THIS FOREIGN KEY/ UNIQUE/ PRIMARY KEY STUFF WHEN LOOKING AT DESIGN AT END 
        const userSql = `
            CREATE TABLE IF NOT EXISTS Users ( 
                UserID INT AUTO_INCREMENT PRIMARY KEY,
                Username VARCHAR(255) NOT NULL UNIQUE,
                Email VARCHAR(255) NOT NULL,
                PasswordHash VARCHAR(512),
                Google_id VARCHAR(255),
                INDEX (Username)

            );

        `;


        this.connection.query(userSql, (err, result) => {
            if (err) {
                console.error('Error creating user table', err);
            } else {
                console.log('user table created successfully!');
            }
        });

        //rooms table

        //crucial as want rooms table to reset every time (dont want rooms to stay when server resets)
        
        const initRoomSql = `DROP TABLE IF EXISTS Rooms;`; 
        const roomSql = `
            CREATE TABLE IF NOT EXISTS Rooms ( 
                RoomID VARCHAR(255) PRIMARY KEY,
                CreatorName VARCHAR(255),
                Players INT NULL DEFAULT 0,
                FOREIGN KEY (CreatorName) REFERENCES Users(Username)
            );
        `;
        this.connection.query(initRoomSql, (err, result) => {})
        this.connection.query(roomSql, (err, result) => {
            if (err) {
                console.error('Error creating room table', err);
            } else {
                console.log('rooms table created successfully!');
            }
        });

        const leaderboardSql =  //to be used for leaderboard
            `CREATE TABLE IF NOT EXISTS Leaderboard (
                LeaderboardID INT AUTO_INCREMENT PRIMARY KEY,
                UserID INT,
                Wins INT DEFAULT 0,
                FOREIGN KEY (UserID) REFERENCES Users(UserID)
            );
        `;

        const leaderboardPopulateSql = `INSERT INTO Leaderboard (UserID)
        SELECT UserID FROM Users;
        `

        this.connection.query(leaderboardSql, (err, result) => {
            if(err){
                console.error("error creating room table", err);
            } else {
                console.log("rooms table created successfully")
            }
        })

        this.connection.query(leaderboardPopulateSql, (err, result) => {});

 
    
    }
    


// login-registration based functions

    validateUser(email, username, password, callback) { ///MAYBE: move this to authutils since doesnt require any database operations

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
            callback(errors.join(". "));
            return false;
        }

        // If there are no errors, callback with 'none'
        callback("");
        return true;
    }


    checkUser(username, googleid, callback) {
        let sql;
        let values;

        if (!googleid) {
            sql = "SELECT COUNT(*) AS count FROM users WHERE Username = ?"; //counts the number of rows where the username is already in the table
            values = [username];
        } else if (googleid) {
            sql = "SELECT COUNT(*) AS count FROM users WHERE Google_id = ?";
            values = [googleid];    
        }
        this.connection.query(sql, values, (err, result) => {
            if (err) {
                console.error("Error checking user existence:", err);
                callback("Server error: error checking user existence", false);
            } else if (result) {
                const count = result[0].count;
                if (count > 0) {
                    // console.log("user already exists") 
                    callback("an account with those details already exists", false);
                } else {
                    console.log("user doesnt already exist!");
                    callback(null, true); //need to check if the null value still works in regular register form
                    
                }   
            }  
        });
    }

    createNewUser(email, username, hashedPassword, profile, callback) {
        let values, sql, callbackUsername;

        if (profile) {
            sql = "INSERT INTO users (email, username, Google_id) VALUES (?, ?, ?)";
            values = [profile.email, profile.username, profile.googleId];
            callbackUsername = profile.username;
        } else {
            sql = "INSERT INTO users (email, username, passwordhash) VALUES (?, ?, ?)";
            values = [email, username, hashedPassword];
            callbackUsername = username;
        }
        
        this.connection.query(sql, values, (err, result) => {
            if (err) {
                console.error("Error inserting user into the database", err);
                callback("Error inserting user into the database", false, null);
            } else {
                // console.log(result);
                
                console.log("User successfully inserted into the database");
                callback(null, true, callbackUsername);
            }
        });
    }

    getPass(username, callback) {
        const sql = "SELECT passwordHash FROM users WHERE username = ?";
        const values = [username];
    
        this.connection.query(sql, values, (err, result) => {
            if (err) {
                console.error("Error checking username:", err);
                return callback("server error checking username", null);
            }
            const passHash = result[0].passwordHash;
            
            // if (passHash === null) { //is this neccessary, could be security risk => do we want to be giving user information about this sort of stuff??? 
            //     return callback("username does not exist", null);  
            //     //this callback occurs when you enter in a username associated with a google account. Would not
            //     // work since you need to login via google for that
            // }
            
            callback(null, passHash);
        });
    }

    getUserfromID(googleid, callback) {
        const sql = "SELECT username FROM users WHERE Google_id = ?";
        const values = [googleid];

        this.connection.query(sql, values, (err, result) => {
            if (err) {
                console.error("Error retrieving username:", err);
                return callback("Error retrieving username", null);
            }
            
            const username = result[0].username;
            callback(null, username);
        })
        
    }
    //for use in \settingsUpdate

    updatePass(username, password, callback) {
        const sql = "UPDATE users SET PasswordHash = ? WHERE Username = ?";
        const values = [password, username];
        
        this.connection.query(sql, values, (err, result) => {
            if (err) {
                return callback (err) //change this if want a more custom error message (eg insead of err could have "error updating password")
            }
        })

    }

    updateUsername(oldUsername, newUsername, callback) { //error checking (e.g console.logs)???
        const sql = "UPDATE users SET Username = ? WHERE Username = ?";
        const values = [newUsername, oldUsername];

        this.connection.query(sql, values, (err, result) => {
            if (err) {
                return callback ("Error inserting into database", null) //change?
            }
            return callback(null, "Successfully updated account details!");
                
            
        })

    }

    //room-based queries
    checkRoomExists(roomName, callback) {
        const sql = "SELECT COUNT(*) AS count FROM rooms WHERE RoomID = ?"
        const values = [roomName];

        this.connection.query(sql, values, (err, result) => {
            if(err) {
                console.error("Error checking room existence");
                callback("Internal server error", null);
            } else {
                const count = result[0].count;
                if (count > 0) {
                    callback("Room exists", true);
                } else {
                    callback ("Room does not exist", false)
                }
            }
        })
    }

    createRoom(username, roomId, callback) {
        const sql = 'INSERT INTO Rooms (RoomID, CreatorName) VALUES (?, ?)';
        const values = [roomId, username];
    
        this.connection.query(sql, values, (err, result) => {
          if (err) {
            callback(err, null);
          } else {
            console.log('Room successfully created in the database', null);
          }
        });
    }

    appendPlayersinDB(roomid, increasePlayers, callback) {
        let operator;
        if(increasePlayers){
            operator = '+';
        } else {
            operator = '-'
        }
        const sql = `UPDATE Rooms SET Players = Players ${operator} 1 WHERE RoomID = ?`
        console.log("this is the sql: " , sql);
        const values = [roomid];

        this.connection.query(sql, values, (err, result) => {
            if(err) {
                callback(err, null);
            } else {
                console.log("players appended in db");
            }
        })
    }

    returnPlayersinRoom(roomid, callback) {
        const sql = "SELECT Players FROM Rooms WHERE RoomID = ?"
        const values = [roomid]

        this.connection.query(sql, values, (err, result) => {
            if(err){
                callback(err, null);
            } else {
                const numOfPlayers = result[0].Players;
                callback(null, numOfPlayers)
            }
        })
    }

    increaseLeaderboardWins(username, callback) {
        const sql = `UPDATE Leaderboard, Users
        SET Leaderboard.Wins = Leaderboard.Wins + 1
        WHERE Leaderboard.UserID = Users.UserID
        AND Users.Username = ?;`;

        const values = [username]

        this.connection.query(sql, values, (err, result) => {
            if(err) {
                callback(err)
            } else {
                return
            }
        })
    }

    
    
}

module.exports = new Database();
