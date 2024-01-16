import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import CreateGame from './CreateGame';


const InputField = ({ label, value, onChange, id, type = 'number', min = 1, isCheckbox = false }) => (
  <OptionsForm>
    <label htmlFor={id}>{label}:</label>
    <input type={type} id={id} value={value} onChange={onChange} min={min} />
    
  </OptionsForm>
);

const CreateGameOptions = () => {
  const [pointsToWin, setPointsToWin] = useState(5);
  const [cardsInHand, setCardsInHand] = useState(8);

  const handleChange = (event, setStateFunction) => {
    if (event.target.type === 'checkbox') {
      setStateFunction(event.target.checked);
    } else {
      const value = parseInt(event.target.value, 10);
      setStateFunction(value);
    }

  };

  return (
    <CreateGameWrapper>
      <BackButton to={`/../`}>Back to Join Game</BackButton>
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
      
      {/* Add more InputField components for additional options */}
      <CreateGame pointsToWin={pointsToWin} cardsInHand={cardsInHand} />
    </CreateGameWrapper>
  );
};

const CreateGameWrapper = styled.div`
  background-color: #000;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const BackButton = styled(Link)`
  color: #fff;
  text-decoration: none;
  font-size: 36px;
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


export default CreateGameOptions;
