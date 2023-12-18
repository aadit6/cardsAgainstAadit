// JoinGameHeader.jsx
import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 0px; /* Added margin for spacing */
`;

const GameTitle = styled.h1`
  font-size: 80px; /* Increased font size */
  color: #fff;
  margin-bottom: 10px;
  color: aqua;
`;

const GameSubtitle = styled.p`
  font-size: 30px; /* Increased font size */
  color: #ccc;
  text-align: left;
  color: aqua;
`;

const JoinGameHeader = () => {
  return (
    <HeaderContainer>
      <GameTitle>Cards against Aadit</GameTitle>
      <GameSubtitle>Join the game!</GameSubtitle>
    </HeaderContainer>
  );
};

export default JoinGameHeader;
