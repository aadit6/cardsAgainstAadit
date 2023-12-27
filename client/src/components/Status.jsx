import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';

const fadeDuration = 0.5; // seconds

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const moveUp = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
`;

const Status = ({ logs }) => {
  const [statusLogs, setStatusLogs] = useState([]);

  useEffect(() => {
    // Update the statusLogs state whenever logs prop changes
    setStatusLogs(logs);
  }, [logs]);

  return (
    <StatusWrapper>
      <StatusTitle>Status</StatusTitle>
      <StatusList>
        {statusLogs.map((log, index) => (
          <AnimatedStatusMessage
            key={index}
            fadeDuration={fadeDuration * 1000}
            isNew={index === statusLogs.length - 1}
          >
            {log}
          </AnimatedStatusMessage>
        ))}
      </StatusList>
    </StatusWrapper>
  );
};

const fadeInAnimation = css`
  ${fadeIn} ${fadeDuration}s ease-in-out
`;

const fadeOutAnimation = css`
  ${fadeOut} ${fadeDuration}s ease-in-out
`;

const moveUpAnimation = css`
  ${moveUp} ${fadeDuration}s ease-in-out
`;

const StatusWrapper = styled.div`
  background-color: #333;
  color: #fff;
  padding-bottom: 2px;
  border-radius: 8px;
  margin-bottom: 20px;
  margin-top: 20px;
  margin-right: 1%;
  margin-left: 1%;
  align-items: center;
  position: relative;
`;

const StatusTitle = styled.h2`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
`;

const StatusList = styled.div`
  display: flex;
  flex-direction: column-reverse; /* Reverse the order to display new messages at the top */
  align-items: center;
`;

const AnimatedStatusMessage = styled.div`
  background-color: #333;
  color: #fff;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 20px;
  text-align: center;
  opacity: ${({ isNew }) => (isNew ? 1 : 0)};
  animation: ${({ isNew }) =>
    isNew
      ? css`
          ${fadeInAnimation}, ${moveUpAnimation}
        `
      : fadeOutAnimation};
  animation-fill-mode: forwards;
  transform-origin: bottom;
  max-height: 100px; /* Set a maximum height for the message */
  overflow: hidden; /* Hide overflow content */
`;

export default Status;
