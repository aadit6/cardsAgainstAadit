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
// Assuming db is your Database class instance
app.post('/signup', (req, res) => {
    const {email, username, password} = req.body;
    // Validation function
    const validateTest = db.validateUser(email, username, password, (errMsg) => {
        // Render the login page with an error message if validation fails
        res.render(__dirname + "/views/register.ejs", { error: errMsg, success: "" });
    });

    // If validation fails, return
    if (!validateTest) {
        return;
    }
    // Check if the username is available
    db.checkUserAvailable(username, (isAvailable) => {
        if (!isAvailable) {
            // If username already exists, render login page with an error message
            res.render(__dirname + "/views/register.ejs", { error: "Username already exists. Please choose another.", success: "" });
            return;
        }
        // Hash the password
        const saltRounds = 15;
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(password, salt, function(err, hash) {
                // Store hash in sql database
                if(err) { 
                    console.log("ERROR: hashing error")
                    console.log(err)
                    res.render(__dirname + "/views/register.ejs", {error:"Error while hashing. Please try again.",success:""});
                    return;
                }
            });
            // Create a new user
            db.createNewUser(email, hash, username);
            // Render login page with a success message
            res.render(__dirname + "/views/register.ejs", { error: "", success: "Successfully created account! You may now login." });
        });
    });
});




app.post('/signin',(req,res) =>{
    
})




app.listen(port, () => {
    console.log(`server running on port ${port} and path ${__dirname}.`);
    
})

