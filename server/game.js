//TODO: update the cards.json file to include more cards -- ensure same format

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const fs = require("fs");
const entities = require("entities");
const CircularQueue = require("./helpers/circularQueue.js"); //for use later => when changing which player is czar
const CardStack = require("./helpers/cardStack.js");
const db = require("./utils/database.js");

class Game {
  constructor(io, roomId) {
    this.io = io;
    this.db = db;
    this.players = [];
    this.board = {
      roomId,
      whiteDeck: [], //deck of all white cards
      blackDeck: [], //deck of all black cards
      playedBlackCard: [], //current black card which is being played
      playedWhites: [], 
      czar: null,
      selected: false,
      picking: false,
      statusLog: [],
    };
    this.started = false; //how to use this??
    this.gameOver = false;
    this.decks = [];
    this.gameStarted = false;

    this.czarQueue = null //for now... => need to change this laterrrrr


    this.addCards(true, true); 
    this.updateLog("newRoom")
    
  }

  join(socket, session) {
    const { players, board, io } = this;
    let existingPlayer;
  
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      if (player.name === session.user) {
        existingPlayer = player;
        break;
      }
    }
  
    if (!existingPlayer) { //TODO: handle if player already exists etc. later
      socket.roomId = board.roomId;
  
      const newPlayer = {
        name: session.user,
        score: 0,
        status: null, 
        hand: [],
        socket: socket,
        //isjudge: false => for later
      };
  
      this.players.push(newPlayer);
      socket.join(board.roomId);
  
      // Deal exactly 8 random white cards to the new player
    }

