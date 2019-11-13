import React from 'react'
import { observer, propTypes } from 'mobx-react'
import "./css/styles.css"
import store from './store/Store.js'
import Grid from '@material-ui/core/Grid'
import Collapse from '@material-ui/core/Collapse'
import CardMedia from '@material-ui/core/CardMedia';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper'
import DoneIcon from '@material-ui/icons/Done';
import PublishIcon from '@material-ui/icons/Publish';
import WarningIcon from '@material-ui/icons/Warning';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles'; 
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';



export const VideoChecked = observer((props) => {

    const StyledChip = withStyles({
        root: {
        fontSize: "large"
        }
    })(Chip);

    let chip = <PublishIcon />
    let button = (
    <Button variant="contained" color="secondary" size="large"  onClick={() => store.addVideo()}>
        Add video
    </Button>
    )
    
    switch(props.video.rejectCode) {
        case "FINISHED":
            chip = <DoneIcon />
            break;
        case "NOTVALID":
            chip = <WarningIcon />
            break;
        case "BADNAME":
            chip = <WarningIcon />
            break;
        case 4:
            chip = <WarningIcon />
            break;
        case "BADCHANNEL":
            chip = <WarningIcon />
            break;
        case "QUEUED":
            chip = <DoneIcon />
            break;
        default:
            chip = <PublishIcon />
    }

    let styledChip = <StyledChip label={props.video.rejectReason} color="secondary" icon={chip} />
    let bouton = (
        <div>
            <Button variant="contained" color="secondary" size="large">
                Cannot add video
            </Button>
        </div>)
    console.log(JSON.stringify(props.video))

    return (
        <Paper elevation={6} style={{backgroundColor: '#546E7A'}}>
            <Grid item  >
                <img src={props.video.thumbnail} alt="thumbnail" style={{marginLeft: "auto", marginRight: "auto", display: "block", padding: 20}} />
            </Grid>
            <Grid item  >
                <div style={{color: "white", paddingLeft: 50, paddingBottom: 20}} >
                    <br />
                    <a href={props.video.url} style={{color: "white", fontWeight: "bold"}} >{props.video.title}</a>
                    <br />
                    <a href={props.video.channelUrl} style={{color: "white"}} >{props.video.channelName}</a>
                    <br/>
                    {props.video.length}
                    <br />
                    Published : {props.video.publishedDate}
                    <br />
                    <br />
                    {props.video.rejectReason ? styledChip : button}
                </div>
            </Grid>
        </Paper>
    )
})