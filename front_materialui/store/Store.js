
import { types, applySnapshot } from "mobx-state-tree";


const Match = types.model("Match", {
    idVideo: types.optional(types.string, ""),
    p1: types.optional(types.string, ""),
    p2: types.optional(types.string, ""),
    hour: types.optional(types.string, ""),
    minute: types.optional(types.string, ""),
    second: types.optional(types.string, "")
})

const Video = types.model("Video", {
    url: types.optional(types.string, ""),
    title: types.optional(types.string, ""),
    addDate: types.optional(types.string, ""),
    dl: types.optional(types.number, 0),
    parsing: types.optional(types.number, 0),
    publishedDate: types.optional(types.string, ""),
    length: types.optional(types.string, ""),
    channelUrl: types.optional(types.string, ""),
    channelName: types.optional(types.string, ""),
    thumbnail: types.optional(types.string, ""),
    status: types.optional(types.string, ""),
    matches: types.optional(types.array(Match), [])
})

const CurrentProcessing = types.model("CurrentProcessing", {
    videos: types.array(Video)
});


const VideoChecked = types.model("VideoChecked", {
    url: types.optional(types.string, ""),
    title: types.optional(types.string, ""),
    length: types.optional(types.string, ""),
    channelUrl: types.optional(types.string, ""),
    channelName: types.optional(types.string, ""),
    thumbnail: types.optional(types.string, ""),
    rejectReason: types.optional(types.string, ""),
    rejectCode: types.optional(types.string, ""),
    matches: types.optional(types.array(Match), [])
})

const PageCheckVideo = types.model("PageCheckVideo", {
    url: types.optional(types.string, ""),
    checkingVideo: types.optional(types.boolean, false),
    addingVideo: types.optional(types.boolean, false),
    videoChecked: types.optional(VideoChecked, {})
});

const Store = types.model("Store", {
  currentProcessing: CurrentProcessing,
  pageCheckVideo: PageCheckVideo,
  page: types.optional(types.string, "checkvideo"),
}).actions((self) => ({
    init() {
        // Appels REST pour le currentProcessing stuff
        fetch("http://localhost:5000/init")
        .then(data => data.json())
        .then(json => store.setCurrentProcessing(json))
        .catch(e => console.log("error during init:"+e))
    },
    switchPage(page) {
        self.page=page
    },
    async changeUrl(url) {
        
        applySnapshot(self.pageCheckVideo.videoChecked, {})
        self.pageCheckVideo.url = url.target.value
        
        if (self.pageCheckVideo.url.length > 6) {
            let fetchUrl = self.pageCheckVideo.url
            let indexMin = self.pageCheckVideo.url.indexOf("watch?v=") > 0 ? self.pageCheckVideo.url.indexOf("watch?v=") + 8 : 0
            let indexMax = self.pageCheckVideo.url.indexOf("&") > 0 ? self.pageCheckVideo.url.indexOf("&") : self.pageCheckVideo.url.length
            fetchUrl = self.pageCheckVideo.url.substring(indexMin, indexMax)
            console.log("fetchUrl2:"+fetchUrl)

            // affichage du svg d'attente
            self.pageCheckVideo.checkingVideo = true

            try {
                let data = await fetch("http://localhost:3000/checkVideo/"+fetchUrl, {mode: "cors"})
                let json = await data.json()
    
                store.setVideosInfos(json)
                store.setCheckingVideo(false)
            }
            catch (e) {
                console.log("Error during the retrieve of video info: "+e)
            }
            
        } else {
            self.pageCheckVideo.checkingVideo = false
        }
    },
    setVideosInfos(json) {

        console.log(JSON.stringify(json))
        applySnapshot(self.pageCheckVideo.videoChecked, json)

        switch(json.rejectCode) {
            case 'FINISHED':
                self.pageCheckVideo.videoChecked.rejectReason = "Video has already been parsed."
                break;
            case 'NOTVALID':
                self.pageCheckVideo.videoChecked.rejectReason = "Video not found."
                break;
            case 'BADNAME':
                self.pageCheckVideo.videoChecked.rejectReason = "Video title must contain 'BBCF' or 'BLAZBLUE'."
                break;
            case 4:
                self.pageCheckVideo.videoChecked.rejectReason = "No 720p available for this video."
                break;
            case 'BADCHANNEL':
                self.pageCheckVideo.videoChecked.rejectReason = "Must be from GAMEacho channel."
                break;
            case 'QUEUED':
                self.pageCheckVideo.videoChecked.rejectReason = "Video is queued, it will be parsed as soon as possible."
                break;
            default:
                self.pageCheckVideo.videoChecked.rejectReason = ""
        }

        console.log('>>>>>>>>>>>'+JSON.stringify(self.pageCheckVideo.videoChecked))
    },
    setCheckingVideo(checkingVideo) {
        self.pageCheckVideo.checkingVideo = checkingVideo
    },
    setAddingVideo(addingVideo) {
        self.pageCheckVideo.addingVideo = addingVideo
    },
    async addVideo() {
        let fetchUrl = self.pageCheckVideo.url
        let indexMin = self.pageCheckVideo.url.indexOf("watch?v=") > 0 ? self.pageCheckVideo.url.indexOf("watch?v=") + 8 : 0
        let indexMax = self.pageCheckVideo.url.indexOf("&") > 0 ? self.pageCheckVideo.url.indexOf("&") : self.pageCheckVideo.url.length
        fetchUrl = self.pageCheckVideo.url.substring(indexMin, indexMax)
        console.log("parseUrl:"+fetchUrl)

        try {
            store.setAddingVideo(true)
            let data = await fetch('http://localhost:3000/addVideo/'+fetchUrl, {mode: 'cors'})
            let json = await data.json()
            store.setVideosInfos(json)
            store.setAddingVideo(false)
        }
        catch (err) {
            console.log("Error during the parsing of video info :"+err)
        }
        
        console.log('addvideo ok')
    }

})).views((self) => ({

}));

const cp = CurrentProcessing.create();
const pcv = PageCheckVideo.create();


const store = Store.create({
    currentProcessing: cp,
    pageCheckVideo: pcv
});

export default store;
