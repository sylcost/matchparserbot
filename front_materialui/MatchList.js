import React from 'react'
import { observer } from 'mobx-react'
import { applySnapshot } from "mobx-state-tree";
import "./css/styles.css"
import store from './store/Store.js'
import io from 'socket.io-client'
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar'
import Grid from '@material-ui/core/Grid'
import Toolbar from '@material-ui/core/Toolbar'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Collapse from '@material-ui/core/Collapse'
import CircularProgress from '@material-ui/core/CircularProgress'
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DeleteIcon from '@material-ui/icons/Delete';
import DoneIcon from '@material-ui/icons/Done';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles'; 

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';


export const MatchList = observer((props) => {

    //console.log("store.pageCheckVideo.videoChecked.url:"+store.pageCheckVideo.videoChecked.url)
    //console.log("store.pageCheckVideo.checkingVideo:"+store.pageCheckVideo.checkingVideo)
    console.log("matches:"+JSON.stringify(props.matches))

    function formatMatchTime(hour, minute, second) {
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
        return result + second
    }

    const StyledTooltip = withStyles({
        tooltip: {
        fontSize: "large"
        }
    })(Tooltip);


    let matchesList = props.matches.map(match => (
        <ListItem key={`${match.hour}+${match.minute}+${match.second}`}>
            <ListItemAvatar>
                <StyledTooltip title={match.p1} placement="left-start" >
                    <Avatar alt={match.p1} src={`icons/${match.p1}.png`} />
                </StyledTooltip>
            </ListItemAvatar>
            <ListItemAvatar>
                <StyledTooltip title={match.p2} placement="right-start" >
                    <Avatar alt={match.p2} src={`icons/${match.p2}.png`} />
                </StyledTooltip>
            </ListItemAvatar>
            <ListItemText primary={formatMatchTime(match.hour, match.minute, match.second)} style={{paddingLeft: 15, paddingRight: 35}}
            />
            <ListItemSecondaryAction>
                <IconButton aria-label="Delete" href={store.pageCheckVideo.videoChecked.url + "&t=" + match.hour + "h" + match.minute + "m" + match.second + "s"} >
                    <PlayCircleFilledIcon />
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>))

    return (
        <div>
            <Collapse in={props.matches.length > 0}  >
                <Paper elevation={6} style={{backgroundColor: '#546E7A', paddingTop: 20}}>
                    <div >
                        <List >
                            {matchesList}
                        </List>
                    </div>
                </Paper>
            </Collapse>
        </div>
    );
})