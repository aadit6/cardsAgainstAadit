import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import CreateGame from './CreateGame';

const NSFW_SFW_OPTIONS = [
  { value: 'nsfw', label: 'NSFW Deck' },
  { value: 'sfw', label: 'SFW Deck' },
];

const InputField = ({ label, value, onChange, id, type = 'number', min = 1, isCheckbox = false, options }) => (
  <OptionsForm>
    <label htmlFor={id}>{label}:</label>
    {options ? (
      <Select id={id} value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    ) : (
      <input type={type} id={id} value={value} onChange={onChange} min={min} />
    )}
  </OptionsForm>
);

const CreateGameOptions = () => {
  const [pointsToWin, setPointsToWin] = useState(5);
  const [cardsInHand, setCardsInHand] = useState(8);
  const [deckType, setDeckType] = useState('sfw'); // Default to NSFW deck

  const handleChange = (event, setStateFunction) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setStateFunction(value);
  };

  const handleDeckTypeChange = (type) => {
    setDeckType(type);
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
      <DeckTypeButtonsContainer>
      <DeckTypeButton
        selected={deckType === 'nsfw'}
        onClick={() => handleDeckTypeChange('nsfw')}
      >
        NSFW Deck
      </DeckTypeButton>
      <DeckTypeButton
        selected={deckType === 'sfw'}
        onClick={() => handleDeckTypeChange('sfw')}
        style={{ marginLeft: '10px' }}
      >
        SFW Deck
      </DeckTypeButton>
      </DeckTypeButtonsContainer>
      {/* Add more InputField components for additional options */}
      <CreateGame pointsToWin={pointsToWin} cardsInHand={cardsInHand} deckType={deckType} />
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
    font-size: 30px;
    margin-right: 15px;
  }
  input {
    font-size: 26px;
    padding: 5px;
    border-radius: 12px;
  }
`;

const Select = styled.select`
  font-size: 26px;
  padding: 5px;
  border-radius: 12px;
`;

const DeckTypeButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 25%;
  margin-bottom: 15px;
`;

const DeckTypeButton = styled.button`
  font-size: 26px;
  padding: 10px;
  border: none;
  border-radius: 12px;
  margin: 5px;
  cursor: pointer;
  background-color: ${(props) => (props.selected ? '#2196f3' : '#ccc')};
  color: ${(props) => (props.selected ? '#fff' : '#000')};

  &:hover {
    background-color: ${(props) => (props.selected ? '#1e87d4' : '#aaa')};
  }
`;

export default CreateGameOptions;
