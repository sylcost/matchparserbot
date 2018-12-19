import React from 'react'
import ReactDOM from 'react-dom'
import { App } from './App.js'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';


const palette = {
    primary: { main: '#546E7A' },
    secondary: { main: '#FF9800' }
  };
const themeName = 'Cutty Sark Pizazz Banteng';

const theme = createMuiTheme({ palette, themeName });

ReactDOM.render(
    <MuiThemeProvider theme={theme}>
        <App />
    </MuiThemeProvider>,
    document.getElementById('root')
);

// Init de l'application
//store.init()