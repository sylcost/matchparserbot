import React from 'react'
import { observer } from 'mobx-react'
import { applySnapshot } from "mobx-state-tree";
import "./css/styles.css"
import store from './store/Store.js'
import { CurrentProcess } from './CurrentProcessing.js'
import { VideoChecked } from './VideoChecked.js'
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


// WebSocket
const socket = io('http://localhost:3000')
socket.on('news', function (data) {
    applySnapshot(store.currentProcessing.videos, data)
});
socket.on('connect', function() {
    //socket.emit('eventFromFront', {data: 'I\'m connected!'});
});

export const App = observer(() => {

    //console.log("store.mainPage.videoChecked.url:"+store.mainPage.videoChecked.url)
    //console.log("store.mainPage.checkingVideo:"+store.mainPage.checkingVideo)
    console.log("store.mainPage.videoChecked:"+JSON.stringify(store.mainPage.videoChecked))

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

    // List all the differents characters if the video has already been parsed
    let characters = []
    store.mainPage.videoChecked.matches.forEach(video => {
        if (!characters.includes(video.p1)) {
            characters.push(video.p1)
        }
        if (!characters.includes(video.p2)) {
            characters.push(video.p2)
        }
    })
    characters.sort()

    // Map with the differents characters and the number of matches they appear
    let charactersMap = new Map()
    store.mainPage.videoChecked.matches.forEach(video => {
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

    // Text of the result of the parsing
    let intro = store.mainPage.videoChecked.matches.length + " matches detected.\n"
    intro += characters.length + " differents characters : " + characters + ".\n"
    let matches = store.mainPage.videoChecked.matches.map(match => formatMatchText(match.hour, match.minute, match.second, match.p1, match.p2))
    let resultParsing = 
        (<pre>
            {intro}
            {matches}
        </pre>)

    const StyledCardMedia = withStyles({
        root: {
        width: '336px',
        marginLeft: "auto",
        marginRight: "auto"
        }
    })(CardMedia);

    const StyledTooltip = withStyles({
        tooltip: {
        fontSize: "large"
        }
    })(Tooltip);

    const StyledChip = withStyles({
        root: {
        fontSize: "large"
        }
    })(Chip);
  

    let displayVideoInfos = !store.mainPage.checkingVideo && (store.mainPage.videoChecked.url !== "" || store.mainPage.videoChecked.rejectReason !== "")



    let joliParsing = store.mainPage.videoChecked.matches.length + " matches detected.\n" + "Featuring characters :\n"
    let img = characters.map(char => 
        (<StyledTooltip title={char + " (" + charactersMap.get(char) + ")"} placement="bottom" key={char}>
            <img src={`icons/${char}.png`} alt={char} style={{width:96, height:96}} key={char}/>
        </StyledTooltip>

        ))


    let matchesList = store.mainPage.videoChecked.matches.map(match => (
        <ListItem key={`${match.hour}+${match.minute}+${match.second}`}>
            <ListItemAvatar>
                <Avatar alt={match.p1} src={`icons/${match.p1}.png`} />
            </ListItemAvatar>
            <ListItemAvatar>
                <Avatar alt={match.p2} src={`icons/${match.p2}.png`} />
            </ListItemAvatar>
            <ListItemText primary={formatMatchTime(match.hour, match.minute, match.second)} 
            />
            <ListItemSecondaryAction>
                <IconButton aria-label="Delete" href={store.mainPage.videoChecked.url + "&t=" + match.hour + "h" + match.minute + "m" + match.second + "s"} >
                    <PlayCircleFilledIcon />
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>))

    return (
        <div>
            <AppBar position="static" color="primary">
                <Toolbar>
                MazkX3k8giA
                </Toolbar>
            </AppBar>
            r1VxsaLj858
            <Button variant="contained" color="secondary">
                Hello World
            </Button>
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
                                disabled={store.mainPage.checkingVideo}
                                value={store.mainPage.url}
                                inputProps={{
                                    style: {fontSize:20}
                                }}
                            />
                        </form>
                    </Paper>
                    <Collapse in={store.mainPage.checkingVideo} style={{ paddingTop: 10, paddingLeft: 50, paddingRight: 50 }}>
                        <Grid container justify="center" >
                                <CircularProgress size={100} />
                        </Grid>
                    </Collapse>
                    


                </Grid>
                
                
                
                
                    <Grid container justify="center" spacing={24} style={{ paddingTop: 100, paddingBottom: 10 }} >
                        <Grid item  xs={4}>
                            <Collapse in={!!displayVideoInfos} >
                                <Paper elevation={6} style={{backgroundColor: '#546E7A'}}>
                                    <Grid item  >
                                        <img src={store.mainPage.videoChecked.thumbnail} alt="thumbnail" style={{width:336, height:188, marginLeft: "auto", marginRight: "auto", display: "block", borderRadius: "15px", paddingTop: 20}} />
                                    </Grid>
                                    <Grid item  >
                                        <div style={{color: "white", paddingLeft: 50, paddingBottom: 20}} >
                                            <br />
                                            <a href={store.mainPage.videoChecked.url} style={{color: "white", fontWeight: "bold"}} >{store.mainPage.videoChecked.title}</a>
                                            <br />
                                            <a href={store.mainPage.videoChecked.channelUrl} style={{color: "white"}} >{store.mainPage.videoChecked.channelName}</a>
                                            <br/>
                                            {store.mainPage.videoChecked.length}
                                            <br />
                                            Published : {store.mainPage.videoChecked.publishedDate}
                                            <br />
                                        </div>
                                    </Grid>
                                </Paper>
                            </Collapse>
                        </Grid>
                        <Grid item  xs={4}>
                            <Collapse in={!!displayVideoInfos} >
                                <Paper elevation={6} style={{backgroundColor: '#546E7A', paddingTop: 10}}>
                                    <div style={{color: "white", paddingLeft: 50}}>
                                        {store.mainPage.videoChecked.matches.length} matches detected.
                                        <br />
                                        Featuring {characters.length} differents characters :
                                        <br />
                                        
                                    </div>
                                    <div>
                                            {img}
                                        </div>
                                </Paper>
                            </Collapse>
                        </Grid>
                        <Grid item  xs={3}>
                            <Collapse in={!!displayVideoInfos}  >
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