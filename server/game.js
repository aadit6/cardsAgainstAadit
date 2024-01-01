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
      playedBlackCard: {},
      playedWhiteCards: [],
      czar: 0,
      selected: false,
      picking: false,
    };
    this.started = false;
    this.log = [];  //some reason commenting this out makes leaderboard not work
    this.decks = [];

    this.addCards = this.addCards.bind(this); //binds method to current instance => come back to this
    this.updateBoard = this.updateBoard.bind(this);
    this.updateHand = this.updateHand.bind(this);
    this.updateLeaderboard = this.updateLeaderboard.bind(this);
    this.playTurn = this.playTurn.bind(this);
    this.handlePlay = this.handlePlay.bind(this);

    this.addCards(true, true); 
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
  
    io.to(board.roomId).emit('join_ack', { name: session.user });
  

    this.updateLeaderboard();
    this.updateHand(socket);
    this.updateBoard(socket);

  }
  
  addCards(addWhite, addBlack) {
    const { board } = this;
    const jsonContent = JSON.parse(fs.readFileSync('server/cards.json'));

    if (addBlack) {
      board.blackDeck = new CardStack(jsonContent.black.map((blackCard, index) => ({
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

    this.board.whiteDeck = board.whiteDeck.shuffle() //originally had .stack here
    console.log("board.whiteDeck is: ", this.board.whiteDeck)
    // board.blackDeck = blackCardStack.shuffle().stack;
  }


  handleSelect() {

  }

  handlePlay() {

  }

  handleAdvance() {

  }

  playTurn() { //FINISH LATER
    const {players, board, updateBoard, updateHand, updateLeaderboard} = this;
    console.log(`advancing turn in room ${board.roomId}`);




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
  
  
  
  
  
  

  updateHand(socket) { //tbh no need for the (socket) right now => later may have situation where we do if(socket) but not sure why...
    const { io, board, players } = this;
      // Each player gets exactly 8 cards
    let whiteCards = []
    for (let i = 0; i < 8; i++) {
      whiteCards.push(board.whiteDeck.draw())
    }
    board.playedWhiteCards = whiteCards
    console.log("played white cards: ", board.playedWhiteCards);
      // Broadcast the new player's hand to the specific player
    io.to(players[players.length - 1].socket.id).emit('hand', { type: 'hand', hand: board.playedWhiteCards });
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

  updateBoard(socket) {
    const { io, board, players } = this;
    

    // const playerBlackDeck = board.blackDeck.slice();
    // const shuffledBlackDeck = shuffle

    io.to(board.roomId).emit('board', {data: board})



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