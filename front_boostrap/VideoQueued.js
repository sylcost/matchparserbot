import React from 'react'
import { observer } from 'mobx-react'
import { Panel, Grid, Row, Col, Image } from 'react-bootstrap'
import "./css/styles.css"
import { MyProgressBar } from './MyProgressBar.js'


export const VideoQueued = observer((props) => {

    let panelbody = (<div>QUEUED</div>);
    if (props.video.status !== "WAITING") {
        panelbody = (
            <Grid fluid={true}>
                <Row className="show-grid" >
                    <Col md={1}>
                        <div align="right">Download</div>
                    </Col>
                    <Col md={10}>
                        <MyProgressBar percent={props.video.dl}/> 
                    </Col>
                </Row>
                <Row className="show-grid">
                    <Col md={1}>
                        <div align="right">Parsing</div>
                    </Col>
                    <Col md={10}>
                        <MyProgressBar percent={props.video.parsing} /> 
                    </Col>
                </Row>
            </Grid>)
    }
    

    return (
        <Panel bsStyle="primary">
            <Panel.Heading >
            <Grid fluid={true}>
                <Row className="show-grid" >
                    <Col md={9}>
                        <a style={{color: "#fff", fontWeight: "bold", fontSize: "large"}} href={props.video.url}>{props.video.title}</a> 
                        <br/>
                        <div >
                            Uploaded on {props.video.publishedDate} by <a style={{color: "#fff"}} href={props.video.channelUrl}>{props.video.channelName}</a> ({props.video.length})
                        </div>
                    </Col>
                    <Col md={3}>
                        <div style={{float: "right"}}>
                            <Image src={props.video.thumbnail}/> 
                        </div>
                    </Col>
                </Row>
            </Grid>
            </Panel.Heading>
            <Panel.Body >
                {panelbody}
            </Panel.Body>
        </Panel>
    );

})