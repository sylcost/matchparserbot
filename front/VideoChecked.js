import React from 'react'
import { observer } from 'mobx-react'
import { Fade, Well, Image, Panel, Label, Button, Grid, Row, Col } from 'react-bootstrap'
import "./css/styles.css"
import { WaitingIcon } from './WaitingIcon.js'
import { VideoCheckedInfos } from './VideoCheckedInfos.js'


export const VideoChecked = observer((props) => {

    let button = 
        (<Button 
            bsStyle="success" 
            bsSize="large" 
            block
            onClick={() => props.addVideoFunc()} >
            GO !
        </Button>)
    let waitingIcon = 
        (<div align="center">
            <Image src="25.svg" />
        </div>)
    const buttonOrWaitingIcon = 
        (<Row className="show-grid">
            <Col>
                <div align="center">
                    {props.addingVideo ? <WaitingIcon active="true" /> : button}
                </div>
            </Col>
        </Row>)
    
    // URL is set
    let display = !!(props.checkingVideo || props.video.url || props.video.rejectReason)
    // Video can be added to DB
    let displayButton = props.video.url && props.video.rejectReason === ""

    return (
        <Fade in={display}>
            <Well>
                <Grid fluid={true}>
                    <WaitingIcon active={props.checkingVideo} />
                    <VideoCheckedInfos video={props.video}/>
                    {displayButton ? buttonOrWaitingIcon : null}
                </Grid>
            </Well>
        </Fade>
    );

})