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
const server = http.createServer(app);

const { Server: SocketIo } = require("socket.io");


const {createProxyMiddleware} = require("http-proxy-middleware");
const cors = require("cors");

const corsOptions = {
    origin: ["http://localhost:3000"],
    credentials: true
}


app.use(cors(corsOptions));


const apiRoutes = require("./routes/apiRoutes.js")
const authRoute = require("./routes/authRoute.js")
const googleAuthRoute = require("./routes/googleAuthRoute.js")
const indexRoute = require("./routes/indexRoutes.js") //NOTE: rules page still not updated for cards against humanity
const settingsRoute = require("./routes/settingsRoute.js"); //NOTE: can sometimes cause crashes if updating when signed in with google
const Game = require("./game.js");

// initialising server (mounting middleware)

const port = 3001;
app.use(bodyParser.urlencoded({extended: true})); //middleware to parse form
app.use(express.static(path.join(__dirname, '../client/public/images')));    
app.use(express.static(path.join(__dirname, '../client/public/css')));
//serving react
app.use(express.static(path.join(__dirname, '../client/src')));
app.use(express.static(path.join(__dirname, '../client/public/others')));



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

const db = require("./utils/database.js");
(async () => { //alternative method of asynchronous
    try {
       await db.connect();
       db.initTables(); 
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

const sessionMiddleware = session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        store: sessionStore,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, //time in milliseconds => made it so session expires after one day
            sameSite: 'Lax',
        }
    })

app.use(sessionMiddleware);

//ROUTES
app.use('/', authRoute);
app.use('/', googleAuthRoute);
app.use('/', indexRoute);
app.use('/', settingsRoute);
app.use('/', apiRoutes);


const io = new SocketIo (server, {
    cors: corsOptions,
    reconnection: true,
    reconnectionAttempts: 100,
    reconnectionDelay: 1000,
})

io.engine.use(sessionMiddleware);

const rooms = {};

io.on("connection", (socket) => { 
    const session = socket.request.session;
    socket.on("joinRoom", (roomId, points, numOfCards) => {
        const user = session.user;
        if(!rooms[roomId]) {            
            rooms[roomId] = new Game(io, roomId, points, numOfCards);
            if(user) {
                db.createRoom(user, roomId, (err) => {
                    if(err){
                        console.error("database error:", err);
                    }
                })
            }
        }
        rooms[roomId].join(socket, session);
        console.log("appending players in db");
        db.appendPlayersinDB(roomId, true, (err) => { //increases value of player column for that corresponding roomid in db
            if(err){
                console.log("Database Error: ", err);
            }
        })
    })
    
    socket.on('startGame', (roomId) => {
        console.log("startgame received");
        rooms[roomId].initRound(true, session)
    });

    socket.on("playCard" , (index, roomid) => {
        rooms[roomid].handlePlayCard(index, session) //remove the parameters which arent needed later
    })

    socket.on("selectWinner", (roomid, winningUser) => {
        console.log("handleSelect received")
        rooms[roomid].handleSelect(winningUser, session )
    })

    socket.on("advanceRound", (roomid) => {
        rooms[roomid].handleAdvance(session)
    })

    socket.on("sendMessage", (roomId, message, callback) => {
        console.log(`Received sendMessage event from user ${message.user} in room ${roomId}`);
        
        const messageWithId = { ...message, messageId: `${new Date().getTime().toString()}${Math.floor(Math.random() * 100000)}` };
    
        // Log message details
        console.log("Message details:", messageWithId);
    
        // Ensure callback is called only once
        callback("sent");
    
        // Log before emitting the message
        console.log(`Emitting chatMessage event to room ${roomId}`);

        // Log the list of sockets in the room
        const roomSockets = io.of("/").adapter.rooms.get(roomId);
        console.log("Sockets in the room:", roomSockets);
    
        io.to(roomId).emit("chatMessage", messageWithId);
    });

    

    // handle player disconnecting (refresh, close tab etc.)
    // socket.on("disconnect", () => {
    //     const roomid = socket.roomid
    //     if(rooms[roomid]) {
    //         rooms[roomid].disconnectPlayer(session.user)
    //     }
    // })
})

server.listen(port, () => {
    console.log(`server running on port ${port} and path ${__dirname}.`);
    
})