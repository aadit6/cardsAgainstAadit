import React from 'react';
import styled from 'styled-components';

const GameTitle = () => {
  return <Title>CARDS AGAINST AADIT</Title>;
};

const Title = styled.h1`
  font-size: 40px; /* Adjust the font size as needed for prominence */
  text-align: center; /* Center the title */
  margin-bottom: 20px; /* Add margin for separation */
  margin-left: 35%;
  color: white;
`;

export default GameTitle;
