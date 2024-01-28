import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import CreateGame from './CreateGame';

const DECK_OPTIONS = [
  { value: '0', label: 'CAH Base Set' }, 
  { value: '1', label: 'CAH: Blue Box Expansion' },
  { value: '2', label: 'CAH: Box Expansion' },
  { value: '3', label: 'Absurd Box Expansion' },
  { value: '4', label: 'CAH: College Pack' },
  { value: '5', label: 'CAH: Green Box Expansion' },
  { value: '6', label: 'CAH: Red Box Expansion' },
  { value: '7', label: 'CAH: UK Conversion Kit' },
  { value: '8', label: 'World Wide Web Pack' },
  { value: '9', label: 'Weed Pack' },
  { value: '10', label: 'Theatre Pack' },
  { value: '11', label: 'TableTop Pack' },
  { value: '12', label: 'Seasons Greetings Pack' },
  { value: '13', label: 'Science Pack' },
  { value: '14', label: 'Sci-Fi Pack' },
  { value: '15', label: 'Retail Product Pack' },
  { value: '16', label: 'Retail Mini Pack' },
  { value: '17', label: 'Reject Pack' },
  { value: '18', label: 'Pride Pack' },
  { value: '19', label: 'Period Pack' },
  { value: '20', label: 'Mass Effect Pack' },
  { value: '21', label: 'Jew Pack/Chosen People Pack' },
  { value: '22', label: 'Jack White Snow Pack' },
  { value: '23', label: 'House of Cards Pack' },
  { value: '24', label: 'Gen Con 2018 Midterm Election Pack' },
  { value: '25', label: 'Geek Pack' },
  { value: '26', label: 'Facism Pack' },
  { value: '27', label: 'Food Pack' },
  { value: '28', label: 'Fantasy Pack' },
  { value: '29', label: 'Desert Bus For Hope Pack' },
  { value: '30', label: 'Dad Pack' },
  { value: '31', label: 'CAH: Second Expansion' },
  { value: '32', label: 'CAH: Sixth Expansion' },
  { value: '33', label: 'CAH: Third Expansion' },
  { value: '34', label: 'CAH: Human Pack' },
  { value: '35', label: 'CAH: Main Deck' },
  { value: '36', label: 'CAH: Fourth Expansion' },
  { value: '37', label: 'CAH: First Expansion' },
  { value: '38', label: 'CAH: Fifth Expansion' },
  { value: '39', label: 'CAH: Family Edition (Free Print & Play Public Beta)' },
  { value: '40', label: '2012 Holiday Pack' },
  { value: '41', label: 'CAH: A.I Pack' },
  { value: '42', label: 'CAH: Ass Pack' },



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
      
      <CreateGame pointsToWin={pointsToWin} cardsInHand={cardsInHand} selectedDecks={selectedDecks} />
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
  margin-bottom: 30px;
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
  margin-bottom: 30px;
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

export default CreateGameOptions;