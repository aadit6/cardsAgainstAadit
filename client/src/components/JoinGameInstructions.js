// JoinGameInstructions.jsx
import React from 'react';
import styled from 'styled-components';

const InstructionsWrapper = styled.div`
  text-align: center;
  margin: 20px;
`;

const Instruction = styled.p`
  font-size: 20px;
  color: #fff;
  text-align: centre;
  margin: 10px;
`;

const JoinGameInstructions = () => {
  return (
    <InstructionsWrapper>
      <Instruction>
        1. Enter the room code provided by the game host. Or create a new one to start a new game.
      </Instruction>
      <Instruction>
        2. Click the "Join Game" button
      </Instruction>
      <Instruction>
        3. Get ready for some HILARIOUS fun!
      </Instruction>
    </InstructionsWrapper>
  );
};

export default JoinGameInstructions;
