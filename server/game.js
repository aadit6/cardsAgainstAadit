//TODO: update the cards.json file to include more cards -- ensure same format

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const fs = require("fs");
const entities = require("entities");
const Queue = require("./helpers/queue.js"); //for use later => when changing which player is czar

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
    this.log = []; //sort this out later with log.push. Maybe later turn this into a stack???
    this.decks = [];

    this.addCards = this.addCards.bind(this); //binds method to current instance => come back to this
    this.updateBoard = this.updateBoard.bind(this);
    this.updateHand = this.updateHand.bind(this);
    this.updateLeaderboard = this.updateLeaderboard.bind(this);
    this.playTurn = this.playTurn.bind(this);
    this.handlePlay = this.handlePlay.bind(this);

    this.addCards(true, true); //figure out how ill actually use this later...
  }

  join(socket, session) {
    const { players, board, io} = this;
    let existingPlayer;

    for (let i = 0; i < players.length; i++) { //checking if already player with this name in room
      const player = players[i];
      if (player.name === session.user) {
        existingPlayer = player;
        break;
      }
    }

    if(existingPlayer && existingPlayer.connected) {
      console.log("join attempt refused")
      return socket.emit("refuse join") //how to tell player user already in room (some some way of having popup??)
    } else if (existingPlayer && !existingPlayer.connected) {
      //reconnect the player
      socket.id = existingPlayer.id;
      existingPlayer.socket = socket;
      existingPlayer.status = "played" //cant play till next round (fix later if needed)
    } else if (!existingPlayer) {
      socket.roomId = board.roomId;
      
      const newPlayer = {
        name: session.user,
        score: 0,
        hand: [],
        status: "played",
        socket: socket,
      };
      this.players.push(newPlayer)
      socket.join(board.roomId);
      console.log("players: ", players);
    }

    this.io.to(board.roomId).emit('join_ack', { name: session.user});
    
    this.updateLeaderboard();
 
    this.updateBoard(socket);

    this.updateHand(socket);


    //handle disconnect stuff later



    
  }



  addCards(addWhite, addBlack) {
    const { board } = this;
    const jsonContent = {
      board: {
        whiteDeck: [],
        blackDeck: [],
      },
    };

    // Load the content of the single cards.json file
    const deckContents = fs.readFileSync('server/cards.json'); //reading file and parsing json

    // Add the black cards.
    if (addBlack) {
      const blackCards = JSON.parse(deckContents).black;

      for (const blackCard of blackCards) {
        blackCard.text = entities.decodeHTML(blackCard.text).replace(/_+/g, '_____');
        jsonContent.board.blackDeck.push(blackCard);
      }
    }

    // Add the white cards.
    if (addWhite) {
      const whiteCards = JSON.parse(deckContents).white;

      for (const whiteCard of whiteCards) {
        jsonContent.board.whiteDeck.push(entities.decodeHTML(whiteCard));
      }
    }


    board.whiteDeck = shuffle(jsonContent.board.whiteDeck);
    board.blackDeck = shuffle(jsonContent.board.blackDeck);
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
        hand: player.hand,
        status: player.status,
      }));
  
      // Emit to the specific room the player is in
      console.log(leaderboard);
      io.to(player.socket.roomId).emit('leaderboard', leaderboard);
    }
  }
  
  
  
  
  
  

  updateHand(socket) {
    const { players, io } = this;
  
    if (socket) {
      io.to(socket.id).emit('hand', socket.hand);
    } else {
      for (const player of players) {
        // Notify each player of their hand
        io.to(player.id).emit('hand', player.hand);
      }
    }
  }
  

  updateBoard(socket) {
    const { players, board, io } = this;
    let newBoard = {
      roomId: board.roomId,
      whiteDeck: board.whiteDeck,
      blackDeck: board.blackDeck,
      playedBlackCard: board.playedBlackCard,
      playedWhiteCards: [],
      czar: board.czar,
      selected: board.selected,
      picking: board.picking,
    };
  
    if (board.selected) {
      // Do nothing
    } else if (checkReady(players)) {
      if (!board.picking) {
        board.picking = true;
        shuffle(board.playedWhiteCards);
      }
  
      newBoard.playedWhiteCards = board.playedWhiteCards.map(w => ({ cards: w.cards }));
    } else {
      // Hide cards but show identities so we know who moves
      newBoard.playedWhiteCards = board.playedWhiteCards.map(w => ({ playerIndex: w.playerIndex }));
    }
  
    const boardMsg = { type: 'board', data: newBoard };
  
    if (socket) {
      // Send to just this player
      io.to(socket.id).emit('board', boardMsg);
    } else {
      // Broadcast to all players
      io.emit('board', boardMsg);
    }
  }
  

  



}

function shuffle(deck) { //complex user-defined algorithm: Fisher-Yates shuffle. Maybe alter to have better implementation(?????)
    var currentIndex = deck.length,
      temp,
      randomIndex;
  
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      temp = deck[currentIndex];
      deck[currentIndex] = deck[randomIndex];
      deck[randomIndex] = temp;
    }
  
    return deck;
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