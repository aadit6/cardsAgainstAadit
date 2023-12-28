import React from 'react';
import styled from 'styled-components';

const Leaderboard = ({ leaderboard, currentUser }) => {
  return (
    <LeaderboardContainer>
      <LeaderboardHeader>Players</LeaderboardHeader>
      <LeaderboardList>
        {leaderboard.map((player) => (
          <LeaderboardItem key={player.name}>
            <PlayerName>
              {player.name} {player.name === currentUser && "(YOU)"}
            </PlayerName>
            <PlayerScore>{player.score}</PlayerScore>
          </LeaderboardItem>
        ))}
      </LeaderboardList>
    </LeaderboardContainer>
  );
};

const LeaderboardContainer = styled.div`
  background-color: #3498db;
  border-radius: 12px;
  padding: 15px;
  margin: 20px;
  margin-top: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

 

  /* Increase the size of the leaderboard */
  width: 225px;
  height: 450px; /* Adjust the height as needed */
  font-size: 18px;
  font-family: 'Arial', sans-serif;
`;

const LeaderboardHeader = styled.h2`
  color: #ffffff;
  text-align: center;
  margin-bottom: 20px;
`;

const LeaderboardList = styled.ul`
  list-style-type: none;
  padding: 0;
  overflow-y: auto; /* Add a scrollbar if content exceeds the height */
  max-height: 100%; /* Set a maximum height to trigger overflow */
`;

const LeaderboardItem = styled.li`
  padding: 15px;
  margin: 15px 0;
  background-color: #2980b9;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s;

  &:hover {
    background-color: #1f618d;
  }
`;

const PlayerName = styled.span`
  color: #ffffff;
  font-weight: bold; /* Make the username bold */
  overflow: hidden; /* Hide overflow content */
  text-overflow: ellipsis; /* Display an ellipsis for long names */
`;

const PlayerScore = styled.span`
  color: #ffffff;
`;

export default Leaderboard;
