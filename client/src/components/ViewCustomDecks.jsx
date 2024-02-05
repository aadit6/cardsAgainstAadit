import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { SERVER_URL } from '../constants';
import { Link } from 'react-router-dom';
import WhiteCard from './WhiteCard';
import BlackCard from './BlackCard';



const ViewCustomDecks = () => {
  const [decks, setDecks] = useState([]);
  const [whiteDeck, setWhiteDeck] = useState([])
  const [blackDeck, setBlackDeck] = useState([])
  const [successMsg, setSuccessMsg] = useState("")
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  

  

  useEffect(() => {
    // Fetch decks from the server
    const fetchDecks = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/getAllDecks`);
        if (response.data.success) {
          setDecks(response.data.decks);
        } else {
          console.error('Error fetching decks:', response.data.message);
        }
      } catch (error) {
        console.error('API request error:', error);
      }
    };

    fetchDecks();
  }, []);

  const copyToClipboard = (text) => {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    setSuccessMsg('Copied to clipboard!');
    // Clear the success message after a short delay
    setTimeout(() => {
      setSuccessMsg('');
    }, 2000);
  };

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleViewCards = async (deckCode) => {
    try {
        const response = await axios.get(`${SERVER_URL}/api/getDeckInfo/${deckCode}`)
        if(response.data.success) {
            setBlackDeck(response.data.blackcards)
            setWhiteDeck(response.data.whitecards)

        } else {
            console.error("error: ", response.data.message )
        }

    } catch (error) {
        console.error("api req error: ", error)

    }
    togglePopup();
    }
  

  
  
  

  return (
    <AllDecksWrapper>

    

      <BackButton to={`./..`}>Back</BackButton>

      <DeckListTitle>All Custom Decks</DeckListTitle>
      {successMsg && <TopSuccessMessage>{successMsg}</TopSuccessMessage>}
      {isPopupOpen && <Popup onClose={togglePopup} whiteCards={whiteDeck} blackCards={blackDeck}/>}
      {decks.map((deck, index) => (
        <DeckCard key={index}>
          <DeckInfo>
            <DeckName>{deck.deckName}</DeckName>
            <DeckDetail>Deck Creator: {deck.deckCreator}</DeckDetail>
            <DeckDetail>Deck Code: {deck.deckCode}</DeckDetail>

          </DeckInfo>
          <DeckButtons>
            <CopyButton onClick={() => copyToClipboard(deck.deckCode)}>Copy Deck Code</CopyButton>
            <ViewButton onClick={() => handleViewCards(deck.deckCode)}>View Cards</ViewButton>
          </DeckButtons>
        </DeckCard>
      ))}
    </AllDecksWrapper>
  );
};

const Popup = ({ onClose, whiteCards, blackCards  }) => {
    // Logic to fetch white and black cards for the selected deckCode
    return (
      <PopupWrapper>
        <PopupContent>
          <Title>White Cards</Title>
          <CardList>
            <CardRow>
                {whiteCards.map((card, index) => (
                    <WhiteCard key={index} text={card.text} disabled={false} hoverEffect={false} selected={false} selectedPlayer={null} enableAudio={false}></WhiteCard>
                ))}
            </CardRow>
          </CardList>
          <Title>Black Cards</Title>
          <CardList>
            <CardRow>
          {blackCards.map((card, index) => (
              <BlackCard key={index} text={card.text} pick={card.pick}></BlackCard>
              ))}
        </CardRow>
      </CardList>
        </PopupContent>
        <CloseButton onClick={onClose}>Close</CloseButton>
      </PopupWrapper>
    );

    
};

const AllDecksWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #222222;
  height: 100vh;
  padding: 20px;
  overflow-x: auto;
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

const TopSuccessMessage = styled.div`
  color: green;
  font-size: 25px;
  margin-bottom: 10px;
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



const DeckListTitle = styled.h2`
  color: white;
  font-size: 36px;
  margin-bottom: 20px;
`;

const DeckCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  padding: 10px;
  margin: 10px 0;
  border-radius: 8px;
  width: 80%;
`;

const DeckInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const DeckName = styled.h3`
  color: white;
  font-size: 24px;
  margin-bottom: 10px;
`;

const DeckDetail = styled.p`
  color: #2cce9f;
  font-size: 18px;
  margin: 0;
`;

const DeckButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const CopyButton = styled.button`
  background: #2cce9f;
  color: #000;
  font-size: 16px;
  border: 0;
  padding: 10px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 5px;
  transition: background 0.25s, opacity 0.25s;

  &:hover,
  &:focus {
    background: #11bf8d;
    opacity: 0.8;
    outline: 0;
  }
`;



const ViewButton = styled.button`
  background: #2cce9f;
  color: #000;
  font-size: 16px;
  border: 0;
  padding: 10px;
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

const PopupWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  width: 1000px;
  height: 600px;
  padding: 50px;
  transform: translate(-50%, -50%);
  background-color: grey;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
`;

const PopupContent = styled.div`
  margin-bottom: 15px;

  h2 {
    color: #333;
    font-size: 20px;
    margin-bottom: 10px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      color: #555;
      font-size: 16px;
      margin-bottom: 5px;
    }
  }
`;

const CloseButton = styled.button`
  background: #e74c3c;
  color: #fff;
  font-size: 20px;
  
  border: 0;
  padding: 10px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.25s, opacity 0.25s;

  &:hover,
  &:focus {
    background: #c0392b;
    opacity: 0.8;
    outline: 0;
  }
`;

const Title = styled.h2`
    color: white;
    font-weight: bold;
    font-size: 20px;
`;


export default ViewCustomDecks;
