class CircularQueue {
    constructor(size) {
      this.front = -1;
      this.rear = -1;
      this.size = size;
      this.players = new Array(size);
    }
  
    enQueue(player) {
      if ((this.front == 0 && this.rear == this.size - 1) ||
        (this.rear == (this.front - 1 + this.size) % this.size)) {
        console.log("Queue is Full");
        return;
      } else if (this.front == -1) {
        this.front = this.rear = 0;
        this.players[this.rear] = player;
      } else if (this.rear == this.size - 1 && this.front != 0) {
        this.rear = 0;
        this.players[this.rear] = player;
      } else {
        this.rear = (this.rear + 1) % this.size;
        this.players[this.rear] = player;
      }
    }
  
    deQueue() {
      if (this.front == -1) {
        console.log("Queue is Empty");
        return null;
      }
  
      let player = this.players[this.front];
      this.players[this.front] = null;
  
      if (this.front == this.rear) {
        this.front = -1;
        this.rear = -1;
      } else {
        this.front = (this.front + 1) % this.size;
      }
  
      return player;
    }
  
    displayQueue() {
      if (this.front == -1) {
        console.log("Queue is Empty");
        return;
      }
  
      console.log("\nPlayers in Circular Queue are: ");
  
      if (this.rear >= this.front) {
        for (let i = this.front; i <= this.rear; i++) {
          console.log(this.players[i]);
        }
      } else {
        for (let i = this.front; i < this.size; i++) {
          console.log(this.players[i]);
        }
        for (let i = 0; i <= this.rear; i++) {
          console.log(this.players[i]);
        }
      }
    }
  }

module.exports = CircularQueue;