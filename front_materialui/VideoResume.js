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

import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import { MatchesResume } from './MatchesResume'

let handleClick = function(id) {
    console.log('props.video.matches '+JSON.stringify(id))
    //store.setMatchesDrawerRight(id)
}


export const VideoResume = observer((props) => {
    //console.log('props.video.url='+props.video._id)
    //console.log('<<<<<<props.video='+JSON.stringify(props.video.matches))

    return (
        <TableRow 
            key={props.video._id}
            hover
            onClick={() => store.setDrawerMatches(props.video.matches, props.video)}>
            <TableCell scope="row" align="left">
                <img src={`https://i.ytimg.com/vi/${props.video._id}/default.jpg`} alt="thumbnail" style={{display: "block"}} />
            </TableCell>
            <TableCell align="left">
                <h4>
                    <a href={props.video.url} style={{color: "white"}} >{props.video.title}</a>
                    <br/>
                    <a href={props.video.channelUrl} style={{color: "white"}} >{props.video.channelName}</a>
                    <br/>
                    {props.video.length}
                    <br/>
                    {props.video.publishedDate}
                </h4>
            </TableCell>
            <TableCell align="left">
                <MatchesResume matches={props.video.matches} />
            </TableCell>
        </TableRow>
    );
})

/*
<ListItem key={props.video._id}>
            <img src={`https://i.ytimg.com/vi/${props.video._id}/default.jpg`} alt="thumbnail" style={{marginLeft: "auto", marginRight: "auto", display: "block", padding: 20}} />
            <ListItemText >
                <h4>
                    <a href={props.video.url} style={{color: "white"}} >{props.video.title}</a>
                    <br/>
                    <a href={props.video.channelUrl} style={{color: "white"}} >{props.video.channelName}</a>
                    <br/>
                    {props.video.length}
                    <br/>
                    {props.video.publishedDate}
                </h4>
            </ListItemText>
        </ListItem>
*/

