// IMPORTS
const express = require("express");
const app = express();
const bcrypt = require("bcrypt"); 
const database = require("./database");
const middleware = require("./middleware");
const ejs = require("ejs")
const bodyParser = require("body-parser");
const path = require("path");
const {Database} = require("./database.js")

//initialising database
const db = new Database();
db.connect();
db.createTables();

////// NOW COMPARE TO HOW DONE IN FLASHCARDS DECKIFY. ALSO SEE IF ANY POSSSIBLE ERROR CHECKING STUFFFF..
///// THEN LOOK AT UDEMY VIDEOS AND MOVE ON TO NEXT PART.

// initialising server (mounting middleware)
const port = 3000;
app.use(express.static(path.join(__dirname, 'public')));
app.use(middleware.logPaths);
app.use(bodyParser.urlencoded({extended: true})); //middleware to parse form
app.use(express.json()); //allows to use json format => maybe hardcode ourselves for +complexity though?
app.use(middleware.logger); //maybe later at some point have this in the middleware.js file
app.set('view engine', 'ejs')

// add sessions etc. later

app.get('/', (req, res)=>{
    res.render(__dirname + "/views/register.ejs", {error:"", success:""})
})



app.post('/registersubmit',(req,res) => { //unfinished: need to finish DB first.
    const pwd = req.body.pwd;
    const username = req.body.username
    const email = req.body.email

    //hashing
    const saltRounds = 15;
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(pwd, salt, function(err, hash) {
            // Store hash in sql database
            if(err) { 
                console.log("ERROR: hashing error")
                console.log(err)
                res.render(__dirname + "/views/register.ejs", {errMsg:"Error while hashing. Please try again.",successMsg:""});
                return;
            }

        });
    });
})

app.post('/loginsubmit',(req,res) =>{
    
})




app.listen(port, () => {
    console.log(`server running on port ${port} and path ${__dirname}.`);
    
})

