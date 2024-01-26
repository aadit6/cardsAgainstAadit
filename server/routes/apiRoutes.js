    //creating backend API to be used in react

    const express = require("express");
    const router = express.Router();
    const db = require("../utils/database.js")
    const session = require("express-session");

    // const dir = `C:\\Users\\aaditnagpal\\Documents\\A-Level Computer Science\\NEA\\pokerGameNEA\\server`;
    
    router.post("/api/checkRoom", (req, res) => {
        const {roomCode} = req.body;
        db.checkRoomExists(roomCode, (msg, roomExists) => { 
            if (roomExists) {
                db.returnPlayersinRoom(roomCode, (err, numOfPlayers) => {  //checks db to ensure max 6 players in room
                    console.log("number of players is:::", numOfPlayers);
                    if (numOfPlayers >= 6) {
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
                    success: false, //if room doesnt exist when trying to join
                    message: msg
                })
            }
        })
    })

    router.get('/api/getCurrentUser', (req, res) => {
    
        const session = req.session;

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


    //API ROUTES FOR CUSTOM DECK

    const customDecks = {};

    router.post('/api/createCustomDeck', (req, res) => {
      const { blackCards, whiteCards } = req.body;
      let deckCode;
    
      // Generate a unique code
      do {
        deckCode = generateRandomCode();
      } while (customDecks.hasOwnProperty(deckCode));
    
      customDecks[deckCode] = { blackCards, whiteCards };
      res.json({ success: true, deckCode });
    });
    
    router.get('/api/getCustomDeck/:code', (req, res) => {
      const deckCode = req.params.code;
      const deck = customDecks[deckCode];
      if (deck) {
        res.json({ success: true, deck });
      } else {
        res.json({ success: false, message: 'Deck not found' });
      }
    });
    
    function generateRandomCode() {
      let randomString = '';
    
      for (let i = 0; i < 10; i++) {
        const randomCharCode = Math.floor(Math.random() * 62);
        if (i % 3 === 0) {
          randomString += String.fromCharCode(randomCharCode % 26 + 65);
        } else if (i % 3 === 1) {
          randomString += String.fromCharCode(randomCharCode % 26 + 97);
        } else {
          randomString += String.fromCharCode(randomCharCode % 10 + 48);
        }
      }
    
      return randomString;
    }
    

    
    

    module.exports = router;