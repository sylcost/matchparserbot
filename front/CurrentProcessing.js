import React from 'react'
import { observer } from 'mobx-react'
import { Well } from 'react-bootstrap'
import "./css/styles.css"
import { VideoQueued } from './VideoQueued.js'


export const CurrentProcess = observer((props) => {


    let videoList = props.videos.map(video => <VideoQueued video={video} key={video.url}/>)
    let videos = 
    (<Well>
        <h2>Next video(s) to process</h2>
        {videoList}
    </Well>)
    
    return (
        <div>
            {props.videos.length > 0 ? videos : null}
        </div>
    );

})