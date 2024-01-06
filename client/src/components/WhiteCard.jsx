// WhiteCard.jsx
import React from 'react';
import styled, {css} from 'styled-components';

const Card = styled.div`
  background-color: white;
  color: black;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, .5);
  margin: 5px;
  padding: 1em;
  text-align: left;
  height: 170px;
  width: 100px;
  display: block;
  font-size: 13px;
  font-weight: 500;
  position: relative;
  font-family: Arial, Helvetica, sans-serif;
  flex: 0 0 auto;
  transition: transform 0.2s; /* Add transition for the transform property */
  cursor: pointer; /* Change cursor to pointer on hover */

  &:hover {
    transform: scale(1.1); /* Scale the card slightly on hover */
  }

  ${({ disabled }) =>
  disabled &&
  css`
    opacity: 0.5; /* Adjust opacity to visually indicate disabled state */
    pointer-events: none; /* Disable pointer events to prevent interaction */
  `}
`;

const WhiteCard = ({ text, onClick, disabled }) => {
  return(
    <Card onClick={onClick} disabled={disabled}>{text}</Card>
    ) 
};

export default WhiteCard;
