// imports
require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs")
const ejs = require("ejs")
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy;

//utils
const database = require("./utils/database.js");
const {Database} = require("./utils/database.js")

const authutils = require("./utils/authutils.js");
const {HashingUtil} = require("./utils/authutils.js");

const middleware = require("./middleware");

// initialising server (mounting middleware)

const port = 3000;
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true})); //middleware to parse form
app.use(express.json()); //allows to use json format => maybe hardcode ourselves for +complexity though?
app.use(middleware.logger);
app.set('view engine', 'ejs')

//initialising database
const db = new Database();
(async () => {
    try {
       await db.connect();
       db.createTables(); 
    } catch (error) {
        console.error("An error occurred:", error);
        process.exit(1);
    }
})();

const sessionStore = db.getSessionStore();

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

app.use(passport.initialize());
app.use(passport.session());

// Serialize user for session


passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/pokergame', // Update this based on your route
    },
    (accessToken, refreshToken, profile, done) => {
        // Check if the user already exists in your database using Google ID
        db.checkUser(null, profile.id, (existingUserCheck, errorMessage) => {
            if (existingUserCheck) {
                // If user exists, log in
                return done(null, existingUserCheck);
            } else {
                // If user doesn't exist, create a new account
                db.createNewUser(null, null, null, profile, (newUserCheck, newErrorMessage) => {
                    if (newUserCheck) {
                        // User created successfully, retrieve the newly created user
                        const newUser = db.getUserByGoogleId(profile.id);
                        return done(null, newUser);
                    } else {
                        // Handle error during user creation
                        return done(newErrorMessage, null);
                    }
                });
            }
        });
    }
));

passport.serializeUser((user, done) => {
    if (user && user.Google_id) {
        done(null, user.Google_id); // Use Google ID as the identifier
    } else {
        done(new Error('Invalid user object during serialization'), null);
    }
});

// Deserialize user from session
passport.deserializeUser((username, done) => {
    // Use the checkUser method to retrieve the user by their username
    db.checkUser(username, null, (success, errorOrUser) => {
        if (success) {
            // Adjust the following line based on your actual user object structure
            const user = {
                username: errorOrUser.username, // Replace with the actual property name
                email: errorOrUser.email, // Replace with the actual property name
                Google_id: errorOrUser.Google_id, // Replace with the actual property name
                // Add other properties as needed
            };
            done(null, user);
        } else {
            done(errorOrUser, null);
        }
    });
});

// login and registration routing => maybe at some point on seperate "routes.js" file for each part of routing (more simplicity)

app.get('/', (req, res) => {
    res.render(__dirname + "/views/register.ejs", {error:"", success:""});
    
})

app.get('/signin', (req, res) => {
    res.render(__dirname + "/views/login.ejs", {error:"", success:""});
})

app.get('/signup', (req,res) => {
    res.render(__dirname + '/views/register.ejs', {error:"", success:""});
})

const hashAuth = new HashingUtil();
app.post('/signup', (req, res) => { //NOTE: GETTING "CANNOT SET HEADERS" ERROR WHEN SUCCESSFUL => (but doesnt affect anything rn so hey-ho)
    const { email, username, password } = req.body;

    // Validate user input
    var validateTest = db.validateUser(email, username, password, (err) => {
        if (err) {
            res.render(__dirname + "/views/register.ejs", { error: err, success: "" });
            return;
        }
    });

    // Callback function for handling user creation
    var handleAccCreation = (usernameAvailable, errorMessage) => {
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
                var createUserCallback = (userCreated, creationError) => {
                    if (!userCreated) {
                        res.render(__dirname + "/views/register.ejs", { error: creationError, success: "" });
                        return;
                    }
                    res.render(__dirname + "/views/login.ejs", { error: "", success: "Successfully created account! You may now login." });
                };

                // Create a new user
                db.createNewUser(email, username, hashedPassword, createUserCallback);
            });
        });
    };

    // If validation fails, render the registration page with an error message
    if (!validateTest) {
        res.render(__dirname + "/views/register.ejs", { error: "Server side validation error. Please try again.", success: "" });
        return;
    } else {
        // Check if the username is available
        db.checkUser(username, handleAccCreation);
    }
});

app.post('/signin',(req,res) =>{
    
})

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get('/auth/google/pokergame',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication, redirect to the home page
        res.redirect('/menu');
    }
);

app.get('/menu', (req, res) => {
    res.render(__dirname + "/views/menu.ejs", {error:"", success:""});
    
});


app.listen(port, () => {
    console.log(`server running on port ${port} and path ${__dirname}.`);
    
})

