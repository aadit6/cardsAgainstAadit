import React from 'react';
import styled, { css } from 'styled-components';
import { MdVolumeUp } from 'react-icons/md';
import axios from 'axios';
import { ELEVENLABS_API_KEY, ELEVENLABS_URL } from '../constants';

const CardContainer = styled.div`
  position: relative;
`;

const Card = styled.div`
  background-color: white;
  color: black;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  margin: 5px;
  padding: 1em;
  text-align: left;
  height: 170px;
  width: 100px;
  display: flex;
  flex-direction: column;
  font-size: 13px;
  font-weight: 500;
  font-family: Arial, Helvetica, sans-serif;
  transition: transform 0.2s; /* Add transition for the transform property */
  margin-top: 20px;
  white-space: pre-wrap; /* Preserve both spaces and line breaks */

  &:after {
    content: "${props => props.selectedPlayer}";
    position: absolute;
    bottom: 40px;
    left: 10%;
    transform: translateX(15%);
    font-size: 14px;
    font-weight: bold;
    padding: 0px;
  }

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
      }
    `}

  ${({ selected }) =>
    selected &&
    css`
      box-shadow: 0px 0px 10px green;
      border: 5px solid #3498db;
    `}

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5; /* Adjust opacity to visually indicate disabled state */
      pointer-events: none; /* Disable pointer events to prevent interaction */
    `}
`;

const SoundIconContainer = styled.div`  
  display: flex;
  justify-content: center;
`;

const SoundIcon = styled(MdVolumeUp)`
  font-size: 20px;
  color: #3498db;
  cursor: pointer;
`;

const WhiteCard = ({ text, onClick, disabled, hoverEffect, selected, selectedPlayer }) => {
  const playTTS = async () => {
    const apiUrl = `${ELEVENLABS_URL}/v1/text-to-speech/Yko7PKHZNXotIFUBG7I9`;
    const requestData = {
      text: text,
      voice_settings: {
        similarity_boost: 0,
        stability: 0,
      },
    };

    try {
      const response = await axios.post(apiUrl, requestData, {
        headers: {
          'xi-api-key': `${ELEVENLABS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      });

      const audioBlob = new Blob([response.data], { type: 'audio/mp3' });
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play();
    } catch (error) {
      console.error('Error playing text to speech: ', error);
    }
  };

  return (
    <CardContainer>
    <Card onClick={onClick} disabled={disabled} hoverEffect={hoverEffect} selected={selected} selectedPlayer={selectedPlayer}>
      {text}
    </Card>
    <SoundIconContainer onClick={playTTS}>
      <SoundIcon />
    </SoundIconContainer>
  </CardContainer>
  );
};

export default WhiteCard;
