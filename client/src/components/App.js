import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JoinGame from './JoinGame';
import Game from './Game';
import axios from 'axios';
import { SERVER_URL } from './../constants.js';

const App = () => {

  useEffect(() => { //fix up all this shit (a lot is unneccesary)
    const fetchAuthStatus = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/getCurrentUser`, { withCredentials: true });
        const { success } = response.data;

        if (!success){

          // Redirect to login page if not authenticated
          window.location.replace(`${SERVER_URL}`);
        }
      } catch (error) {
        console.error('Error fetching authentication status:', error);
      }
    };
    fetchAuthStatus();
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          exact
          path="/"
          element={<JoinGame/>}
        />
        <Route path="/game/:roomid" element={<Game/>} />
      </Routes>
    </Router>
  );
};

export default App;