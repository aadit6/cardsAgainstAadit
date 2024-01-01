// StartButton.jsx
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const Button = styled.button`
  background-color: #1c6933;
  color: #fff;
  font-size: 18px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  margin-left: 400px;
  width: 50%;
  position: relative; /* Ensure relative positioning for the tooltip */
  transition: background-color 0.3s;

  &:hover {
    background-color: ${props => (props.disabled ? '#bdc3c7' : '#105725')};
  }

  &:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  background-color: black;
  color: #fff;
  border-radius: 8px;
  font-size: 14px;
  white-space: nowrap;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  padding: 10px;
  z-index: 1;

  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s, visibility 0.3s;

  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 8px;
    border-style: solid;
    border-color: black transparent transparent transparent;
  }

  ${Button}:hover > & {
    opacity: 1;
    visibility: visible;
  }
`;

const StartButton = ({ onClick, disabled, numPlayers }) => {
  return (
    <Container>
      <Button onClick={onClick} disabled={disabled}>
        Start Game
        {disabled && (
          <Tooltip>
            {3 - numPlayers} more player(s) required before the game can start
          </Tooltip>
        )}
      </Button>
    </Container>
  );
};

export default StartButton;
