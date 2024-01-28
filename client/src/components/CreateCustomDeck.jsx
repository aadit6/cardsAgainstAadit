// CreateCustomDeck.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import WhiteCard from './WhiteCard';
import BlackCard from './BlackCard';
import axios from 'axios';
import { SERVER_URL } from '../constants';

const CreateCustomDeck = () => {

  const [blackCards, setBlackCards] = useState([]);
  const [whiteCards, setWhiteCards] = useState([]);
  const [newBlackCard, setNewBlackCard] = useState('');
  const [newWhiteCard, setNewWhiteCard] = useState('');
  const [deckName, setDeckName] = useState('');
  const [deckCode, setDeckCode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [blackPick, setBlackPick] = useState(1)

  

  const handleAddBlackCard = () => {
    setBlackCards([...blackCards, { text: newBlackCard, pick: blackPick }]);
    setNewBlackCard('');
  };


  const handleAddWhiteCard = () => {
    setWhiteCards([...whiteCards, newWhiteCard]);
    setNewWhiteCard('');
  };

  async function handleSave(){
    // Implement save functionality here
    // For now, you can console.log to check if it's working
    console.log('Save button clicked');

    try {
        const response = await axios.post(`${SERVER_URL}/api/createCustomDeck`, { //stores these values server side
            deckName: deckName,
            blackCards: blackCards,
            whiteCards: whiteCards,
            code: deckCode,
        }, {
            withCredentials: true,
        })
        if(response.data.success) {
            setErrorMsg('')
            setDeckCode(response.data.deckCode) 
            console.log("value of deckCode is: ", deckCode)
        } else {
            setErrorMsg(response.data.message)
        }
        

    } catch(err) {
        setErrorMsg("API Request Error")
        console.error("API request error: ", err)

    }
  };

  return (
    <CreateCustomDeckWrapper>
    <HeaderContainer>
    <BackButton to={`./..`}>Back</BackButton>
    {deckName && (
        <DeckNameDisplay>
            <DeckName>{deckName}</DeckName>
        </DeckNameDisplay>
    )}
    
        
  </HeaderContainer>


      

      <TopSection>
      <SaveButton onClick={handleSave}>Save</SaveButton>
      {deckCode && (
          <TopSection>
            <Title>Code</Title>
            <DeckCode>{deckCode}</DeckCode>
          </TopSection>
        )}
      </TopSection>
      {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}

      

      <TopSection>
        <TopSection>
          <Title>Name</Title>
          <Input
            type="text"
            placeholder="Deck Name"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
          />
        </TopSection>
        <TopSection>
          <Title>White</Title>
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
        <TopSection>
          <Title>Black</Title>
          <Button onClick={handleAddBlackCard} disabled={!newBlackCard.trim()}>
            Add
          </Button>
          <Input
            type="text"
            placeholder="New Black Card"
            value={newBlackCard}
            onChange={(e) => setNewBlackCard(e.target.value)}
          />
            <Title>Pick</Title> {/* New title for pick */}

          <PickInput>
            <Input
              type="number"
              value={blackPick}
              onChange={(e) => setBlackPick(parseInt(e.target.value) || 1)}
              min={1}
            />
          </PickInput>
        </TopSection>
        
      </TopSection>
      

      {whiteCards[0] && (
        <Title>White Cards [{whiteCards.length}]</Title>
      )}      <CardList>
        <CardRow>
          {whiteCards.map((card, index) => (
            <WhiteCard key={index} text={card} disabled={false} hoverEffect={false} selected={false} selectedPlayer={null} enableAudio={false}></WhiteCard>
          ))}
        </CardRow>
      </CardList>

      {blackCards[0] && (
        <Title>Black Cards [{blackCards.length}]</Title>
      )}

      <CardList>
        <CardRow>
          {blackCards.map((card, index) => (
              <BlackCard key={index} text={card.text} pick={card.pick}></BlackCard>
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
  position: relative;

  margin-top: 0px;
  cursor: pointer;
`;

const DeckNameDisplay = styled.div`
    margin: 0px;
    margin-right: 700px;


`;

const DeckName = styled.h3`
  color: white;
  font-size: 30px;
  margin: 0;
`;





const TopSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0px;
`;


const Title = styled.h2`
    color: #2cce9f;
    font-size: 24px;
    margin-right: 15px;
    margin-left: 10px;
    margin-top: 20px;
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



const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px; /* You can adjust the margin as needed */
`;

const DeckCode = styled.h3`
  color: white;
  font-size: 30px;
  margin: 0;
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: 0px;
  font-size: 20px;
`;

const PickInput = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 20px;
  width: 5%;
`;



export default CreateCustomDeck;
