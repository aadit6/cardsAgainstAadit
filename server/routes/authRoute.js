//TODO: fix when same email


const express = require("express");
const router = express.Router();
const session = require("express-session");
const db = require("../utils/database.js")
const hashAuth = require("../utils/authutils.js")
const dir = `C:\\Users\\aadit\\Documents\\A-Levels\\CS\\NEA\\pokerGameNEA\\server`;

router.post('/signin', (req, res) => { 
    const { username, password } = req.body;
    
    //for development/debugging purposes
    console.log("Username: ",req.body.username);
    console.log("Password: ", req.body.password);

    // Check if the username exists
    db.checkUser(username, null, (errorMessage, userDoesntExist) => {
        if (userDoesntExist) {
            res.render(dir + "/views/login.ejs", { error: "Incorrect username or password. Please try again.", success: "" }); 
            return
        } else {

            // Retrieve the stored password hash
            db.getPass(username, (getPassError, storedPasswordHash) => {
                if (getPassError) {
                    res.render(dir + "/views/login.ejs", { error: getPassError, success: "" });
                    return;
                }
                // Compare the provided password with the stored hash
                hashAuth.comparePassword(password, storedPasswordHash, (err, isPasswordValid) => {
                    if (isPasswordValid) {
                        // Password is correct, set the session
                        req.session.user = username;
                        console.log("req.session: ", req.session);
                        console.log("req.session.user:", req.session.user)

                        // Redirect to the menu
                        res.render(dir + "/views/menu.ejs", {username: req.session.user, success:"Successfully logged in!"});
                       
                    } else {
                       res.render(dir + "/views/login.ejs", {error:err, success:""});  

                    }
                });
            });
        }
    });
});

router.post('/signup', (req, res) => { 
    const { email, username, password } = req.body;

    // Validate user input to ensure it meets requirements
    var validateTest = db.validateUser(email, username, password, (err) => {
        if (err) {
            res.render(dir + "/views/register.ejs", { error: err, success: "" });
            return;
        }
    });

    // Callback function for handling user creation
    var handleAccCreation = (errorMessage, usernameAvailable) => {
        if (!usernameAvailable) {
            res.render(dir + "/views/register.ejs", { error: errorMessage, success: "" }); //if that same username already used for diff account
            return;
        } else {
            console.log("checking if email not used: ...........")
            db.checkEmail(email, (err, emailNotTaken) => { //checks if email not already used for different account
                if(!emailNotTaken) {
                    return res.render(dir + "/views/register.ejs", {error: err, success:""})
                }
            })
        }

        // Generate salt
        hashAuth.generateSalt(64, (saltErr, salt) => {
            if (saltErr) {
                console.error('Salt generation failed:', saltErr);
                res.render(dir + "/views/register.ejs", { error: saltErr, success: "" });
                return;
            }

            // Hash the password using the generated salt
            hashAuth.hashPassword(password, salt, 10000, (hashErr, hashedPassword) => {
                if (hashErr) {
                    console.error('Password hashing failed:', hashErr);
                    res.render(dir + "/views/register.ejs", { error: hashErr, success: "" });
                    return;
                }

                // Callback function for creating a new user
                var createUserCallback = (creationError, isUserCreated, user) => {
                    if (!isUserCreated) {
                        res.render(dir + "/views/register.ejs", { error: creationError, success: "" });
                        return;
                    }
                    res.render(dir + "/views/login.ejs", { error: "", success: "Successfully created account! You may now login." }); //success
                };

                // Create a new user
                db.createNewUser(email, username, hashedPassword, null, createUserCallback);
            });
        });
    };

    // If validation fails, render the registration page with an error message
    if (!validateTest) {
        // res.render(dir +"/views/register.ejs", { error: "Server side validation error. Please try again.", success: "" });
        return;
    } else {
        // Check if the username is available
        db.checkUser(username, null, handleAccCreation);
    }
});

module.exports = router;