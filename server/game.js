const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server);
const cards = require("./cards.json")

class Game {
    constructor () {
        return;
    }
}

function shuffle(array) { //complex user-defined algorithm: Fisher-Yates shuffle
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;
  
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }