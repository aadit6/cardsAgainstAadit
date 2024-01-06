// BlackCard.jsx
import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
    background-color: black;
    color: white;
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
    margin-top: 20px;

    /* Additional styling for pick display */
    &:after {
      content: "Pick ${props => props.pick} card(s)";
      position: absolute;
      bottom: 10px;
      left: 0%;
      transform: translateX(15%);
      font-size: 15px;
      font-weight: bold;
      padding: 0px;
    }
`; 

const BlackCard = ({ text, pick }) => {
  return <Card pick={pick}>{text}</Card>;
};

export default BlackCard;
