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
      whiteDeck: [],
      blackDeck: [],
      playedBlackCard: [], //changed from {}
      czar: 0,
      selected: false,
      picking: false,
      statusLog: [],
    };
    this.started = false;
    this.decks = [];

    this.addCards = this.addCards.bind(this); //binds method to current instance => come back to this
    this.initBoard = this.initBoard.bind(this);
    this.initHand = this.initHand.bind(this);
    this.updateLeaderboard = this.updateLeaderboard.bind(this);
    // this.playTurn = this.playTurn.bind(this);
    // this.handlePlay = this.handlePlay.bind(this);
    this.updateLog = this.updateLog.bind(this);


    this.addCards(true, true); 
    this.initBlackCard();
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
  
    if (existingPlayer && existingPlayer.connected) {
      console.log("join attempt refused");
      return socket.emit("refuse join");
    } else if (existingPlayer && !existingPlayer.connected) {
      socket.id = existingPlayer.id;
      existingPlayer.socket = socket;
      existingPlayer.status = "played";
    } else if (!existingPlayer) {
      socket.roomId = board.roomId;
  
      const newPlayer = {
        name: session.user,
        score: 0,
        status: "played",
        socket: socket,
      };
  
      this.players.push(newPlayer);
      socket.join(board.roomId);
  
      // Deal exactly 8 random white cards to the new player
      

    }

    this.updateLog("newPlayer", session)
    

    this.updateLeaderboard();
    this.initHand(socket);
    this.initBoard();
    

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

  initHand(socket) { //seperate function as seperate from the board => as hand different for each player
    const { io, players, board } = this;
    console.log("board.whitedeck: ", this.board.whiteDeck);
    let playedWhiteCards = []
    for (let i = 0; i < 8; i++) {
      playedWhiteCards.push(this.board.whiteDeck.draw())
    }
    console.log("played white cards: ", playedWhiteCards);
      // Broadcast the new player's hand to the specific player
    io.to(players[players.length - 1].socket.id).emit('hand', { type: 'hand', hand: playedWhiteCards });
  }

  initBlackCard() {
    this.board.playedBlackCard.push(this.board.blackDeck.draw()); //initialising the blackcard for the first round
    console.log("this.board: ", this.board);
  }

  
  
  

  // updateBoard(socket) {
  //   const { players, board, io } = this;
  //   let newBoard = {
  //     roomId: board.roomId,
  //     whiteDeck: board.whiteDeck,
  //     blackDeck: board.blackDeck,
  //     playedBlackCard: board.playedBlackCard,
  //     playedWhiteCards: [],
  //     czar: board.czar,
  //     selected: board.selected,
  //     picking: board.picking,
  //   };
    
  //   if (board.selected) {
  //     // Do nothing

  //   } else if (checkReady(players)) {
  //     if (!board.picking) {
  //       board.picking = true;
  //       shuffle(board.playedWhiteCards);
  //     }
  
  //     newBoard.playedWhiteCards = board.playedWhiteCards.map(w => ({ cards: w.cards }));
  //   } else {
  //     // Hide cards but show identities so we know who moves
  //     newBoard.playedWhiteCards = board.playedWhiteCards.map(w => ({ playerIndex: w.playerIndex }));
  //   }
  
  //   const boardMsg = { type: 'board', data: newBoard };
  
  //   if (socket) {
  //     // Send to just this player
  //     io.to(socket.id).emit('board', boardMsg);
  //   } else {
  //     // Broadcast to all players
  //     io.emit('board', boardMsg);
  //   }
  // }

  initBoard() {
    const { io, players } = this;
    

    // const playerBlackDeck = board.blackDeck.slice();
    // const shuffledBlackDeck = shuffle


    console.log("Emitting 'board' event:", this.board);

    io.to(this.board.roomId).emit('board', {data: this.board}) //emits to every player in the room - is there an easier way of making this work wrt the black card?
  }

  updateLog(logMessage, session) {
    
    let log;
    if(logMessage === "gameStarted") {
      
      log = `New game started with ${this.players.length} players. Please select a card`
    
    } else if (logMessage === "newPlayer") {
      
      if (this.players.length < 3) {
        log = `${session.user} has joined the room. ${3 - this.players.length} players required to start the game.`
      } else {
        log = `${session.user} has joined the room. Press START to start the game.`
  
      }

    } else if (logMessage === "newRoom") {
      log = `new room created with room ID ${this.board.roomId}`
 
    } else if (logMessage === "cardPlayed") {
      log = `${session.user} has selected a card.`
    }

    const timestamp = new Date().toLocaleTimeString();
    this.board.statusLog.push(`[${timestamp}] ` + log);


    this.initBoard();
  }

  handlePlayCard(text, index, roomid, session ){
    const user = session.user;
    const {players, board} = this;
    console.log("value of text is: ", text);
    console.log("value of index is: ", index);
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