    this.updateLog("newPlayer", session)
    this.updateLeaderboard();
  }
  
  addCards(addWhite, addBlack) {
    const { board } = this;
    const jsonContent = JSON.parse(fs.readFileSync('server/cards.json'));
    // const jsonContent = JSON.parse(fs.readFileSync('server/cards_all.json'));

    if (addBlack) {
      board.blackDeck = new CardStack(jsonContent.black.map((blackCard, index) => ({ //used stack so cards already dealt cant be dealt again ("popped" off stack)
        id: index,
        text: entities.decodeHTML(blackCard.text).replace(/_+/g, '_____'), //makes the blank space more prominent
        pick: blackCard.pick
      })));
    }

    if (addWhite) {
      board.whiteDeck = new CardStack(jsonContent.white.map((whiteCard, index) => ({
        id: index,
        text: entities.decodeHTML(whiteCard),
      })));
    }

    this.board.whiteDeck = board.whiteDeck.shuffle() 
    this.board.blackDeck = board.blackDeck.shuffle()
    //shuffling both decks initially for the entire room. 
    //later white cards and black cards are drawn from top of the stack of cards

  }

  updateLeaderboard() {
    const { players, io } = this;
  
    if (!players) {
      console.error("Players array is null or undefined");
      return;
    }

    const sortedPlayers = this.mergeSort([...players]) //mergesort function to sort players based on 1) score and 2) alphabetically
  
    for (const player of sortedPlayers) {
      const leaderboard = sortedPlayers.map(player => ({
        name: player.name,
        score: player.score,
        status: player.status,
      }));
      io.to(this.board.roomId).emit('leaderboard', leaderboard); //emits to specific room the leaderboard is in
      console.log(leaderboard)
      
    }

  }

  updateHand() { //seperate function as seperate from the board => as hand different for each player
    const { io, players, board } = this;
    console.log("board.whitedeck: ", this.board.whiteDeck);
    
    this.players.forEach((player, index) => {
      
      let cardsNeeded = 8 - player.hand //a player must always have exactly 8 players in hand at start of each round
      for (let i = 0; i < cardsNeeded; i++) {
        player.hand.push(this.board.whiteDeck.draw());
      }

      io.to(players[index].socket.id).emit('hand', { type: 'hand', hand: player.hand });
    });    
  }


  
  updateBoard(dontUpdatePicking) { 
    const { io } = this;
    
    //handle if picking cards
    if (this.checkReady() && !this.board.selected && !dontUpdatePicking  ) { //if all players have played required number of cards and cards not already selected by czar
      if(!this.board.picking) {
        this.board.picking = true //sets game state to picking (aka selecting winner)

        console.log("value of picking changed to true");

        let whites = new CardStack(this.board.playedWhites, true)
        this.board.playedWhites = whites.shuffle(); //so that the czar cant tell whose card is whose

      }
    }



    io.to(this.board.roomId).emit('board', {data: this.board}) //emits to every player in the room - is there an easier way of making this work wrt the black card?
    console.log("board data emitted")
    console.log("value of picking is: ", this.board.picking);
  }

  updateLog(logMessage, session, winningPlayer, finalPhrase) {
    
    let log;
    switch (logMessage) {
      case "gameStarted":
        log = `New game started with ${this.players.length} players. Please select a card`;
        break;
    
      case "newPlayer":
        if (this.players.length < 3) {
          log = `${session.user} has joined the room. ${3 - this.players.length} players required to start the game.`;
        } else {
          log = `${session.user} has joined the room. Press START to start the game.`;
        }
        break;
    
      case "newRoom":
        log = `new room created with room ID ${this.board.roomId}`;
        break;
    
      case "cardPlayed":
        log = `${session.user} has selected a card.`;
        break;
    
      case "allPlayed":
        log = `All players have now played. The czar (${this.board.czar}) is now selecting the winner ....`;
        break;
      
      case "cardWon":
        log = `${winningPlayer} has won the round! The final phrase is: "${finalPhrase}"`
        break;
      case "roundStarted":
        log = `new round started with ${this.players.length} players` //later also have round number here
      default:
        break;
    }    
    const timestamp = new Date().toLocaleTimeString();
    this.board.statusLog.push(`[${timestamp}] ` + log);


    this.updateBoard(true);
  }

  handlePlayCard(index, session ){ //when a player plays one of their white cards on their hand
    const playerName = session.user;
    const {io, players, board} = this;

    let currentPlayer = this.players.find(p => p.name === session.user)
    const playerIndex = this.players.indexOf(currentPlayer);
    console.log("handlePlayCard received [?]")

    if(!this.gameOver && !board.picking && this.players[playerIndex].status !== "played" && session.user !== this.board.czar){

      console.log("session.user is: ", session.user);
      console.log("currentPlayer is: ", currentPlayer);

      let playerWhites = this.board.playedWhites.find(w => w.playerName === playerName);

      if (!playerWhites) {

        playerWhites = {playerName, cards: [], winner: false} //iswinner used so that can later set state of specific card to be winning card
        this.board.playedWhites.push(playerWhites) 

      }
      console.log("this.board.playedblackcard: ", this.board.playedBlackCard);

      if(playerWhites.cards.length < (this.board.playedBlackCard[0].pick)) { 
        
        playerWhites.cards.push(currentPlayer.hand[index]); //places played card from hand to board
        currentPlayer.hand.splice(index, 1); //removed card thats played from hand
        this.updateLog("cardPlayed", session);

        if (playerWhites.cards.length >= (this.board.playedBlackCard[0].pick)) { //if have picked as many cards as allowed by the black card's pick value
          this.players[playerIndex].status = "played"

          if(this.checkReady()){
            this.updateLog("allPlayed");
          }
          
        }
        console.log("playedwhites.cards: ", playerWhites.cards)
  
        console.log("this.board.playedwhites: ", this.board.playedWhites);

        io.to(players[playerIndex].socket.id).emit('hand', { type: 'hand', hand: currentPlayer.hand });
        this.updateLeaderboard();
        this.updateBoard();
      } 

    }
    
  }
  handleSelect(winningUser, session){ //for when the czar selects one of their cards to be winner 

    if(!this.gameOver && session.user === this.board.czar && !this.board.selected) {
      let currentPlayer = this.players.find(p => p.name === winningUser)
      currentPlayer.score += 1
      this.board.selected = true;
      this.board.picking = false;

      

      let blackPhrase = this.board.playedBlackCard[0].text;
      let playerWhites = this.board.playedWhites.find(w => w.playerName === winningUser);
      playerWhites.winner = true //set property of the selected card to be the winner

      this.db.increaseLeaderboardWins(winningUser, (err) => {
        if(err) {
          console.log("error increasing wins in database: ", err)
        }
      })

      

      

      const fillBlanks = (phrase, cards) => { //to complete the full phrase using blanks in black card and white card
        let blankCount = phrase.match(/_____/g) ? phrase.match(/_____/g).length : 0;
        
        if (blankCount === 0) {
          // If no blanks, concatenate the full blackPhrase with the 0th index of playerWhites.cards
          return `${phrase} ${cards[0].text}`;
        } else {
          // If there are blanks, replace them with values from playerWhites.cards sequentially
          let replacedPhrase = phrase.replace(/_____/g, match => {
            if (cards.length > 0) {
              const replacement = cards.shift().text;
              return replacement;
            } else {
              return match; // If there are no more cards, leave the blank as is
            }
          });
      
          return replacedPhrase;
        }
      };

      console.log("playerwhites: ", playerWhites);
      console.log("playerWhites.cards: ", playerWhites.cards);
      let finalPhrase = fillBlanks(blackPhrase, playerWhites.cards);
      console.log(finalPhrase)
      this.updateLog("cardWon", null, winningUser , finalPhrase) 

      this.updateLeaderboard();
      this.updateBoard();

    }


  }
  handleAdvance(session) { //for when the czar advances the round to start following round 
    if(this.board.czar === session.user) {
      this.initRound(false, session)
    }
  }

  initRound(isNewGame, session) { //could make it easier by using this function whenever start game / new round. Would init values here
    const {io} = this;
    
    this.board = {
      ...this.board,
      playedBlackCard: [],
      playedWhites: [],
      selected: false,
      picking: false,
      gameOver: this.gameOver,

    }

   

    this.board.playedBlackCard.push(this.board.blackDeck.draw()); //initialising the blackcard for the round
    console.log(`advancing turn in room ${this.board.roomId} `)
    if (isNewGame) { 
      
      this.czarQueue = new CircularQueue(this.players.length); //initialising circular queue
      this.players.forEach(player => this.czarQueue.enQueue(player))
      this.updateLog("gameStarted");

      io.to(this.board.roomId).emit('gameStarted');
      this.gameStarted = true
      
      
    } else { //for when its a new round but not start of new game. Maybe check for winner
      this.updateLog("roundStarted")
    }
    this.rotateCzar()

    this.players.forEach(p => {
      if(p.name === this.board.czar) { //ensure that czar cant play cards by setting status to "played"
        p.status = "played"
      } else {
        p.status = null
      }
    })

    

    console.log("players: ", this.players)
    
    this.updateHand();
    this.updateLeaderboard()  
    this.updateBoard();
   
  }

  rotateCzar() {
    
    

    const newCzar = this.czarQueue.deQueue()
    this.czarQueue.enQueue(newCzar) //moving the czar to the back of the queue to be the next czar

    this.board.czar = newCzar.name;

    

  }

  checkReady() { //returns true if all players in room have played their cards
    let readyPlayers = 0;
      for (let i = 0; i < this.players.length; i++) {
        if (this.players[i].status === "played") {
          readyPlayers += 1
        }
      }
      console.log("readyplayers: ", readyPlayers);
      if(readyPlayers === this.players.length) {
        return true
      } else {
        return false
      }
  }


  //maybe have these 2 following functions as part of a seperate class (??) => not sure
  mergeSort(arr) {
    if (arr.length <= 1) {
      return arr;
    }

    const middle = Math.floor(arr.length / 2);
    const left = arr.slice(0, middle);
    const right = arr.slice(middle);

    return this.merge(
      this.mergeSort(left),
      this.mergeSort(right)
    );
  }

  merge(left, right) {
    let result = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
      if (left[leftIndex].score > right[rightIndex].score) {
        result.push(left[leftIndex]);
        leftIndex++;
      } else if (left[leftIndex].score < right[rightIndex].score) {
        result.push(right[rightIndex]);
        rightIndex++;
      } else {
        // Scores are equal, compare alphabetically
        if (left[leftIndex].name.localeCompare(right[rightIndex].name) <= 0) {
          result.push(left[leftIndex]);
          leftIndex++;
        } else {
          result.push(right[rightIndex]);
          rightIndex++;
        }
      }
    }

    return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
  }


}



module.exports = Game;