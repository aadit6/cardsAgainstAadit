// imports and constants
const express = require("express");
const app = express();
const bcrypt = require("bcrypt"); //should i use this or crypto - scrypt builtin module?
const database = require("./database");




// initialising server (mounting middleware)
const port = 3000;
app.use(express.urlencoded({extended: true})); //middleware to parse form
app.use("/src", express.static("frontend/src")); //middleware to serve static js files??
app.use(express.json()); //allows to use json format => maybe hardcode ourselves for +complexity though?
function logger(req, res, next) { //custom middleware to log requests in console
    console.log("Request Method:", req.method)
    console.log("Request URL:", req.urlencoded)
    next()
}
app.use(logger); //maybe later at some point have this in the middleware.js file

//add sessions etc. later

app.get('/', (req, res)=>{
    res.render(__dirname + "/frontend/public/login.html", {error:"", success:""})
})

app.post('/loginsubmit',(req,res) => {
    
})

app.post('/registersubmit',(req,res) =>{
    
})



app.listen(port, () => {
    console.log(`server running on port ${port}.`);
    
})

