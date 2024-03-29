//creating backend API to be used in react

const express = require("express");
const router = express.Router();
const db = require("../utils/database.js");

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
                message:msg
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

router.post('/api/createCustomDeck', (req, res) => {
  const { blackCards, whiteCards, code, deckName } = req.body;
  console.log("white cardsd: ", whiteCards)
  console.log("black cards: ", blackCards)
  let deckCode, isDeckNameUsed

  db.checkDeckName(deckName, (err, nameUsed) => {
    if(nameUsed) {
      isDeckNameUsed = true
    } else if (err) {
      console.log("db error: ", err)
    }

  })

  if(isDeckNameUsed && !code) {
    res.json({success: false, message: "Deck name already used"})
  
  } else {

    if(!code) { //as dont want to generate a new deck code for the exact same deck (regardless of whether cards have been added to it / changed)
      // Generate a unique code
      deckCode = generateRandomCode()
    
    } else {
      deckCode = code
    }
    const deckCreator = req.session.user
    console.log("dc is: ", deckCreator)
    
    db.addDeck(deckCode, deckCreator, deckName, true, (err) => { 
      if(err) {
        console.log("error inserting deck into database: ", err)
      } else {
        whiteCards.forEach(w => {
          db.addCard(deckCode, w, "White", null, (err) => {
          })
        })

        blackCards.forEach(b => {
          db.addCard(deckCode, b.text, "Black", b.pick , (err) => {
          })
        })
      }
    })
    res.json({ success: true, deckCode: deckCode });
  } 
});

router.get('/api/getDeckInfo/:code', (req, res) => {
  const deckCode = req.params.code;

  db.retrieveDeckInfo(deckCode, (err, deck, deckExists) => {
    if(err) {
      console.log("error: ", err)
    } else if (deckExists) {
      db.retrieveCard(deckCode, (err, whiteCards, blackCards) => {
        if(!err) {
          res.json({
            success: true,
            deck: deck,
            whitecards: whiteCards,
            blackcards: blackCards
          })
        } else {
          console.lot("error: ", err)
        }
      })

    } else if (!deckExists) {
      res.json({ success: false, message: 'Deck not found' });
    }
  }) 
});

router.get('/api/getAllDecks', (req, res) => {

  db.getCustomCodes((err, deckcodes) => {
    if(err) {
      console.log("error: ", err)
    } else {

      let decks = []
      let n = 0
      deckcodes.forEach(deckCode => {
        db.retrieveDeckInfo(deckCode, (err, deckInfo, deckExists) => {
          if(err) {
            console.log("error: ", err)
          } else {
            decks.push(deckInfo)
            n += 1
            if(n===deckcodes.length) {
              res.json({success: true, decks: decks })
            }
          } 
        })

      })
    }
  })
})




    
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