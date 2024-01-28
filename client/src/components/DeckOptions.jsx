// DeckOptions.jsx

import React from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';

async function handleNavigateCreateGame(navigate) {
  navigate("/deckOptions/createDeck");
}

async function handleNavigatePublicDecks(navigate) {
  // Implement later
  navigate("/deckOptions/publicDecks");
}

async function handleNavigateUserDecks(navigate) {
  // Implement later
  navigate("/deckOptions/userDecks");
}

const DeckOptions = () => {
  const navigate = useNavigate();

  return (
    <DeckOptionsWrapper>
      <BackButton to={`./..`}>Back</BackButton>
      <OptionCardTop>
        <OptionTitle>Create Deck</OptionTitle>
        <OptionDescription>Create your custom deck with black and white cards.</OptionDescription>
        <OptionButton onClick={() => handleNavigateCreateGame(navigate)}>Create</OptionButton>
      </OptionCardTop>

      <OptionCard>
        <OptionTitle>View Public Decks</OptionTitle>
        <OptionDescription>Explore decks created by the community.</OptionDescription>
        <OptionButton onClick={() => handleNavigatePublicDecks(navigate)}>View Public Decks</OptionButton>
      </OptionCard>

      <OptionCard>
        <OptionTitle>View Your Decks</OptionTitle>
        <OptionDescription>Manage and view decks you've created.</OptionDescription>
        <OptionButton onClick={() => handleNavigateUserDecks(navigate)}>View Your Decks</OptionButton>
      </OptionCard>
    </DeckOptionsWrapper>
  );
};

const DeckOptionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #222222; /* Background color for the entire page */
  height: 100vh;
  padding: 20px;
`;

const OptionCard = styled.div`
  background-color: #2a2a2a; /* Slightly lighter background color for the cards */
  width: 900px; /* Adjust the width as needed */
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px; /* Add some bottom margin for spacing */
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const OptionCardTop = styled(OptionCard)`
  margin-top: 40px; /* Adjust the top margin for the top card */
`;

const OptionTitle = styled.h3`
  font-size: 28px;
  margin-bottom: 10px;
  color: #2cce9f;
`;

const OptionDescription = styled.p`
  font-size: 20px;
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

const BackButton = styled(Link)`
  color: #fff;
  text-decoration: none;
  font-size: 40px;
  position: absolute;
  top: 20px;
  left: 25px;
  cursor: pointer;
`;

export default DeckOptions;
