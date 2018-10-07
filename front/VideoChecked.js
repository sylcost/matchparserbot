import React from 'react'
import { observer } from 'mobx-react'
import { Fade, Well, Image, Panel, Label, Button, Grid, Row, Col } from 'react-bootstrap'
import "./css/styles.css"
import store from './store/Store.js'


export const VideoChecked = observer(() => {
    
    let button;
    if (store.mainPage.videoChecked.url) {
        button = 
        (<Row className="show-grid">
            <Col>
                <div align="center">
                    <Button 
                        bsStyle="success" 
                        bsSize="large" 
                        block
                        onClick={() => store.parseVideo()} 
                        disabled={store.mainPage.videoChecked.rejectReason !== ""}>
                        Parse Video
                    </Button>
                </div>
            </Col>
        </Row>)
    }
    let display = !!(store.mainPage.checkingVideo || store.mainPage.videoChecked.url || store.mainPage.videoChecked.rejectReason)
    console.log("display:"+display)
    console.log("store.mainPage.checkingVideo:"+store.mainPage.checkingVideo)
    console.log("store.mainPage.videoChecked.url:"+store.mainPage.videoChecked.url)
    console.log("store.mainPage.rejectReason:"+store.mainPage.videoChecked.rejectReason)
    let waitingIcon;
    if (store.mainPage.checkingVideo) {
        waitingIcon = 
        (<Row className="show-grid" >
            <Col>
                <div align="center">
                    <Image src="25.svg" />
                </div>
            </Col>
        </Row>)
    }
    let videoInfo;
    if (store.mainPage.videoChecked.url || store.mainPage.videoChecked.rejectReason) {
        videoInfo =
        (<Row className="show-grid">
            <Col>
                <div align="center">
                    <Image src={store.mainPage.videoChecked.thumbnail} />
                </div>
                <a href={store.mainPage.videoChecked.url} >{store.mainPage.videoChecked.title}</a>
                <br/>
                <a href={store.mainPage.videoChecked.channelUrl} >{store.mainPage.videoChecked.channelName}</a>
                <br/>
                {store.mainPage.videoChecked.length}
                <h4>
                    <Label bsStyle="danger">{store.mainPage.videoChecked.rejectReason}</Label>
                </h4>
                <pre hidden={store.mainPage.videoChecked.parsedVideoResult === ""}>{store.mainPage.videoChecked.parsedVideoResult}</pre>
            </Col>
        </Row>)
    }

    return (
        <Fade in={display}>
            <Well>
                <Grid fluid={true}>
                    {waitingIcon}
                    {videoInfo}
                    {button}
                </Grid>
            </Well>
            
        </Fade>
    );

})