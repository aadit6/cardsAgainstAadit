// Hand.jsx
import React from 'react';
import styled from 'styled-components';

const HandWrapper = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
  height: 250px;
  padding-bottom: 0px;
`;


const Hand = ({ children }) => {
  return <HandWrapper>{children}</HandWrapper>;
};

export default Hand;
