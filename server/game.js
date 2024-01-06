//TODO: update the cards.json file to include more cards -- ensure same format

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const fs = require("fs");
const entities = require("entities");
const Queue = require("./helpers/queue.js"); //for use later => when changing which player is czar
const CardStack = require("./helpers/cardStack.js");

class Game {
  constructor(io, roomId) {
    this.io = io;
    this.players = [];
    this.board = {
      roomId,
      whiteDeck: [], //deck of all white cards
      blackDeck: [], //deck of all black cards
      playedBlackCard: [], //current black card which is being played
      playedWhites: [], 
      czar: 0,
      selected: false,
      picking: false,
      statusLog: [],
    };
    this.started = false; //how to use this??
    this.gameOver = false;
    this.decks = [];

    this.addCards = this.addCards.bind(this); //binds method to current instance => come back to this
    this.initBoard = this.initBoard.bind(this);
    this.initHand = this.initHand.bind(this);
    this.updateLeaderboard = this.updateLeaderboard.bind(this);
    // this.playTurn = this.playTurn.bind(this);
    // this.handlePlay = this.handlePlay.bind(this);
    this.updateLog = this.updateLog.bind(this);


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
        status: "played", //is this needed??
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

    if (addBlack) {
      board.blackDeck = new CardStack(jsonContent.black.map((blackCard, index) => ({ //used stack so cards already dealt cant be dealt again ("popped" off stack)
        id: index,
        text: entities.decodeHTML(blackCard.text).replace(/_+/g, '_____'),
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
  
    for (const player of players) {
      const leaderboard = players.map(player => ({
        name: player.name,
        score: player.score,
        status: player.status,
      }));
  
      // Emit to the specific room the player is in
      console.log(leaderboard);
      io.to(this.board.roomId).emit('leaderboard', leaderboard);
      
    }
  }

  initHand() { //seperate function as seperate from the board => as hand different for each player
    const { io, players, board } = this;
    console.log("board.whitedeck: ", this.board.whiteDeck);
    this.players.forEach((player, index) => {
      for (let i = 0; i < 8; i++) {
        player.hand.push(this.board.whiteDeck.draw());
      }

      io.to(players[index].socket.id).emit('hand', { type: 'hand', hand: player.hand });
    });    
  }


  
  initBoard() { //rename to sendBoard => or combine this function with something else ??? idk
    const { io } = this;
  
    io.to(this.board.roomId).emit('board', {data: this.board}) //emits to every player in the room - is there an easier way of making this work wrt the black card?
  }

  updateLog(logMessage, session) {
    
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
        log = `All players have now played. Czar now selecting winner ....`;
        break;
    
      default:
        break;
    }    
    const timestamp = new Date().toLocaleTimeString();
    this.board.statusLog.push(`[${timestamp}] ` + log);


    this.initBoard();
  }

  handlePlayCard(text, index, roomid, session ){ //when a player plays one of their white cards on their hand
    const playerName = session.user;
    const {io, players, board} = this;

    let currentPlayer = this.players.find(p => p.name === session.user)
    const playerIndex = this.players.indexOf(currentPlayer);

    if(!this.gameOver && !board.picking && this.players[playerIndex].status !== "played"){ //add stuff about being czar. Maybe add isJudge to the players array

      console.log("session.user is: ", session.user);
      console.log("currentPlayer is: ", currentPlayer);

      let playerWhites = this.board.playedWhites.find(w => w.playerName === playerName);

      if (!playerWhites) {

        playerWhites = {playerName, cards: []}
        this.board.playedWhites.push(playerWhites) //sort out how this works to display all white cards on board in react

      }

      if(playerWhites.cards.length === 0) { //later change this to value of blackcard pick - 1
        
        playerWhites.cards.push(currentPlayer.hand[index]); //places played card from hand to board
        currentPlayer.hand.splice(index, 1); //removed card thats played from hand
        this.updateLog("cardPlayed", session);

        if (playerWhites.cards.length >= 1) { //remember replace the 1 with value of black card pick - 1
          this.players[playerIndex].status = "played"
          let readyPlayers = 0;
          for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].status === "played") {
              readyPlayers += 1
            }
          }
          console.log("readyplayers: ", readyPlayers);
          if(readyPlayers === this.players.length) {
            this.updateLog("allPlayed")
            //anything else want to add once all players have played???
          }
        }
        console.log("playedwhites.cards: ", playerWhites.cards)
  
        console.log("this.board.playedwhites: ", this.board.playedWhites);

        io.to(players[playerIndex].socket.id).emit('hand', { type: 'hand', hand: currentPlayer.hand });
        this.initBoard();
        io.to(this.board.roomId).emit('updateUser', {data: session.user})
      } 

    }
    
  }
  handleSelect(){ //for when the czar selects one of their cards to be winner

  }
  handleAdvance() { //for when the czar advances the round to start following round

  }
  initRound(newGame, session) { //could make it easier by using this function whenever start game / new round. Would init values here
    const {io} = this;
    
    this.board = {
      ...this.board,
      playedBlackCard: [],
      playedWhites: [],
      selected: false,
      picking: false,
      gameOver: this.gameOver,
      //turn: => add this eventually 
      //czar => add this eventually

    }

    this.board.playedBlackCard.push(this.board.blackDeck.draw()); //initialising the blackcard for the round
    console.log(`advancing turn in room ${this.board.roomId} `)
    if (newGame) { 
      this.initHand();
      this.initBoard();
      this.updateLog("gameStarted");

      io.to(this.board.roomId).emit('gameStarted');
      
      
    } else {

    }

    this.players.forEach(p => {
      if(1===0) { //change this when implement czar / changing of czar functionality
        p.status = "played"
      } else {
        p.status = null
      }
    })

    // this.updateHand()
    // this.updateLeaderboard()
    // this.updateLeaderboard()

    //(what it has on other one)
    
    
  }

}

function checkReady(players) { //goes through each player + checks if connected
  for (let i = 0; i < players.length; i++) {
    if (players[i].status !== 'played' && players[i].socket.connected) { 
      return false;
    }
  }
  return true;


}


module.exports = Game;