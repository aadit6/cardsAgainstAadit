import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import CreateGame from './CreateGame';
import axios from 'axios';
import { SERVER_URL } from '../constants';

const DECK_OPTIONS = [
  { value: 'VCeG6IsOjS', label: 'CAH Base Set' }, 
  { value: 'eQoV3btSE5', label: 'CAH: Blue Box Expansion' },
  { value: 'EXtho0imeT', label: 'CAH: Box Expansion' },
  { value: 'olXfa6xzVB', label: 'Absurd Box Expansion' },
  { value: 'RalY79lOL0', label: 'CAH: College Pack' },
  { value: 'A5AMP9zb05', label: 'CAH: Green Box Expansion' },
  { value: '8XZFVTguaV', label: 'CAH: Red Box Expansion' },
  { value: 'bYDuf5dqPG', label: 'CAH: UK Conversion Kit' },
  { value: 'jZHzMsZPPq', label: 'World Wide Web Pack' },
  { value: 'NyPAEKD4vp', label: 'Weed Pack' },
  { value: 'CaK5vG6GaP', label: 'Theatre Pack' },
  { value: 'mDRW0sIheB', label: 'TableTop Pack' },
  { value: 'hkamgfT1rw', label: 'Seasons Greetings Pack' },
  { value: 'W6Du7teX56', label: 'Science Pack' },
  { value: 'VoGFcxokTB', label: 'Sci-Fi Pack' },
  { value: 'Cl6S402AEM', label: 'Retail Product Pack' },
  { value: '6pBjCKUsbd', label: 'Retail Mini Pack' },
  { value: 'lK7inTJBUq', label: 'Reject Pack' },
  { value: '9HQtFIMdBB', label: 'Pride Pack' },
  { value: 'DkgR4LyrYO', label: 'Period Pack' },
  { value: 'l6Uz4APESi', label: 'Mass Effect Pack' },
  { value: 'XGn9tCpJS1', label: 'Jew Pack/Chosen People Pack' },
  { value: 'VnIo5oXgrJ', label: 'Jack White Snow Pack' },
  { value: 'u3DMXAYs8C', label: 'House of Cards Pack' },
  { value: 'OEoEpZTdhm', label: 'Gen Con 2018 Midterm Election Pack' },
  { value: 'bcpfG6MmTG', label: 'Geek Pack' },
  { value: 'VLhvZt1lUx', label: 'Facism Pack' },
  { value: 'Y0bFBUV2h6', label: 'Food Pack' },
  { value: 'P0dS8lQ99p', label: 'Fantasy Pack' },
  { value: 'RXvMENbXQy', label: 'Desert Bus For Hope Pack' },
  { value: '8gDe3rRtXV', label: 'Dad Pack' },
  { value: 'ySDNmDafKJ', label: 'CAH: Second Expansion' },
  { value: 'HyNUVEPOCL', label: 'CAH: Sixth Expansion' },
  { value: 'o710IyH4du', label: 'CAH: Third Expansion' },
  { value: 'XYWM6mrjX6', label: 'CAH: Human Pack' },
  { value: 'Tb5ifXZXd0', label: 'CAH: Main Deck' },
  { value: 'TOz4TXfBNJ', label: 'CAH: Fourth Expansion' },
  { value: '7Xbn4N4Twx', label: 'CAH: First Expansion' },
  { value: 'M9hsw4zvU2', label: 'CAH: Fifth Expansion' },
  { value: 'uhrEhUGAtL', label: 'CAH: Family Edition (Free Print & Play Public Beta)' },
  { value: '8EVzCFxiOS', label: '2012 Holiday Pack' },
  { value: 'JIOVGbGeav', label: 'CAH: A.I Pack' },
  { value: 'PWShVTh3n7', label: 'CAH: Ass Pack' },



  // Add more decks as needed
];

const InputField = ({ label, value, onChange, id, type = 'number', min = 1, isCheckbox = false, options }) => (
  <ParentComponent>
    {isCheckbox ? (
      <OptionsFormCheck>
        <label htmlFor={id} className={id === 'decks' ? 'decks-label' : ''}>
          {label}:
        </label>
        <CheckboxContainer>
          {options.map((option) => (
            <CheckboxLabel key={option.value} className="deck-label">
              {/* Add the 'deck-label' class to individual deck labels */}
              <input
                type="checkbox"
                id={option.value}
                checked={value.includes(option.value)}
                onChange={(event) => onChange(event, option.value, !value.includes(option.value))}
              />
              {option.label}
            </CheckboxLabel>
          ))}
        </CheckboxContainer>
      </OptionsFormCheck>
    ) : (
      <OptionsForm>
        <label htmlFor={id}>{label}:</label>
        <input type={type} id={id} value={value} onChange={(event) => onChange(event)} min={min} />
      </OptionsForm>
    )}
  </ParentComponent>
);




