// StartButton.jsx
import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
  background-color: #2cce9f;
  color: #fff;
  font-size: 18px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-left: 350%;
  width:100%;


  &:hover {
    background-color: #218c74;
  }

  &:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
`;

const StartButton = ({ onClick, disabled }) => {
  return (
    <Button onClick={onClick} disabled={disabled}>
      Start Game
    </Button>
  );
};

export default StartButton;
