import React from 'react'
import { observer } from 'mobx-react'
import { applySnapshot } from "mobx-state-tree";
import { Grid, Jumbotron, Button, Well, Row, Col, ControlLabel, FormControl, FormGroup, HelpBlock, Image, Panel, Fade, Label, Table } from 'react-bootstrap'
import { Navbar, NavItem, Nav } from 'react-bootstrap'
import "./css/styles.css"
import store from './store/Store.js'
import { CurrentProcess } from './CurrentProcessing.js'
import { VideoChecked } from './VideoChecked.js'
import io from 'socket.io-client'



const socket = io('http://localhost:3000')
socket.on('news', function (data) {
    console.log("event news:"+JSON.stringify(data))
    //socket.emit('eventFromFront', { my: 'data' });
    console.log("avant:"+JSON.stringify(store.currentProcessing))
    applySnapshot(store.currentProcessing.videos, data)
    console.log("apres:"+JSON.stringify(store.currentProcessing))
});
socket.on('connect', function() {
    //socket.emit('eventFromFront', {data: 'I\'m connected!'});
});

export const App = observer(() => {

    

    return (
        <div>
            <Navbar>
                <Navbar.Header>
                    <Navbar.Brand>
                    <a href="#home">React-Bootstrap</a>
                    </Navbar.Brand>
                </Navbar.Header>
                <Nav>
                    <NavItem eventKey={1} href="#">
                    Link
                    </NavItem>
                    <NavItem eventKey={2} href="#">
                    Link
                    </NavItem>
                </Nav>
            </Navbar>
            <Grid bsClass='container'>
                <Jumbotron style={{backgroundColor: "#1063bc"}}>
                    <h1>Hello</h1>
                    <p>
                        This is a simple website to parse BBCF2 videos from gameacho youtube channel.
                    </p>
                </Jumbotron>
                <Well>https://www.youtube.com/watch?v=60WNEb6dHsM</Well>
                <Grid id="test1" bsClass='container-fluid'>
                    <Col md={2}>
                        Bullshit stuff
                    </Col>
                    <Col md={8}>
                        <FormGroup
                            controlId="formBasicText" >
                            <ControlLabel>https://www.youtube.com/watch?v=waR5xaZIQx8</ControlLabel>
                            <FormControl
                                bsSize="large"
                                type="text"
                                value={store.mainPage.url}
                                placeholder="https://www.youtube.com/watch?v=60WNEb6dHsM"
                                onChange={(url) => store.changeUrl(url)} />
                            <FormControl.Feedback />
                            <HelpBlock>Validation is based on string length.</HelpBlock>
                        </FormGroup>
                        <VideoChecked />
                    </Col>
                    <Col md={2}>
                        <Well>https://www.youtube.com/watch?v=60WNEb6dHsM</Well>
                        
                    </Col>
                </Grid>
                <br/>
                <CurrentProcess />
            </Grid>
        </div>
    );

    function submit() {
        //60WNEb6dHsM
        console.log('coucou')
        fetch

    }

})