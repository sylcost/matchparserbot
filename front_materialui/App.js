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
import Drawer from '@material-ui/core/Drawer';
import { PageCheckVideo } from './PageCheckVideo';
import { PageBrowseVideos } from './PageBrowseVideos';
import { MatchList } from './MatchList';
import { MatchesResume } from './MatchesResume';


// WebSocket
const socket = io('http://localhost:3000')
socket.on('news', function (data) {
    applySnapshot(store.currentProcessing.videos, data)
});
socket.on('connect', function() {
    //socket.emit('eventFromFront', {data: 'I\'m connected!'});
});

export const App = observer(() => {

    console.log('v='+JSON.stringify(store.pageBrowseVideos.videos.filter(v => v._id === store.drawerRight.idVideo)))
    console.log('matches='+JSON.stringify(store.pageBrowseVideos.videos.filter(v => v._id === store.drawerRight.idVideo).matches))
    let vid = store.pageBrowseVideos.videos.filter(v => v._id === store.drawerRight.idVideo).length > 0
    let matchesDrawer = vid ? store.pageBrowseVideos.videos.filter(v => v._id === store.drawerRight.idVideo)[0].matches : []
    return (
        <div>
            <Drawer anchor="right" open={!!store.drawerRight.idVideo} onClose={() => store.closeDrawerRight()}>
                <MatchList matches={matchesDrawer} />
            </Drawer>
            <AppBar position="static" color="primary">
                <Toolbar>
                MazkX3k8giA - LbLzbMr_7wk - pvFpm9tWgl4
                <Button variant="contained" color="secondary" onClick={() => store.switchPage('checkvideo')}>
                    Check video
                </Button>
                <Button variant="contained" color="secondary" onClick={() => store.switchPage('browsevideos')}>
                    Browse videos
                </Button>
                </Toolbar>
            </AppBar>
            r1VxsaLj858
            <Button variant="contained" color="secondary">
                Hello World
            </Button>
            {store.page === "checkvideo" ? <PageCheckVideo /> : <PageBrowseVideos videos={store.pageBrowseVideos.videos} pageNumber={store.pageBrowseVideos.pageNumber} videosPerPage={store.pageBrowseVideos.videosPerPage}/>}
        </div>
    );
})