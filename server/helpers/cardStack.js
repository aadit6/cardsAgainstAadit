class CardStack { //javascript implementation of a stack
    constructor(cards) {
      this.stack = cards || [];
    }
  
    shuffle() { //fisher-yates shuffle: complex user-defined algorithm
      let currentIndex = this.stack.length;
      let temp, randomIndex;
  
      while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
  
        // Swap the elements
        temp = this.stack[currentIndex];
        this.stack[currentIndex] = this.stack[randomIndex];
        this.stack[randomIndex] = temp;
      }
  
      return this;
    }
  
    draw() {
      // Pop the top card off the stack
      return this.stack.pop();
    }
  
    addCards(cards) {
      // Push cards onto the stack
      this.stack.push(...cards);
    }

    drawMultiple(count) {
        for (let i = 0; i < count; i++) {
          const card = this.draw();
          if (!card) {
            console.warn('Tried to draw from an empty stack.');}
            break;
        }
    }
  }

  module.exports = CardStack;