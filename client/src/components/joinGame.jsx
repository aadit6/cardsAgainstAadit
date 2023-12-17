// JoinGame.jsx

import React, { useRef, useState } from 'react';
import axios from 'axios';

const JoinGame = ({ onJoin }) => {
  const joinGameInputRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinGame = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3001/api/checkRoom', {
        roomCode: joinGameInputRef.current.value,
      });

      if (response.data.success) {
        onJoin(response.data.room);
      } else {
        setErrorMsg(response.data.message || 'Error joining the game.');
      }
    } catch (error) {
      console.error('Error joining game:', error);
      setErrorMsg('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleJoinGame}>
        <label htmlFor="roomCode">Enter Room Code:</label>
        <input
          type="text"
          id="roomCode"
          ref={joinGameInputRef}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          Join Game
        </button>
      </form>
      {errorMsg && <p>{errorMsg}</p>}
    </div>
  );
};

export default JoinGame;