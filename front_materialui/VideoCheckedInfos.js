import React from 'react'
import { observer } from 'mobx-react'
import { Image, Label, Row, Col } from 'react-bootstrap'
import "./css/styles.css"


export const VideoCheckedInfos = observer((props) => {

    function formatMatchText(hour, minute, second, p1, p2) {
        let result = ""
        if (hour !== "0") {
            result += hour+":"
        }
        if (minute < 10) {
            result += "0"
        }
        result += minute+":"
        if (second < 10) {
            result += "0"
        }
        result += second + " " + p1 + " vs " + p2 + "\n"
        return result
    }

    // List all the differents characters if the video has already been parsed
    let characters = []
    props.video.matches.forEach(video => {
        if (!characters.includes(video.p1)) {
            characters.push(video.p1)
        }
        if (!characters.includes(video.p2)) {
            characters.push(video.p2)
        }
    })
    characters.sort()

    // Text of the result of the parsing
    let intro = props.video.matches.length + " matches detected.\n"
    intro += characters.length + " differents characters : " + characters + ".\n"
    let matches = props.video.matches.map(match => formatMatchText(match.hour, match.minute, match.second, match.p1, match.p2))
    let resultParsing = 
        (<pre>
            {intro}
            {matches}
        </pre>)

    return (
        <Row className="show-grid">
        <Col>
            <div align="center">
                <Image src={props.video.thumbnail} />
            </div>
            <a href={props.video.url} >{props.video.title}</a>
            <br/>
            <a href={props.video.channelUrl} >{props.video.channelName}</a>
            <br/>
            {props.video.length}
            <h4>
                <Label bsStyle="success">{props.video.rejectReason}</Label>
            </h4>
            {props.video.matches.length > 0 ? resultParsing : null}
        </Col>
    </Row>
    );

})