// Status.jsx
import React from 'react';
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

const Status = ({ logs, roomid }) => {
  // Limit the number of logs to display
  console.log(logs);
  console.log(roomid)
  const displayedLogs = logs.slice();

  const downloadLogs = () => {
    const timestamp = new Date().toLocaleTimeString();
    const filename = `log_room_${roomid}_${timestamp}.txt`; // Use the roomid prop
    const logsContent = logs.join('\n');

    const blob = new Blob([logsContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
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
    margin-right: 1.5%;
    margin-left: 1.5%;
    align-items: center;
    position: relative;
    max-height: 100px; /* Set a fixed maximum height for the status box */
    overflow: hidden; /* Hide overflow content */
    display: flex;
    flex-direction: column; /* Make the container a column layout */
  `;

  const StatusTitle = styled.h2`
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 10px;
    margin-top: 0px;
    text-align: center;
  `;

  const StatusList = styled.div`
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    margin-right: 50px; /* Adjust the margin-right value to move the button further to the right */
  `;

  const DownloadLogsButton = styled.button`
    margin-top: 10px;
    padding: 12px 20px; /* Adjust padding for a cleaner look */
    background-color: #3498db; /* Use a different color */
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    align-self: flex-end;
    font-size: 16px;
    position: absolute;
    bottom: 20px; /* Adjust the bottom value to move the button further down */
    right: 25px; /* Adjust the right value to move the button further to the right */
    transition: background-color 0.3s ease; /* Add a smooth transition effect */

    &:hover {
      background-color: #2980b9; /* Change color on hover */
    }
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
  `;

  return (
    <StatusWrapper>
      <StatusTitle>Status</StatusTitle>
      <StatusList>
        {displayedLogs.map((log, index) => (
          <AnimatedStatusMessage
            key={index}
            fadeDuration={fadeDuration * 1000}
            isNew={index === displayedLogs.length - 1}
          >
            {log}
          </AnimatedStatusMessage>
        ))}
        <DownloadLogsButton onClick={downloadLogs}>Download Log</DownloadLogsButton>
      </StatusList>
    </StatusWrapper>
  );
};

export default Status;