const CreateGameOptions = () => {
  const [pointsToWin, setPointsToWin] = useState(5);
  const [cardsInHand, setCardsInHand] = useState(8);
  const [selectedDecks, setSelectedDecks] = useState([]);
  const [customDeckCode, setCustomDeckCode] = useState('');
  const [customDeckData, setCustomDeckData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');


  const handleCustomDeckCodeChange = (event) => {
    setCustomDeckCode(event.target.value);
  };

  const handleAddCustomDeck = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/getDeckInfo/${customDeckCode}`);
      const { success, deck } = response.data;

      if (success) {
        // Set the custom deck data in state
        setErrorMsg("");
        setCustomDeckData(deck);
      } else {
        // Handle error case
        setErrorMsg("");
        setErrorMsg('Deck not found');
      }
    } catch (error) {
      // Handle error
      console.error('Error fetching custom deck', error);
      setErrorMsg('Server Error. Please try again.')
    }
  };





  const handleChange = (event, setStateFunction) => {
    const { type, checked, value, id } = event.target;
  
    if (type === 'checkbox') {
      setStateFunction((prevValue) => {
        if (checked) {
          // Add the id to the array if it's checked
          return [...prevValue, id];
        } else {
          // Remove the id from the array if it's unchecked
          return prevValue.filter((item) => item !== id);
        }
      });
    } else if (type === 'number') {
      // Handle numeric input fields
      setStateFunction(parseInt(value, 10) || 0);
    } else {
      setStateFunction(value);
    }

  };
  
  

  
  

  return (
    <CreateGameWrapper>
      <BackButton to={`/../`}>Back</BackButton>
      <InputField
        label="Points to Win"
        value={pointsToWin}
        onChange={(event) => handleChange(event, setPointsToWin)}
        id="pointsToWin"
        min={1}
      />
      <InputField
        label="Cards in Hand"
        value={cardsInHand}
        onChange={(event) => handleChange(event, setCardsInHand)}
        id="cardsInHand"
        min={4}
      />
      <InputField
        label="Decks"
        value={selectedDecks}
        onChange={(event) => handleChange(event, setSelectedDecks)}
        id="decks"
        isCheckbox={true}
        options={DECK_OPTIONS}
      />
      {/* Add more InputField components for additional options */}
      <ParentComponent>
        <OptionsForm>
          <label htmlFor="customDeckCode">Custom Deck Code:</label>
          <input type="text" id="customDeckCode" value={customDeckCode} onChange={handleCustomDeckCodeChange} />
          <Button onClick={handleAddCustomDeck}>Add</Button>
        </OptionsForm>
      </ParentComponent>

      {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}
      {customDeckData && (
        <CustomDeckInfoWrapper>
          <CustomDeckInfoLabel>Deck Name: {customDeckData[0]}</CustomDeckInfoLabel>
          <CustomDeckInfoLabel>Deck Creator: {customDeckData[1]}</CustomDeckInfoLabel>

          {/* Add more information as needed */}
        </CustomDeckInfoWrapper>
      )}
      
      
      <CreateGame pointsToWin={pointsToWin} cardsInHand={cardsInHand} selectedDecks={selectedDecks} customDeck={customDeckCode}/>
    </CreateGameWrapper>
  );
};

const CreateGameWrapper = styled.div`
  background-color: #222222;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
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

const OptionsForm = styled.div`
  margin-bottom: 15px;
  label {
    color: #fff;
    font-size: 25px;
    margin-right: 15px;
  }
  input {
    font-size: 21px;
    padding: 5px;
    border-radius: 12px;
  }
`;

const ParentComponent = styled.div`
  margin-bottom: 0px;
`;

const OptionsFormCheck = styled.div`
  margin-bottom: 30px;
  label {
    color: #fff;
    font-size: 25px;
    margin-right: 20px;
    margin-left: 20px;
    margin-bottom: 1px; /* Add margin-bottom to increase spacing */
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  color: #fff;

  &.deck-label {
    font-size: 21px;
    margin-top: 5px; /* Add margin-top to increase spacing */
  }

  input {
    margin-right: 4px;
  }
`;

const Button = styled.button`
  background-color: #4caf50; /* Green background */
  color: white; /* White text color */
  border: none; /* Remove border */
  padding: 10px 20px; /* Some padding */
  font-size: 16px; /* Set font size */
  cursor: pointer; /* Add a pointer cursor on hover */
  margin-left: 10px; /* Add some space on the left */
`;

const CustomDeckInfoWrapper = styled.div`
  background-color: #333;
  padding: 20px;
  border-radius: 10px;
  width: 20%;
  margin-bottom: 20px;
  color: #fff;
`;

const CustomDeckInfoLabel = styled.p`
  font-size: 20px;
  text-align: center;
  margin: 0px 0;
  margin-top: 0px;
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: 0px;
  font-size: 20px;
`;

export default CreateGameOptions;