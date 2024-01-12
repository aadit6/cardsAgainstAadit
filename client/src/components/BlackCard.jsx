// BlackCard.jsx
import React from 'react';
import styled from 'styled-components';
import { MdVolumeUp } from 'react-icons/md';
import axios from 'axios';
import { ELEVENLABS_API_KEY, ELEVENLABS_URL } from '../constants';

const Container = styled.div`
    position: relative
`

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

const SoundIconContainer = styled.div`  
  display: flex;
  justify-content: center;
`;

const SoundIcon = styled(MdVolumeUp)`
  font-size: 20px;
  color: #3498db;
  cursor: pointer;
`;

const BlackCard = ({ text, pick }) => {

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

  return(
    <Container>
    <Card pick={pick}>{text}</Card>
    <SoundIconContainer onClick={playTTS}>
      <SoundIcon />
    </SoundIconContainer>
    </Container>


  ) 
};

export default BlackCard;



