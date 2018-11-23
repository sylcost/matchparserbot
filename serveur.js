const path = require('path')
const express = require('express')
const app = express();
app.use(express.static(path.join(__dirname,"/front")));
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cron = require('node-cron');
const ytdl = require('ytdl-core');
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const Promise = require("bluebird");



const SECRET_KEY = "AIzaSyCVkBrbg4rwjcVtWmWQYLUk8uus-XxN31A"

server.listen(3000, () => {
    console.log(`server ok : http://localhost:3000`);
});

// Mongo
mongoose.connect("mongodb://localhost:27017/matchparserdb", { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'erreur:'));
db.once('open', () => {
    console.log('connexion mongodb ok');
});

// Creation Schema Video
const schemaVideo = mongoose.Schema({
    "thumbnail": String,
    "title": String,
    "channelName": String,
    "channelUrl": String,
    "length": String,
    "url": String,
    "status": String,
    "addDate": String,
    "publishedDate": String,
    "dl": Number,
    "parsing": Number,
    "_id": String
});
const Video = mongoose.model('Video', schemaVideo);

// Creation Schema Match
const schemaMatch = mongoose.Schema({
    "_id": String,
    "idVideo": String,
    "hour": String,
    "minute": String,
    "second": String,
    "p1": String,
    "p2": String
});
const Match = mongoose.model('Match', schemaMatch);

// Front.
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});


app.get('/checkvideo/:url', async function(req, res) {
    console.log(req.params.url)
    let result = await checkVideo(req.params.url)
    console.log("result:"+JSON.stringify(result))
    res.send(result)
});

app.get('/addvideo/:url', async function(req, res) {
    console.log(req.params.url)
    let video = {}
    try {
        video = await checkVideo(req.params.url)
        if (!video.rejectCode) {
            video = await addVideo(video)
            if (!video.error) {
                // Video has been successfully added
                video = {...video, "rejectCode": 1}
            } // TODO si l'ajout a eu une erreur, faire un truc
        }
    } 
    catch (err) {
        console.log(`Error addVideo : ${err}`)
    }

    // Call python server to start the download/parsing job
    try {
        await fetch("http://localhost:5000/firemainjob")
    } catch (err) {
        // don't care, video has been added to db anyway
        console.log(`Error calling python server /firemainjob : ${err}`)
    }
    
    res.send(video)
});

// Check if the video can be added to DB
checkVideo = async (url) => {

    try {
        let valid = ytdl.validateURL('http://www.youtube.com/watch?v='+url)
        if (valid) {
            let result = await ytdl.getBasicInfo('http://www.youtube.com/watch?v='+url)
            let publishedDate = await getPublishedDate(result.video_id)
            const videoDB = await getVideoFromDB(result.video_id)
            
            let videoInfo = {
                "thumbnail": result.thumbnail_url,
                "title": result.title,
                "channelName": result.author.name,
                "channelUrl": result.author.channel_url,
                "length": formatLength(result.length_seconds),
                "url": result.video_url,
                "publishedDate": publishedDate,
                "_id": result.video_id
            }
            let rejectGameACHO = "GAMEacho" !== result.author.name ? {"rejectCode": 5} : {}
            let rejectName = result.title.indexOf("BBCF") > 0 || result.title.indexOf("BLAZBLUE") > 0 ? {} : {"rejectCode": 3}
            return {...videoInfo, ...rejectGameACHO, ...rejectName, ...videoDB}
    
        } else {
            return {"rejectCode": 2}
        }
    }
    catch (err) {
        console.log(`Error during checkVideo() : ${err}`)
    }
}

// ms => hh:mm:ss
formatLength = (timeInSeconds) => {
    let seconds = timeInSeconds % 60
    let minutes = ((timeInSeconds - seconds) / 60) % 60
    let hours = (((timeInSeconds - seconds) / 60) - minutes) / 60
    let length = "";
    if (hours !== 0) {
        length += hours+"h"
    }
    if (hours !== 0 || minutes !== 0) {
        minutes = minutes < 10 ? "0"+minutes : minutes
        length += minutes+"mn"
    }
    seconds = seconds < 10 ? "0"+seconds : seconds
    length += seconds+"s"
    return length
}

