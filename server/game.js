const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const fs = require("fs");
const entities = require("html-entities");

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
    console.log(jsonContent.board.whiteDeck);
    console.log(jsonContent.board.blackDeck);

    // Optionally, you might want to update the original board as well
    board.whiteDeck = jsonContent.board.whiteDeck;
    board.blackDeck = jsonContent.board.blackDeck;
  }
}

function shuffle(deck) { //complex user-defined algorithm: Fisher-Yates shuffle. Maybe alter to have better implementation(?????)
    //deck is an array
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
  
    return array;
  }

  module.exports = Game;