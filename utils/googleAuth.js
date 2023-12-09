const {OAuth2Client} = require("google-auth-library");
const db = require("./database");

class GoogleAuth {
    constructor() {
      this.client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        "http://localhost:3000/auth/google/pokergame"
        );
      this.db = db;
    }
  
    getAuthUrl() {
        let authUrl;
        authUrl = this.client.generateAuthUrl({
            access_type: "offline",
            scope: ["profile"],

        })
        return authUrl;
    }

    exchangeCodeForTokens(code, callback) {
        this.client.getToken(code, (error, tokens) => {
            if (error) {
                console.error("Error exchanging code for tokens:", error);
                return callback(new Error("Failed to exchange authorization code for tokens"));
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
            }, (error, ticket) => { // Use an arrow function here
                if (error) {
                    console.error("Google authentication error:", error);
                    console.log("Token details:", this.client.verifyIdTokenAsync(token).then(console.log)); // Add this line
                    return callback(new Error("Google authentication failed"));
                }
        
                const payload = ticket.getPayload();
                console.log("Decoded Code Payload:", payload); // Add this line
        
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
        });
    } 
    
  
    createNewUser(googlePayload, callback) {
      // Extract relevant information from the Google payload
      const { sub, email, given_name, family_name } = googlePayload;
      const randNum = Math.floor(Math.random() * 1000);
      const username = `${given_name.toLowerCase()}${family_name.toLowerCase()}${randNum}`;
      
      const newUser = {
        googleId: sub,
        email: email,
        username: username,
      };

      this.db.createNewUser(null, null, null, newUser, (createdUser, error) => {
        if (createdUser) {
            console.log(createdUser, "successfully entered into database")
            callback(null, createdUser);
        } else {
            console.log("fucks sake cant enter into database")
            callback(new Error(error), null);
        }
      });
    }
}
  
module.exports = {GoogleAuth};