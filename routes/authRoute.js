const express = require("express");
const router = express.Router();
const session = require("express-session");
const db = require("./../utils/database.js")
const hashAuth = require("./../utils/authutils.js");
const dir = `C:\\Users\\aaditnagpal\\Documents\\A-Level Computer Science\\NEA\\pokerGameNEA`;

router.post('/signin', (req, res) => { 
    const { username, password } = req.body;
    
    //for development/debugging purposes
    console.log("Username: ",req.body.username);
    console.log("Password: ", req.body.password);

    // Check if the username exists
    db.checkUser(username, null, (errorMessage, userDoesntExist) => {
        if (userDoesntExist) {
            res.render(dir + "/views/login.ejs", { error: "The username doesn't exist. Please try again.", success: "" }); //is this neccessary => security risk ???
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

                        // Redirect to the menu
                        res.redirect("/menu");
                       
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

    // Validate user input
    var validateTest = db.validateUser(email, username, password, (err) => {
        if (err) {
            res.render(dir + "/views/register.ejs", { error: err, success: "" });
            return;
        }
    });

    // Callback function for handling user creation
    var handleAccCreation = (errorMessage, usernameAvailable) => {
        if (!usernameAvailable) {
            res.render(dir + "/views/register.ejs", { error: errorMessage, success: "" });
            return;
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
                    res.render(dir + "/views/login.ejs", { error: "", success: "Successfully created account! You may now login." });
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