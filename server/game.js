//TODO: update the cards.json file to include more cards -- ensure same format

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const fs = require("fs");
const entities = require("entities");

class Game {
  constructor(io, gameid) {
    this.io = io;
    this.players = [];
    this.board = {
      roomId, //figure out how to link this with the actual room id --- (?)
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

    this.addCards(true, true);
  }

  join(socket, session) {
    const { players, io, updateRoster, updateBoard, updateHand, runTurn } = this;
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
      const newPlayer = {
        name: session.user,
        score: 0,
        hand: [],
        status: "played",
        socket: socket,
      };
      players.push(newPlayer)
    }

    socket.emit("join_ack", {id: socket.id, name: session.user});
    updateLeaderboard();
    updateBoard(socket);
    updateHand(socket);

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
    const deckContents = fs.readFileSync('server/cards.json');

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
    // console.log("white deck: ", jsonContent.board.whiteDeck);
    // console.log("black deck: ", jsonContent.board.blackDeck);

    board.whiteDeck = shuffle(jsonContent.board.whiteDeck);
    board.blackDeck = shuffle(jsonContent.board.blackDeck);
    // console.log("board: ", board);
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
    const leaderboard = [];
  
    for (const player of players) {
      names.push({
        name: player.name,
        score: player.score,
        hand: player.hand,
        status: player.status,
        socket: player.socket,
      })
    }
      io.to(player.name).emit('leaderboard', leaderboard.slice()); //is it definitely player.name??
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
  

  updateBoard(socket) { //fuck knows what im even doing here....
    const {players, board} = this;
    let newBoard = {
      roomId: board.roomId,
      whiteDeck: board.whiteDeck,
      blackDeck: board.blackDeck,
      playedBlackCard: board.playedBlackCard,
      playedWhiteCards: board.playedWhiteCards,
      czar: board.czar,
      selected: board.selected,
      picking: board.picking,
    }

    if(board.selected) {
      //do nothing
    } else if (checkReady(players)) {
      if(!board.picking) {
        board.picking = true;
        shuffle(board.playedWhiteCards);

        board.playedWhiteCards.forEach((w, i) => {
          board._whiteMappings[i] = w.playerIndex; //does this even belong here ??? - idk
        })

        
      }

      newBoard.playedWhiteCards = [];
      for (const w of board.playedWhiteCards) {
        newBoard.playedWhiteCards.push({ cards: w.cards });
      }
    } else {
      //hide cards but show identities so we know who moves
      newBoard.playedWhiteCards = [];
      for (const w of board.playedWhiteCards) {
        newBoard.playedWhiteCards.push({ playerIndex: w.playerIndex });
      }
    }

    const boardMsg = { type: 'board', data: newBoard };

    if (socket) {
      // Send to just this player
      io.to(socket.id).emit('board', boardMsg);
    } else {
      // Broadcast to all players
      players.forEach(player => {
        io.to(player.socket.id).emit('board', boardMsg);
      });
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