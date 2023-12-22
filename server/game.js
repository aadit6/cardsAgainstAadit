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
      whiteDeck: [],
      blackDeck: [],
      playedBlackCard: {},
      playedWhiteCards: [],
      czar: 0,
      selected: false,
      picking: false,
    };
    this.started = false;
    this.log = [];
    this.decks = [];

    this.addCards = this.addCards.bind(this); //binds method to current instance => come back to this
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

  updateLeaderboard() {
    const { players, io } = this;
    const leaderboard = [];
  
    for (const p of players) {
      leaderboard.push({
        name: p.name,
        score: p.score,
        id: p.id,
        status: p.status,
        readyState: p.readyState,
      });
      io.to(p.id).emit('leaderboard', leaderboard.slice());
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
  

  updateBoard() {
    const {players, io} = this;
    const names = [];

    for (const player of players) {
      names.push({
        name: player.name,
        score: player.score,
        id: player.id,
        status: player.status,
        readyState: player.readyState

        ///make sure all these values (name, score, id, status, readyState) are properly init/used

      })
    }

    io.emit("leaderboard", names);
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

  module.exports = Game;