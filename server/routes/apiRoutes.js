    //creating backend API to be used in react

    const express = require("express");
    const router = express.Router();
    const db = require("../utils/database.js");
    const fs = require("fs")

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

      const isDeckNameUsed = Object.values(customDecks).some(deck => deck.deckName === deckName);
      if(isDeckNameUsed && !code) {
        res.json({success: false, message: "Deck name already used"})
     
      } else {

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
        console.log(customDecks[deckCode])

        res.json({ success: true, deckCode: deckCode });

        try {
          const filePath = 'server/cards_all.json'; // Replace with the actual path to your cards_all.json file
      
          // Read the existing content of the file
          const existingContent = fs.readFileSync(filePath, 'utf-8');
          const existingDecks = JSON.parse(existingContent);
      
          // Create a new deck object with the required format
          const newDeck = {
            name: deckName,
            white: whiteCards.map(card => ({ text: card, pack: deckCode })),
            black: blackCards.map(card => ({ text: card.text, pick: card.pick, pack: deckCode })),
            official: false, // Assuming custom decks are not official by default
          };
      
          // Update the existing decks array with the new deck
          existingDecks.push(newDeck);
      
          // Write the updated content back to the file
          fs.writeFileSync(filePath, JSON.stringify(existingDecks, null, 2), 'utf-8');
            
        } catch (error) {
          console.error('Error updating cards_all.json:', error);
        }
      }
      
      
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