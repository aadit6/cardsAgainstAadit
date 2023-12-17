// App.js

import React, { useState } from 'react';
import JoinGame from './joinGame';

const App = () => {
  const [currentRoom, setCurrentRoom] = useState(null);

  const handleJoin = (room) => {
    setCurrentRoom(room);
  };

  return (
    <div>
      {currentRoom ? (
        <p>You are in Room: {currentRoom}</p>
      ) : (
        <JoinGame onJoin={handleJoin} />
      )}
    </div>
  );
};

export default App;