// Unable to get the published date from ytdl-core
getPublishedDate = async (id) => {
    let result = "";
    const url = "https://www.googleapis.com/youtube/v3/videos?id="+id+"&key="+SECRET_KEY+"&part=snippet"

    try {
        let data = await fetch(url)
        let json = await data.json()
        if (json.items && json.items.length > 0) {
            result = json.items[0].snippet.publishedAt
        }
    }
    catch (err) {
        console.log(`Error during getPublishedDate() : ${err}`)
    }
    
    return result
}

// Retrieve video infos from DB, if present
getVideoFromDB = async (id) => {
    let result = {}
    let matches = []
    try {
        const video = await Video.findById(id)
        if (video) {
    
            if (video.status === "FINISHED") {
                matches = await Match.find({"idVideo": id })
            }
            result = {
                "rejectCode": 1,
                "matches": matches
            }
        }
    } 
    catch (err) {
        console.log(`Error during getVideoFromDB() : ${err}`)
    }
    
    return result
}

// Store video info in DB
addVideo = async (vid) => {
    let result = {}
    const video = {
        ...vid, 
        "status": "WAITING", 
        "addDate": "dateajout", 
        "dl": 0,
        "frameCounter": 0,
        "frameTotal": 0
    }
    try {
        await Video.create(video)
    } catch (err) {
        console.log(`error addvideo: ${err}`)
        video = {
            "error": `error addvideo: ${err}`
        }
    }
    
    return video
}

// Scheduler to browse last videos from GAMEacho and add them to DB to be parsed later
checkYoutubeChannelForNewVideos = async () => {

    const GAMEachoId = "UCCfnriDcUslGMUMX4Ctkyjg"
    let result = "";
    const url = "https://www.googleapis.com/youtube/v3/activities?channelId="+GAMEachoId+"&maxResults=25&key="+SECRET_KEY+"&part=snippet,contentDetails"

    try {
        let data = await fetch(url)
        let json = await data.json()
        
        if (json.items) {
    
            const vids = json.items.filter(activity => {
                return !!activity.contentDetails.upload && !!activity.contentDetails.upload.videoId
            })
    
            var results = await Promise.map(vids, async (video) => await checkVideo(video.contentDetails.upload.videoId));
            results
            .filter(video => !video.rejectCode)
            .forEach(video => addVideo(video))
    
        }
    }
    catch (err) {
        console.log(`Error during checkYoutubeChannelForNewVideos() : ${err}`)
    }

    return result
}


// Creation WebSocket.
io.on('connection', (socket) => {
    console.log('connexion ws')
    socket.on('message', (data) => {
        console.log(`message: ${data}`);
    });
    socket.on('disconnect', (data) => {
        console.log(`deconnexion ws: ${data}`);
    });
});

schedulerWs = async () => {
    if (Object.keys(io.sockets.sockets).length > 0) {
        try {
            const list = await Video.find({ status: { $ne: "FINISHED" }});
            const queued = list.map(videodb => {
                return {
                    "url": "https://www.youtube.com/watch?v="+videodb._id,
                    "title": videodb.title,
                    "dl": videodb.dl,
                    "addDate": videodb.addDate,
                    "parsing": videodb.parsing,
                    "publishedDate": videodb.publishedDate,
                    "length": videodb.length,
                    "channelName": videodb.channelName,
                    "channelUrl": videodb.channelUrl,
                    "status": videodb.status,
                    "thumbnail": videodb.thumbnail
                }
            })
            // Broadcast.
            io.emit('news', queued);
        } catch (err) {
            console.log("erreur scheduler: "+err);
        }
    } 
}

// Lancement du Job WS toutes les 10s.
cron.schedule('*/5 * * * * *', schedulerWs);
//cron.schedule('0 * * * * *', checkYoutubeChannelForNewVideos);


