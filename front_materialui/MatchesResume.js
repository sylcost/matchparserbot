import React from 'react'
import { observer } from 'mobx-react'
import "./css/styles.css"
import store from './store/Store.js'
import Grid from '@material-ui/core/Grid'
import Collapse from '@material-ui/core/Collapse'
import CardMedia from '@material-ui/core/CardMedia';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper'
import DoneIcon from '@material-ui/icons/Done';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles'; 

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';



export const MatchesResume = observer((props) => {

    const StyledTooltip = withStyles({
        tooltip: {
        fontSize: "large"
        }
    })(Tooltip);

    // Map with the differents characters and the number of matches they appear
    let charactersMap = new Map()
    props.matches.forEach(video => {
        if (!charactersMap.has(video.p1)) {
            charactersMap.set(video.p1, 1)
        } else {
            let count = charactersMap.get(video.p1)
            charactersMap.set(video.p1, count+1)
        }
        if (video.p1 !== video.p2) {
            if (!charactersMap.has(video.p2)) {
                charactersMap.set(video.p2, 1)
            } else {
                let count = charactersMap.get(video.p2)
                charactersMap.set(video.p2, count+1)
            }
        }
        
    })

    let img = Array.from(charactersMap).map(([key,value]) => 
        (<StyledTooltip title={key + " (" + value + ")"} placement="bottom" key={key}>
            <img src={`icons/${key}.png`} alt={key} style={{width:96, height:96}} key={key}/>
        </StyledTooltip>
        ))

    return (
        
        <Paper elevation={6} style={{backgroundColor: '#546E7A', paddingTop: 10}}>
            <div style={{color: "white", paddingLeft: 50}}>
                {props.matches.length} matches detected.
                <br />
                Featuring {charactersMap.size} differents characters :
                <br />
            </div>
            <div style={{padding: 20}}>
                    {img}
                </div>
        </Paper>
    );
})