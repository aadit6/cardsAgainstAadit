import React, {Component} from 'react';
import styled from 'styled-components';
import axios from 'axios';
import {io} from 'socket.io-client';

import { SERVER_URL } from '../constants';

const socket = io(SERVER_URL, {
    withCredentials: true
})

class Game extends Component{

    this.state = { //change this later on

    }

    




}