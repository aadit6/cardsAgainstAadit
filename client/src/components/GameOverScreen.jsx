// GameOverScreen.jsx
import React from 'react';
import styled from 'styled-components';

const GameOverScreen = ({ winningPlayer, currentUser, onNewGame, onBack }) => {
  const isCurrentUserWinner = winningPlayer === currentUser;

  return (
    <Overlay>
      <Container>
        <Title>{isCurrentUserWinner ? 'Congratulations! You are the winner!' : `Game Over! ${winningPlayer} is the winner!`}</Title>
        <ButtonContainer>
          <Button onClick={onNewGame}>New Game</Button>
          <Button onClick={onBack}>Back</Button>
        </ButtonContainer>
      </Container>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const Container = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-around;
`;

const Button = styled.button`
  background-color: #4caf50;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

export default GameOverScreen;
