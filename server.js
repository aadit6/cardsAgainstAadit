// imports

const express = require("express");
const app = express();
const bcrypt = require("bcrypt"); 
const middleware = require("./middleware");
const ejs = require("ejs")
const bodyParser = require("body-parser");
const path = require("path");

const database = require("./utils/database.js");
const {Database} = require("./utils/database.js")

const authutils = require("./utils/authutils.js");
const {HashingUtil} = require("./utils/authutils.js");




// initialising server (mounting middleware)

const port = 3000;
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true})); //middleware to parse form
app.use(express.json()); //allows to use json format => maybe hardcode ourselves for +complexity though?
app.use(middleware.logger); //maybe later at some point have this in the middleware.js file
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



// login and registration routing => maybe at some point on seperate "routes.js" file for each part of routing (more simplicity)

app.get('/', (req, res) => {
    res.render(__dirname + "/views/register.ejs", {error:"", success:""})
})

app.get('/signin', (req, res) => {
    res.render(__dirname + "/views/login.ejs")
})

app.get('/signup', (req,res) => {
    res.render(__dirname + '/views/register.ejs')
})

// ... (other imports)



    // Validation function


    // app.post('/signup', (req, res) => {
    //     const { email, username, password } = req.body;
    //     // Validate user input
    //     const validateTest = db.validateUser(email, username, password, (errMsg) => {
    //         // Render the login page with an error message if validation fails
    //         res.render(__dirname + "/views/register.ejs", { error: errMsg, success: "" });
    //     });
    
    //     if (!validateTest) {
    //         // Render the login page with an error message if validation fails
    //         res.render(__dirname + "/pages/login.ejs", {errMsg:"Server side validation error. Please try again.", successMsg:""});
    //         return;
    //     }
    
    //     // Check if the username is available
    //     db.checkUserAvailable(username, (isAvailable) => {
    //         if (!isAvailable) {
    //             // If username already exists, render login page with an error message
    //             res.render(__dirname + "/pages/login.ejs", {errMsg:"Username already exists. Please choose another.", successMsg:""});
    //             return;
    //         }
    
    //         // Hash the password
    //         bcrypt.hash(password, 10, function (err, hash) {
    //             if (err) {
    //                 console.log("Error while hashing password");
    //                 console.log(err);
    //                 res.render(__dirname + "/pages/login.ejs", {errMsg:"Server side hashing error. Please try again.", successMsg:""});
    //                 return;
    //             }
    
    //             // Create the new user now that all validations are done
    //             const success = db.createNewUser(email, hash, username);
    
    //             if (success) {
    //                 // Render login page with a success message
    //                 res.render(__dirname + "/pages/login.ejs", {errMsg:"", successMsg:"Successfully created account! You may now login."});
    //             } else {
    //                 // Render login page with an error message
    //                 res.render(__dirname + "/pages/login.ejs", {errMsg:"Error creating user. Please try again.", successMsg:""});
    //             }
    //         });
    //     });
    // });
    




// ... (other routes and server setup)

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




app.listen(port, () => {
    console.log(`server running on port ${port} and path ${__dirname}.`);
    
})

