import React from 'react'
import { observer } from 'mobx-react'
import { applySnapshot } from "mobx-state-tree";
import "./css/styles.css"
import store from './store/Store.js'
import { CurrentProcess } from './CurrentProcessing.js'
import { VideoChecked } from './VideoChecked.js'
import { VideoResume } from './VideoResume.js'
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


export const PageCheckVideo = observer(() => {

    //console.log("store.pageCheckVideo.videoChecked.url:"+store.pageCheckVideo.videoChecked.url)
    //console.log("store.pageCheckVideo.checkingVideo:"+store.pageCheckVideo.checkingVideo)
    console.log("store.pageCheckVideo.videoChecked:"+JSON.stringify(store.pageCheckVideo.videoChecked))

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
    
    function formatMatchText(hour, minute, second, p1, p2) {
        return formatMatchTime(hour, minute, second) + " " + p1 + " vs " + p2 + "\n"
    }


    const StyledTooltip = withStyles({
        tooltip: {
        fontSize: "large"
        }
    })(Tooltip);

  

    let displayParsedVideoInfos = !store.pageCheckVideo.checkingVideo 
        && (store.pageCheckVideo.videoChecked.url !== "" || store.pageCheckVideo.videoChecked.rejectReason !== "")
        && store.pageCheckVideo.videoChecked.matches.length > 0

    let displayNotParsedVideoInfos = store.pageCheckVideo.videoChecked.url !== ""
        && store.pageCheckVideo.videoChecked.matches.length == 0

    let xsFirstGrid = displayNotParsedVideoInfos ? 1 : 4
    let xsSecondGrid = displayNotParsedVideoInfos ? 5 : 4
    let xsThirdGrid = displayNotParsedVideoInfos ? 1 : 3


    let matchesList = store.pageCheckVideo.videoChecked.matches.map(match => (
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
            <ListItemText primary={formatMatchTime(match.hour, match.minute, match.second)}
            />
            <ListItemSecondaryAction>
                <IconButton aria-label="Delete" href={store.pageCheckVideo.videoChecked.url + "&t=" + match.hour + "h" + match.minute + "m" + match.second + "s"} >
                    <PlayCircleFilledIcon />
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>))

    return (
        <div>
            <Grid container justify="center" spacing={24} style={{ paddingTop: 100, paddingBottom: 10 }}>
                <Grid item xs={6} >
                    <Paper style={{ paddingTop: 10, paddingBottom: 10 }} elevation={6}>
                        <form  noValidate autoComplete="off" style={{fontSize:30, paddingLeft: 50, paddingRight: 50}}>
                            <TextField
                                id="standard-name"
                                onChange={(url) => store.changeUrl(url)}
                                placeholder="Paste Youtube URL here"
                                fullWidth
                                margin="normal"
                                disabled={store.pageCheckVideo.checkingVideo}
                                value={store.pageCheckVideo.url}
                                inputProps={{
                                    style: {fontSize:20}
                                }}
                            />
                        </form>
                    </Paper>
                    <Collapse in={store.pageCheckVideo.checkingVideo} >
                        <Grid container justify="center" style={{ paddingTop: 40, paddingLeft: 50, paddingRight: 50 }}>
                                <CircularProgress size={100} />
                        </Grid>
                    </Collapse>
                </Grid>
                

                    <Grid container justify="center" spacing={24} style={{ paddingTop: 100, paddingBottom: 10 }} >
                        <Grid item  xs={xsFirstGrid}>
                            <Collapse in={displayParsedVideoInfos} >
                                <VideoChecked video={store.pageCheckVideo.videoChecked}/>
                            </Collapse>
                        </Grid>
                        <Grid item  xs={xsSecondGrid}>
                            <Collapse in={displayParsedVideoInfos} >
                                <VideoResume video={store.pageCheckVideo.videoChecked} />
                            </Collapse>
                            <Collapse in={displayNotParsedVideoInfos} >
                                <VideoChecked video={store.pageCheckVideo.videoChecked} />
                            </Collapse>
                        </Grid>
                        <Grid item  xs={xsThirdGrid}>
                            <Collapse in={displayParsedVideoInfos}  >
                                <Paper elevation={6} style={{backgroundColor: '#546E7A', paddingTop: 20}}>
                                    <div >
                                        <List >
                                            {matchesList}
                                        </List>
                                    </div>
                                </Paper>
                            </Collapse>
                        </Grid>
                    </Grid>
            </Grid>
        </div>
    );
})