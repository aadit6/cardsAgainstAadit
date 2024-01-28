    //creating backend API to be used in react

    const express = require("express");
    const router = express.Router();
    const db = require("../utils/database.js")

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


    //API ROUTES FOR CUSTOM DECKS

    const customDecks = {};

    router.post('/api/createCustomDeck', (req, res) => {
      const { blackCards, whiteCards, code, deckName } = req.body;
      let deckCode;
      console.log("blackCards, WhiteCards are: ", blackCards, whiteCards)
      
      if(!code) { //as dont want to generate a new deck code for the exact same deck (regardless of whether cards have been added to it / changed)
        // Generate a unique code
        do {
          deckCode = generateRandomCode();
        } while (customDecks.hasOwnProperty(deckCode));
      
      } else {
        deckCode = code
      }
      console.log("session: ", req.session)
      const deckCreator = req.session.user
      
      customDecks[deckCode] = { deckName, deckCreator, blackCards, whiteCards };
      console.log("customDecks: ", customDecks)
      res.json({ success: true, deckCode: deckCode });
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