import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import {SERVER_URL} from './../constants.js';


const maxAttempts = 20;


async function createRandomRoom(navigate, setErrorMsg, setLoading, attempts = 0) { //recursive method
    const generateRandomString = (length) => {
        let randomString = '';
      
        for (let i = 0; i < length; i++) {
          const randomCharCode = Math.floor(Math.random() * 62);
          if (i % 3 === 0) {
            // Uppercase letters (A-Z)
            randomString += String.fromCharCode(randomCharCode % 26 + 65);
          } else if (i % 3 === 1) {
            // Lowercase letters (a-z)
            randomString += String.fromCharCode(randomCharCode % 26 + 97);
          } else {
            // Numbers (0-9)
            randomString += String.fromCharCode(randomCharCode % 10 + 48);
          }
        }
      
        return randomString;
    };
      
      
      
      
      
      
    const random = generateRandomString(10);
    console.log("random room name: ", random);
    
    try {
        setLoading(true);
        const response = await axios.post(`${SERVER_URL}/api/checkRoom`, {
            roomCode: random,
        });
        console.log("response data: ",response.data);

        if (!response.data.success) { // used "!" as we want room to not already exist
            navigate(`/game/${random}`);
            return; // breaks out of recursion
        } else if (attempts < maxAttempts) {
            return createRandomRoom(navigate, setErrorMsg, setLoading, attempts + 1); // fixed typo

        } else {
            setErrorMsg("Failed to create a room after multiple attempts"); // to prevent infinite loop
        }

    } catch (err) {
        setErrorMsg("There was an error on the server. Please try again.");
        console.error(err);
    } finally {
        setLoading(false);
    }
}




const CreateGame = () => {
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
  
    const handleCreateGame = async () => {
      try {
        await createRandomRoom(navigate, setErrorMsg, setLoading);
      } catch (error) {
        console.error('Error creating game:', error);
      }
    };
  
    return (
      <>
        <StyledCreateGameButton onClick={() => handleCreateGame()} disabled={loading}>
          Create Game
        </StyledCreateGameButton>
        {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}
      </>
    );
  };

const StyledCreateGameButton = styled.button`
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

const ErrorMessage = styled.p`
  color: red;
  margin-top: 10px;
  font-size: 20px;
`;

export default CreateGame;
