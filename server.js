// imports

const express = require("express");
const app = express();
const bcrypt = require("bcrypt"); 
const database = require("./database");
const middleware = require("./middleware");
const ejs = require("ejs")
const bodyParser = require("body-parser");
const path = require("path");
const {Database} = require("./database.js")



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


app.post('/signup', (req, res) => {
    const email = req.body.email; // get values from form
    const username = req.body.username;
    const password = req.body.password;

    var validateTest = db.validate(email, username, password); // validates data
    var handleAccCreation = (valid) => { // this function runs if data is valid
        if(!valid) { // if username already exists
            res.render(__dirname + "/views/register.ejs", {error:"Username already exists. Please choose another.",success:""});
            return;
        }
        bcrypt.hash(password, 10, function (err,hash) {
            if(err) { // if hash for whatever reason doesn't work
                console.log("Error while hashing password")
                console.log(err)
                res.render(__dirname + "/views/register.ejs", {error:"Server side hashing error. Please try again.",success:""});
                return;
            }
            db.createNewUser(email, hash, username); // create the new user now that all validations are done
            res.render(__dirname + "/views/login.ejs", {error:"",success:"Successfully created account! You may now login."});
        })
    }
    if(!validateTest) { //if server side validation returns false
        res.render(__dirname + "/views/register.ejs", {error:"Server side validation error. Please try again.",success:""});
        return;
    } else {
        db.checkUserAvailable(username, handleAccCreation) // checks if username is available
    }
})











app.post('/signin',(req,res) =>{
    
})




app.listen(port, () => {
    console.log(`server running on port ${port} and path ${__dirname}.`);
    
})

