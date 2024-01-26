// DeckOptions.jsx

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

async function handleNavigateCreateGame(navigate) {
    navigate("/createDeck")
}

async function handleNavigatePublicDecks(navigate) { //implement LATER
    navigate("/publicDecks")
}

async function handleNavigateUserDecks(navigate) { //implement LATER
    navigate("/userDecks")
}

const DeckOptions = () => {
    const navigate = useNavigate();

  return (
    <DeckOptionsWrapper>
      <OptionCard>
        <OptionTitle>Create Deck</OptionTitle>
        <OptionDescription>Create your custom deck with black and white cards.</OptionDescription>
        <OptionButton onClick={() => handleNavigateCreateGame(navigate)}>Create</OptionButton>
      </OptionCard>

      <OptionCard>
        <OptionTitle>View Public Decks</OptionTitle>
        <OptionDescription>Explore decks created by the community.</OptionDescription>
        <OptionButton>View Public Decks</OptionButton>
      </OptionCard>

      <OptionCard>
        <OptionTitle>View Your Decks</OptionTitle>
        <OptionDescription>Manage and view decks you've created.</OptionDescription>
        <OptionButton>View Your Decks</OptionButton>
      </OptionCard>
    </DeckOptionsWrapper>
  );
};

const DeckOptionsWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
`;

const OptionCard = styled.div`
  background-color: #1a1a1a;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const OptionTitle = styled.h3`
  font-size: 24px;
  margin-bottom: 10px;
  color: #2cce9f;
`;

const OptionDescription = styled.p`
  font-size: 16px;
  margin-bottom: 20px;
`;

const OptionButton = styled.button`
  background: #2cce9f;
  color: #000;
  font-size: 18px;
  border: 0;
  padding: 15px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.25s, opacity 0.25s;

  &:hover,
  &:focus {
    background: #11bf8d;
    opacity: 0.8;
    outline: 0;
  }
`;

export default DeckOptions;
