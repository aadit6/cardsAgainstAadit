import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import JoinGameHeader from './JoinGameHeader';
import JoinGameInstructions from './JoinGameInstructions';
import {SERVER_URL} from '../constants.js';


const MAX_ROOM_CHARS = 15;
const MIN_ROOM_CHARS = 4;

async function checkRoomAvailability(roomCode) {
  try {
    const response = await axios.post(`${SERVER_URL}/api/checkRoom`, {
      roomCode: roomCode,
    });
    return response.data;
  } catch (error) {
    console.error('Error checking room availability:', error);
    throw error;
  }
}

async function handleJoinGame(joinGameInputValue, setErrorMsg, setLoading, navigate) {
  try {
    setLoading(true);
    const response = await checkRoomAvailability(joinGameInputValue);

    if (response.success) {
      navigate(`/game/${joinGameInputValue}`);
    } else {
      setErrorMsg(response.message || 'Error joining the game.');
      // need to fix this since we don't want "room does not exist to return error => instead want to create room"
    }
  } catch (error) {
    console.error('Error joining game:', error);
    // setErrorMsg('Server Error. Please try again');
  } finally {
    setLoading(false);
  }
}

async function handleNavigateCreateGame(navigate, setLoading) {
  setLoading(true);
  navigate("/creategame")
  setLoading(false)
}

async function handleNavigateCreateDeck(navigate, setLoading) {
  setLoading(true);
  navigate("/createDeck")
  setLoading(false)
}

const JoinGame = () => {
  const joinGameInputRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const joinGameInputValue = joinGameInputRef.current.value.trim();

    await handleJoinGame(joinGameInputValue, setErrorMsg, setLoading, navigate);
  }

  return (
    <JoinGameWrapper>
      <BackButton to={`${SERVER_URL}/menu`}>Back</BackButton>
      <JoinGameHeader />
      <JoinGameInstructions />
      <JoinGameForm onSubmit={handleSubmit}>
        <RowContainer>
          <InputContainer>
            <JoinGameInput
              type="text"
              id="roomCode"
              ref={joinGameInputRef}
              disabled={loading}
              placeholder="Room Code"
              required
              minLength={MIN_ROOM_CHARS}
              maxLength={MAX_ROOM_CHARS}
            />
          </InputContainer>
          <ButtonContainer>
            <JoinGameButton type="submit" disabled={loading}>
              Join Game
            </JoinGameButton>
          </ButtonContainer>
        </RowContainer>
        </JoinGameForm>
      {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}
        <OrText>OR</OrText>
        <StyledCreationButton onClick={() => handleNavigateCreateGame(navigate, setLoading)}> Create Game
        </StyledCreationButton>

        <OrText>OR</OrText>
      

        <StyledCreationButton onClick={() => handleNavigateCreateDeck(navigate, setLoading)}> Create Custom Deck
        </StyledCreationButton>

      
    </JoinGameWrapper>
  );
};

const JoinGameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #222222;
`;

const JoinGameForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px; /* Adjust the max-width based on your preference */
`;

const RowContainer = styled.div`
  display: flex;
  width: 100%;
  margin-top: 10px;
`;

const InputContainer = styled.div`
  flex: 1;
  margin-right: 5px; /* Adjust margin for spacing */
`;

const JoinGameInput = styled.input`
  width: 80%;
  padding: 20px;
  border-radius: 8px;
  font-size: 20px;
  border: 2px solid transparent;
  text-align: center;
  transition: border-color 0.25s;

  &:focus {
    outline: 0;
    border-color: #2cce9f;
  }
`;

const ButtonContainer = styled.div`
  flex: 1;
`;

const JoinGameButton = styled.button`
  width: 100%;
  background: #2cce9f;
  color: #000;
  font-size: 24px;
  border: 0;
  padding: 18px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.25s;
  margin-left: 10px;

  &:hover,
  &:focus,
  &:disabled {
    opacity: 0.8;
    outline: 0;
  }
`;

const OrText = styled.p`
  color: #fff;
  font-size: 20px;
  margin-top: 10px;
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

const StyledCreationButton = styled.button`
  width: 70%;
  background: #2cce9f;
  color: #000;
  font-size: 24px;
  border: 0;
  padding: 10px 20px;
  border-radius: 8px;
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


export default JoinGame;