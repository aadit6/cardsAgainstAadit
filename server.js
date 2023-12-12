// imports
require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const ejs = require("ejs")
const bodyParser = require("body-parser");
const session = require("express-session");
const {OAuth2Client} = require("google-auth-library");


//utils


const authutils = require("./utils/authutils.js");
const {HashingUtil} = require("./utils/authutils.js");

const googleauth = require("./utils/googleAuth.js");
const {GoogleAuth} = require("./utils/googleAuth.js"); // Corrected import



const middleware = require("./middleware");
const { decode } = require("punycode");

// initialising server (mounting middleware)

const port = 3000;
app.use(bodyParser.urlencoded({extended: true})); //middleware to parse form
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); //allows to use json format => maybe hardcode ourselves for +complexity though?
app.use(middleware.logger);
app.set('view engine', 'ejs')

//initialising database

const db = require("./utils/database.js");

(async () => { //alternative method of async
    try {
       await db.connect();
       db.createTables(); 
    } catch (error) {
        console.error("An error occurred:", error);
        process.exit(1);
    }
})();

const sessionStore = db.getSessionStore((error, sessionStore) => {
    if (error) {
        console.error('Error getting session store:', error);
        // Handle the error case here
    }
});

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 //time in milliseconds => made it so session expires after one day
        }
    })
)



// login and registration routing => maybe at some point on seperate "routes.js" file for each part of routing (more simplicity/seperation of concerns)

app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect("/menu")
    } else {
        res.render(__dirname + "/views/login.ejs", {error:"", success:""});        
    }    
})

app.get('/signin', (req, res) => {
    res.render(__dirname + "/views/login.ejs", {error:"", success:""});
})

app.get('/signup', (req,res) => {
    res.render(__dirname + '/views/register.ejs', {error:"", success:""});
})

const hashAuth = new HashingUtil();
app.post('/signup', (req, res) => { 
    const { email, username, password } = req.body;

    // Validate user input
    var validateTest = db.validateUser(email, username, password, (err) => {
        if (err) {
            res.render(__dirname + "/views/register.ejs", { error: err, success: "" });
            return;
        }
    });

    // Callback function for handling user creation
    var handleAccCreation = (errorMessage, usernameAvailable) => {
        if (!usernameAvailable) {
            res.render(__dirname + "/views/register.ejs", { error: errorMessage, success: "" });
            return;
        }

        // Generate salt
        hashAuth.generateSalt(64, (saltErr, salt) => {
            if (saltErr) {
                console.error('Salt generation failed:', saltErr);
                res.render(__dirname + "/views/register.ejs", { error: saltErr, success: "" });
                return;
            }

            // Hash the password using the generated salt
            hashAuth.hashPassword(password, salt, 10000, (hashErr, hashedPassword) => {
                if (hashErr) {
                    console.error('Password hashing failed:', hashErr);
                    res.render(__dirname + "/views/register.ejs", { error: hashErr, success: "" });
                    return;
                }

                // Callback function for creating a new user
                var createUserCallback = (creationError, isUserCreated, user) => {
                    if (!isUserCreated) {
                        res.render(__dirname + "/views/register.ejs", { error: creationError, success: "" });
                        return;
                    }
                    res.render(__dirname + "/views/login.ejs", { error: "", success: "Successfully created account! You may now login." });
                };

                // Create a new user
                db.createNewUser(email, username, hashedPassword, null, createUserCallback);
            });
        });
    };

    // If validation fails, render the registration page with an error message
    if (!validateTest) {
        // res.render(__dirname +"/views/register.ejs", { error: "Server side validation error. Please try again.", success: "" });
        return;
    } else {
        // Check if the username is available
        db.checkUser(username, null, handleAccCreation);
    }
});


app.post('/signin', (req, res) => { //error: when enter in correct details, get "an account with those details already exists"
    const { username, password } = req.body;
    
    //for development/debugging purposes
    console.log("Username: ",req.body.username);
    console.log("Password: ", req.body.password);

    // Check if the username exists
    db.checkUser(username, null, (errorMessage, userDoesntExist) => {
        if (userDoesntExist) {
            res.render(__dirname + "/views/login.ejs", { error: "The username doesn't exist. Please try again.", success: "" }); //is this neccessary => security risk ???
            return
        } else {
            // Retrieve the stored password hash
            db.getPass(username, (getPassError, storedPasswordHash) => {
                if (getPassError) {
                    res.render(__dirname + "/views/login.ejs", { error: getPassError, success: "" });
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
                       res.render(__dirname + "/views/login.ejs", {error:err, success:""});  

                    }
                });
            });
        }
    });
});

const ggl = new GoogleAuth();
app.get("/auth/google", (req, res) => {
    const authUrl = ggl.getAuthUrl();
    res.redirect(authUrl);
});

app.get("/auth/google/pokergame", (req, res) => {
    const {code} = req.query;
    console.log("Received code:", code);
    ggl.authenticateGoogleUser(code, (err, user, usernameAvailable) => {
        if (err) {
            // Handle the error case
            res.render(__dirname + "/views/login.ejs", { error: err, success: "" });
        } else if (!usernameAvailable) {
            // Handle the case where the user already exists
            res.render(__dirname + "/views/login.ejs", { error: "A user with that email already exists.", success: "" }); /// HOWEVER: THIS IS NOT NEEDED SINCE CAN JUST LOGIN INTO THAT ACCOUNT
        } else {
            // Handle the case where the user is authenticated successfully
            console.log("User:", user);
            req.session.user = user;
            res.redirect("/menu");
        }
    })
})

//app.gets after login successful (eg menu, items on navbar, logout)
app.get('/menu', (req, res) => {
    if(!req.session.user) {
        res.redirect("/")
        return;
    } else {
        res.render(__dirname + "/views/menu.ejs", {Username: req.session.user});
    }
});

app.get('/rules', (req, res) => {
    if(!req.session.user) {
        res.redirect('/');
        return;
    } else {
        res.render(__dirname + "/views/rules.ejs", {Username: req.session.user});
    }
})

app.get('/settings', (req, res) => {
    if (!req.session.user) {
        res.redirect('/');
        return;
    } else {
        res.render(__dirname + '/views/settings.ejs', {error:"", success:"", Username: req.session.user} );
    }
})

app.get('/leaderboard', (req, res) => { //NOT IN USE YET
    if (!req.session.user) {
        res.redirect('/');
        return;
    } else{
        res.render(__dirname + "/views/leaderboard.ejs")
    }
})

app.get('/play', (req, res) => { //NOT IN USE YET
    if (!req.session.user) {
        res.redirect('/');
        return;
    } else{
        res.render(__dirname + "/views/play.ejs")
    }
})

app.get('/logout', (req, res) => {
    if(!req.session.user) {
        res.redirect('/')
        return
    } else {
        req.session.destroy();
        res.render(__dirname + "/views/login.ejs", { error:"", success: "Successfully logged out." });
    }
})

//app.post for settings => to alter account details 
app.post('/settingsupdate', (req, res) => {
    const {oldUsername, newUsername, oldPassword, newPassword} = req.body;

})


app.listen(port, () => {
    console.log(`server running on port ${port} and path ${__dirname}.`);
    
})



