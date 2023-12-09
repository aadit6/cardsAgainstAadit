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

(async () => {
    try {
       await db.connect();
       db.createTables(); 
    } catch (error) {
        console.error("An error occurred:", error);
        process.exit(1);
    }
})();

// const sessionStore = db.getSessionStore();

// app.use(
//     session({
//         secret: process.env.SESSION_SECRET,
//         resave: false,
//         saveUninitialized: false,
//         store: sessionStore,
//         cookie: {
//             maxAge: 1000 * 60 * 60 * 24 //time in milliseconds => made it so session expires after one day
//         }
//     })
// )



// login and registration routing => maybe at some point on seperate "routes.js" file for each part of routing (more simplicity/seperation of concerns)

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

const ggl = new GoogleAuth();
app.get("/auth/google", (req, res) => {
    const authUrl = ggl.getAuthUrl();
    res.redirect(authUrl);
});

app.get("/auth/google/pokergame", (req, res) => {
    const {code} = req.query;
    console.log("Recived code:", code);
    ggl.authenticateGoogleUser(code, (error, user) => {
        if (error) {
            console.error("Error during Google authentication:", error);
        } else {
            req.session.user = user;
            res.redirect("/menu");
        }
    })
})

app.get('/menu', (req, res) => {
    res.render(__dirname + "/views/menu.ejs", {Username: "bleh"});
    
});


app.listen(port, () => {
    console.log(`server running on port ${port} and path ${__dirname}.`);
    
})



