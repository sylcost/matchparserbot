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
    
    // URL is set
    let display = !!(props.checkingVideo || props.video.url || props.video.rejectReason)
    // Video can be added to DB
    let displayButton = props.video.rejectReason === "" && !props.checkingVideo && !props.addingVideo
    // Video is being checked or added
    let displayWaitingIcon = props.video.rejectReason === "" && (props.addingVideo || props.checkingVideo)

    return (
        <Fade in={display}>
            <Well>
                <Grid fluid={true}>
                    <VideoCheckedInfos video={props.video}/>
                    {displayButton ? button : null}
                    <WaitingIcon active={displayWaitingIcon} />
                </Grid>
            </Well>
        </Fade>
    );

})