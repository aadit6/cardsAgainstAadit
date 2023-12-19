import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { SERVER_URL } from '../constants';


const maxAttempts = 20;



async function createRandomRoom(navigate, setErrorMsg, setLoading, attempts = 0) {
    const generateRandomString = (length) => {
        let randomString = '';
      
        for (let i = 0; i < length; i++) {
          const randomCharCode = Math.floor(Math.random() * (126 - 33 + 1) + 33); // ASCII values between 33 and 126
          randomString += String.fromCharCode(randomCharCode);
        }
      
        return randomString;
    };
      
      
    const random = generateRandomString(10);
    console.log("random room name: ", random);
    
    try {
        setLoading(true);
        const response = await axios.post(`${SERVER_URL}/api/checkRoom`);

        if (response.data.success) {
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




const CreateGame = ({ onClick, disabled }) => {
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    return (
        <StyledCreateGameButton onClick={onClick} disabled={disabled}>
        Create Game
        </StyledCreateGameButton>
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

export default CreateGame;
