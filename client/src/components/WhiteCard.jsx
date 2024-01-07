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
  margin-top: 20px;

  white-space: pre-wrap; /* Preserve both spaces and line breaks */



  ${({ hoverEffect }) =>
    hoverEffect &&
    css`
      &:hover {
        transform: scale(1.1);
        cursor: pointer;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); /* Add a subtle box shadow */
        background-color: #f0f0f0; /* Change background color on hover */
        transition: transform 0.2s, background-color 0.2s, box-shadow 0.2s; /* Add smooth transitions */
        border: 4px solid #3498db; /* Change border color on hover */




        // Add additional hover styles if needed
      }
    `}

  ${({ disabled }) =>
  disabled &&
  css`
    opacity: 0.5; /* Adjust opacity to visually indicate disabled state */
    pointer-events: none; /* Disable pointer events to prevent interaction */
  `}
`;

const WhiteCard = ({ text, onClick, disabled, hoverEffect }) => {
  return(
    <Card onClick={onClick} disabled={disabled} hoverEffect={hoverEffect}>{text}</Card>
    ) 
};

export default WhiteCard;
