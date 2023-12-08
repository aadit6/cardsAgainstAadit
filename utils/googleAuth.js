const {OAuth2Client} = require("google-auth-library");
const database = require("./utils/database.js");
const {Database} = require("./utils/database.js")




class GoogleAuth {
    constructor() {
      this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      this.db = new Database();
    }
  
    authenticateGoogleUser(token, callback) {
      this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      }, (error, ticket) => {
        if (error) {
          console.error("Google authentication error:", error);
          return callback(new Error("Google authentication failed"));
        }
  
        const payload = ticket.getPayload();
        const googleUserId = payload.sub;
  
        // Check if the user already exists in your database using Google ID
        this.db.checkUser(null, googleUserId, (existingUser, errorMessage) => {
          if (existingUser) {
            // If user exists, return user data
            callback(null, existingUser);
          } else {
            // If user doesn't exist, create a new account
            this.createNewUser(payload, (newUser, creationError) => {
              if (newUser) {
                callback(null, newUser);
              } else {
                callback(new Error(creationError), null);
              }
            });
          }
        });
      });
    }
  
    createNewUser(googlePayload, callback) {
      // Extract relevant information from the Google payload
      const { sub, email, given_name, family_name } = googlePayload;
  
      // You may customize the fields and values based on your user model
      const randNum = Math.floor(Math.random() * 1000);
      const username = `${given_name.toLowerCase()}${family_name.toLowerCase()}${randNum}`;
      
      const newUser = {
        googleId: sub,
        email: email,
        username: username,
      };
  
      // Create a new user in your database
      this.db.createNewUser(null, null, null, newUser, (createdUser, error) => {
        if (createdUser) {
          callback(null, createdUser);
        } else {
          callback(new Error(error), null);
        }
      });
    }
  }
  
  module.exports = GoogleAuth;