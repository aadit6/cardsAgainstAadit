import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import JoinGameHeader from './JoinGameHeader';
import JoinGameInstructions from './JoinGameInstructions';

// import { io } from 'socket.io-client';
// const socket = io('http://localhost:3000', {
//   withCredentials: true,
// });

function checkRoomAvailability(roomCode) {
  return axios.post(`http://localhost:3001/api/checkRoom`, {
    roomCode: roomCode,
  });
}

async function handleJoinGame(e, joinGameInputRef, onJoin, setErrorMsg, setLoading) {
  e.preventDefault();

  if (joinGameInputRef.current.value.length < 1) {
    console.error("room code is empty");
    setErrorMsg("Room code must not be left blank");
    return;
  } else if (joinGameInputRef.current.value.length > 12) {
    console.error("room code > 12 chars")
    setErrorMsg("Room code must not be above 12 characters");
    return;
  }

  try {
    setLoading(true);
    const response = await checkRoomAvailability(joinGameInputRef.current.value);

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
}

function JoinGame({ onJoin }) {
  const joinGameInputRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <JoinGameWrapper>
      <BackButton to={`http://localhost:3001/menu`}>Back to Menu</BackButton>
      <JoinGameHeader />
      <JoinGameInstructions />
      <JoinGameForm onSubmit={(e) => handleJoinGame(e, joinGameInputRef, onJoin, setErrorMsg, setLoading)}>
        <JoinGameInput
          type="text"
          id="roomCode"
          ref={joinGameInputRef}
          disabled={loading}
          placeholder="Enter Room Code"
        />
        <JoinGameButton type="submit" disabled={loading}>
          Join Game
        </JoinGameButton>
      </JoinGameForm>
      {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}
    </JoinGameWrapper>
  );
}

const JoinGameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #000;
`;

const JoinGameForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
`;

const JoinGameInput = styled.input`
  appearance: none;
  border-radius: 8px;
  padding: 20px;
  border: 2px solid transparent;
  text-align: center;
  transition: border-color 0.25s;
  max-width: 200px;
  font-size: 20px;

  &:focus {
    outline: 0;
    border-color: #2cce9f;
  }
`;

const JoinGameButton = styled.button`
  background: #2cce9f;
  color: #000;
  font-size: 30px;
  border: 0;
  padding: 10px 20px;
  border-radius: 8px;
  margin-top: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.25s;

  &:hover,
  &:focus,
  &:disabled {
    opacity: 0.8;
    outline: 0;
  }
`;

const BackButton = styled(Link)`
  color: #fff;
  text-decoration: none;
  font-size: 40px;
  position: absolute;
  top: 20px;
  left: 25px;
  cursor: pointer;
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: 10px;
  font-size: 20px;
`;

export default JoinGame;
