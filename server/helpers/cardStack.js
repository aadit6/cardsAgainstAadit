class CardStack { //javascript implementation of a stack
    constructor(cards, returnArray) {
      this.stack = cards || [];
      this.returnArray = returnArray
    }
  
    shuffle() { //fisher-yates shuffling algorithm
      let temp, randomIndex;
  
      while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
  
        // Swap the elements
        temp = this.stack[currentIndex];
        this.stack[currentIndex] = this.stack[randomIndex];
        this.stack[randomIndex] = temp;
      }
      if (this.returnArray) {
        return this.stack;

      } else {

        return this
        
      }
    }
  
    draw() {
      // Pop the top card off the stack
      return this.stack.pop();
    }
  
    addCards(cards) {
      // Push cards onto the stack
      this.stack.push(...cards);
    }

  }

  module.exports = CardStack;