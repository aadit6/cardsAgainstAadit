const {OAuth2Client} = require("google-auth-library");
require("dotenv").config();
const db = require("./database");

class GoogleAuth {

    constructor() {
        if (!GoogleAuth.instance) {
            this.client = new OAuth2Client(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                `http://localhost:3001/auth/google/cardsagainstaadit`);
            this.db = db;
        }
    
        return GoogleAuth.instance;
        
    }

    getAuthUrl() {
        let authUrl;
        authUrl = this.client.generateAuthUrl({
            access_type: "offline",
            scope: ["profile", "email"],

        })
        return authUrl;
    }

    exchangeCodeForTokens(code, callback) {
        this.client.getToken(code, (error, tokens) => {
            if (error) {
                console.error("Error exchanging code for tokens:", error);
                return callback(new Error("Failed to exchange authorization code for tokens"), null);
            }

            callback(null, tokens);
        });
    }


    authenticateGoogleUser(code, callback) {
        this.exchangeCodeForTokens(code, (exchangeError, tokens) => {
            if(exchangeError) {
                return callback(exchangeError, null)
            }
            const idToken = tokens.id_token;
            console.log("Received ID Token:", idToken);
        
            this.client.verifyIdToken({
                idToken: idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            }, (error, ticket) => {
                if (error) {
                    console.error("Google authentication error:", error);
                    console.log("Token details:", this.client.verifyIdTokenAsync(token).then(console.log)); 
                    return callback(new Error("Google authentication failed"), null);
                }
        
                const payload = ticket.getPayload();
                console.log("Decoded Code Payload:", payload);
        
                const googleUserId = payload.sub;
        
                // Check if the user already exists in your database using Google ID
                this.db.checkUser(null, googleUserId, (errormessage, usernameAvailable) => {
                    if (!usernameAvailable) {
                        console.log("Username Available:", usernameAvailable)
                        // If user exists, return error
                        this.db.getUserfromID(googleUserId, (err, username) => {
                            if(err) {
                                return callback(new Error(err), null)
                            } else {
                                callback (null, username);
                            }
                        })               
                    } else {
                        // If user doesn't exist, create a new account
                        this.createNewUser(payload, (creationError, newUser, isUserCreated) => {
                            if (isUserCreated) {
                                callback(null, newUser);
                            } else {
                                callback(new Error(creationError), null);
                        
                            }
                        });
                    }
                });
            });
        });
    } 
    
  
    createNewUser(googlePayload, callback) {
      // Extract relevant information from the Google payload
      const { sub, email } = googlePayload;
      const randNum = Math.floor(Math.random() * 10000);
      
      const newUser = {
        googleId: sub,
        email: email,
        username: email.split("@")[0], //usernames takes the part before the "@" in the email
      };
      console.log(newUser);

      this.db.createNewUser(null, null, null, newUser, (error, isUserCreated, createdUser) => {
        if (!error) {
            console.log(createdUser, "successfully entered into database")
            callback(null, createdUser, true);
        } else if (error) {
            console.log("cant enter into database")
            callback(new Error(error), null, false);
        }
      });
    }
}
  
module.exports = new GoogleAuth();