// Hand.jsx
import React from 'react';
import styled from 'styled-components';

const HandWrapper = styled.div`
  display: flex;
  flex-wrap: wrap; /* Allow items to wrap into the next row */
  gap: 10px;
  width: 100%;
  max-height: 950px; /* Set a maximum height for the hand */
`;

const Hand = ({ children }) => {
  return <HandWrapper>{children}</HandWrapper>;
};

export default Hand;