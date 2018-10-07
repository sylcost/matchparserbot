import React from 'react'
import ReactDOM from 'react-dom'
import { App } from './App.js'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import store from './store/Store.js'

ReactDOM.render(
    <App />,
    document.getElementById('root')
);

// Init de l'application
//store.init()