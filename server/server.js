// imports
require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
// const fs = require("fs");
const ejs = require("ejs")
const bodyParser = require("body-parser");
const session = require("express-session");
const {OAuth2Client} = require("google-auth-library");
const http = require("http");
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server)
const {createProxyMiddleware} = require("http-proxy-middleware");


const authRoute = require("./routes/authRoute.js")
const googleAuthRoute = require("./routes/googleAuthRoute.js")
const indexRoute = require("./routes/indexRoutes.js")
const settingsRoute = require("./routes/settingsRoute.js")
const apiRoutes = require("./routes/apiRoutes.js");

// initialising server (mounting middleware)

const port = 3001;
app.use(bodyParser.urlencoded({extended: true})); //middleware to parse form
app.use(express.static(path.join(__dirname, '../client/public/images')));    
app.use(express.static(path.join(__dirname, '../client/public/css')));
//serving react
app.use(express.static(path.join(__dirname, '../client/src')));
app.use(express.static(path.join(__dirname, '../client/public/others')));

// app.use("/play", createProxyMiddleware({
//     target: "http://localhost:3000",
//     changeOrigin: true
// }))

app.use(express.json()); //allows to use json format => maybe hardcode ourselves for +complexity though?
function logger(req, res, next) { //to log requests in console
    console.log("Request Method:", req.method)
    console.log("Request URL:", req.urlencoded)
    console.log('Request:', req.url);
    next()
}
app.use(logger);
app.set('view engine', 'ejs')




//initialising database

db = require("./utils/database.js");
(async () => { //alternative method of asynchronous
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

//ROUTES
app.use('/', authRoute);
app.use('/', googleAuthRoute);
app.use('/', indexRoute);
app.use('/', settingsRoute);

// app.use('/api', apiRoutes);


server.listen(port, () => {
    console.log(`server running on port ${port} and path ${__dirname}.`);
    
})




