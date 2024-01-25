// CreateCustomDeck.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import WhiteCard from './WhiteCard';
import BlackCard from './BlackCard';

const CreateCustomDeck = () => {

  const [blackCards, setBlackCards] = useState([]);
  const [whiteCards, setWhiteCards] = useState([]);
  const [newBlackCard, setNewBlackCard] = useState('');
  const [newWhiteCard, setNewWhiteCard] = useState('');
  const [deckName, setDeckName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  

  const handleAddBlackCard = () => {
    setBlackCards([...blackCards, newBlackCard]);
    setNewBlackCard('');
  };

  const handleAddWhiteCard = () => {
    setWhiteCards([...whiteCards, newWhiteCard]);
    setNewWhiteCard('');
  };

  const handleSave = () => {
    // Implement save functionality here
    // For now, you can console.log to check if it's working
    console.log('Save button clicked');
  };

  return (
    <CreateCustomDeckWrapper>
      <BackButton to={`/../`}>Back</BackButton>



      {deckName && (
        <DeckNameDisplay>
          <DeckName>{deckName}</DeckName>
        </DeckNameDisplay>
      )}

      <TopSection>
      <SaveButton onClick={handleSave}>Save</SaveButton>
      <ToggleWrapper>
        <Title>Private</Title>
        <ToggleLabel>
          <input type="checkbox" checked={isPrivate} onChange={() => setIsPrivate(!isPrivate)} />
          <span className="slider round"></span>
        </ToggleLabel>
      </ToggleWrapper>
      </TopSection>

      

      <TopSection>
        <TopSection>
            <Title>Deck Name</Title>
            <Input
            type="text"
            placeholder="Deck Name"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            />
        </TopSection>
        <TopSection>
            <Title>Add Black</Title>
            <Button onClick={handleAddBlackCard} disabled={!newBlackCard.trim()}>
            Add
            </Button>
            <Input
            type="text"
            placeholder="New Black Card"
            value={newBlackCard}
            onChange={(e) => setNewBlackCard(e.target.value)}
            />
        </TopSection>
            <TopSection>
            <Title>Add White</Title>
            <Button onClick={handleAddWhiteCard} disabled={!newWhiteCard.trim()}>
            Add
            </Button>
            <Input
            type="text"
            placeholder="New White Card"
            value={newWhiteCard}
            onChange={(e) => setNewWhiteCard(e.target.value)}
            />
            </TopSection>
      </TopSection>
      {blackCards[0] && (
        <Title>Black Cards [{blackCards.length}]</Title>
      )}

      <CardList>
        <CardRow>
          {blackCards.map((card, index) => (
            <BlackCard key={index} text={card} pick={1}></BlackCard>
          ))}
        </CardRow>
      </CardList>

      {whiteCards[0] && (
        <Title>White Cards [{whiteCards.length}]</Title>
      )}      <CardList>
        <CardRow>
          {whiteCards.map((card, index) => (
            <WhiteCard key={index} text={card} disabled={false} hoverEffect={false} selected={false} selectedPlayer={null} enableAudio={false}></WhiteCard>
          ))}
        </CardRow>
      </CardList>

      
      

    </CreateCustomDeckWrapper>
  );
};

const CreateCustomDeckWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #222222;
  height: 100vh;
  padding: 20px;
  overflow-x: auto;
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

const DeckNameDisplay = styled.div`
  margin-top: 0px;
`;

const DeckName = styled.h3`
  color: white;
  font-size: 30px;
`;


const TopSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0px;
`;

const Title = styled.h2`
  color: #2cce9f;
  font-size: 24px;
  margin-right: 10px;
`;




const CardList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 1200px; /* Adjust max-width as needed */
  margin: 0 auto;
  margin-bottom: 0px;
`;

const CardRow = styled.div`
  display: flex;
  flex-wrap: wrap; /* Allow cards to wrap to the next row */
  max-height: 225px; /* Adjust the max-height as needed */
  overflow-y: auto; /* Enable vertical scrolling if cards exceed the max-height */
  margin-top: 10px; /* Add some top margin for spacing */
`;

const Input = styled.input`
  width: 100%;
  padding: 15px;
  border-radius: 8px;
  font-size: 16px;
  margin-right: 20px;
`;

const Button = styled.button`
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

  &:disabled {
    background: #888;
    cursor: not-allowed;
    opacity: 1;
  }
`;

const SaveButton = styled.button`
  background: #2cce9f;
  color: #000;
  font-size: 25px;
  border: 0;
  padding: 15px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 0px;
  margin-right: 50px;
  transition: background 0.25s, opacity 0.25s;

  &:hover,
  &:focus {
    background: #11bf8d;
    opacity: 0.8;
    outline: 0;
  }
`;

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0px;
`;

const ToggleLabel = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;

  input {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .slider {
      background-color: #2cce9f;
    }

    &:focus + .slider {
      box-shadow: 0 0 1px #2cce9f;
    }

    &:checked + .slider:before {
      transform: translateX(26px);
    }
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: '';
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }
  }
`;

export default CreateCustomDeck;
