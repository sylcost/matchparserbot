import React from 'react'
import { observer } from 'mobx-react'
import { ProgressBar, Well, Image, Panel, Grid, Row, Col, Table, ListGroup, ListGroupItem, Label, Jumbotron } from 'react-bootstrap'
import "./css/styles.css"
import store from './store/Store.js'
import { VideoQueued } from './VideoQueued.js'


export const CurrentProcess = observer(() => {


    let videos = store.currentProcessing.videos.map(video => <VideoQueued video={video} key={video.url}/>)

    return (
        <div>
            <Well>current processing stuff
                {videos}
            </Well>
        </div>
    );

})