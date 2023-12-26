    //creating backend API to be used in react

    const express = require("express");
    const router = express.Router();
    const db = require("../utils/database.js")
    const session = require("express-session");

    // const dir = `C:\\Users\\aaditnagpal\\Documents\\A-Level Computer Science\\NEA\\pokerGameNEA\\server`;

    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Replace with your client's origin
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });
    
    router.post("/api/checkRoom", (req, res) => {
        const {roomCode} = req.body;
        console.log("Request Headers:", req.headers);
        console.log("Cookies:", req.cookies);
        db.checkRoomExists(roomCode, (msg, roomExists) => { 
            if (roomExists) {
                db.returnPlayersinRoom(roomCode, (err, numOfPlayers) => {
                    console.log("number of players is:::", numOfPlayers);
                    if (numOfPlayers >= 2) {
                        res.json({
                            success: false,
                            message: "Room is full (MAX 6 PLAYERS)"
                        })
                    } else {
                        res.json({
                            success: true,
                            message: msg
                        })
                    }
                }) 
            } else {
                res.json({
                    success: false,
                    message: msg
                })
            }
        })
    })

    router.get('/api/getCurrentUser', (req, res) => {
        console.log("Request Headers:", req.headers);
        console.log("Cookies:", req.cookies);
    
        const session = req.session;
        console.log("req.session:", req.session);
        console.log("req.session.user: ", req.session.user);
    
        if (session && session.user) {
            res.json({
                success: true,
                currentUser: session.user,
            });
        } else {
            res.json({
                success: false,
                message: "No user found in the current session.",
            });
        }
    });
    

    module.exports = router;