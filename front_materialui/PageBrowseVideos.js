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
import { MatchList } from './MatchList';
import Table from '@material-ui/core/Table';
import { VideoResume } from './VideoResume';


export const PageBrowseVideos = observer((props) => {

    props.videos.forEach(video => {
        console.log('video:'+JSON.stringify(video))
    })
    

    let videosList = props.videos.map(video => <VideoResume video={video} key={video._id}/>)



    return (
        <div>
            <Grid container justify="center" spacing={24} style={{ paddingTop: 100, paddingBottom: 10 }}>
                <Grid item  xs={10}>
                    <Collapse in={true}  >
                        <Paper elevation={6} style={{backgroundColor: '#546E7A', paddingTop: 20}}>
                            <div >
                                dfgdfgdgdfgdg
                                <Button variant="contained" color="secondary" size="large"  onClick={() => store.browseVideos(0, 5)}>
                                    Browse
                                </Button>
                                <Button 
                                    variant="contained" 
                                    color="secondary" 
                                    size="large"  
                                    onClick={() => store.browseVideos(store.pageBrowseVideos.pageNumber+1, store.pageBrowseVideos.videosPerPage)}>
                                    Previous
                                </Button>
                                <Button 
                                    variant="contained" 
                                    color="secondary" 
                                    size="large"  
                                    onClick={() => store.browseVideos(store.pageBrowseVideos.pageNumber-1, store.pageBrowseVideos.videosPerPage)}>
                                    Next
                                </Button>
                            </div>
                            <br />
                            <Table aria-label="simple table">
                                <tbody>
                                    {videosList}
                               </tbody>
                            </Table>
                        </Paper>
                    </Collapse>
                </Grid>
            </Grid>
        </div>
    );
})