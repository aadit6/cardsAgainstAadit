import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import CreateGame from './CreateGame'; // Import the CreateGame component

const CreateGameOptions = () => {
  const [pointsToWin, setPointsToWin] = useState(5); // Default value, adjust as needed

  const handlePointsChange = (event) => {
    const value = parseInt(event.target.value, 10);
    setPointsToWin(isNaN(value) ? 0 : value); // Ensure a valid integer is set
  };

  return (
    <CreateGameWrapper>
      <BackButton to={`/../`}>Back to Join Game</BackButton>
      <PointsForm>
        <label htmlFor="pointsToWin">Points to Win:</label>
        <input
          type="number"
          id="pointsToWin"
          value={pointsToWin}
          onChange={handlePointsChange}
          min={1} // Adjust the minimum value as needed
        />
      </PointsForm>
      <CreateGame pointsToWin={pointsToWin} />
      {/* Add additional options UI and logic if needed */}
    </CreateGameWrapper>
  );
};

const CreateGameWrapper = styled.div`
  background-color: #000; // Set the black background color
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

const PointsForm = styled.div`
  margin-bottom: 20px;
  label {
    color: #fff;
    font-size: 24px;
    margin-right: 10px;
  }
  input {
    font-size: 20px;
    padding: 10px;
    border-radius: 8px;
  }
`;

export default CreateGameOptions;
