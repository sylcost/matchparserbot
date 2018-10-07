
import { types } from "mobx-state-tree";

const Bullshit = types.model("Bullshit", {
    id: types.optional(types.number, 0)
});

const Video = types.model("Video", {
    url: types.optional(types.string, ""),
    title: types.optional(types.string, ""),
    addDate: types.optional(types.string, ""),
    dl: types.optional(types.number, 0),
    frameTotal: types.optional(types.number, 0),
    frameCounter: types.optional(types.number, 0),
    publishedDate: types.optional(types.string, ""),
    length: types.optional(types.string, ""),
    channelUrl: types.optional(types.string, ""),
    channelName: types.optional(types.string, ""),
    thumbnail: types.optional(types.string, ""),
    status: types.optional(types.string, "")
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
    parsedVideoResult: types.optional(types.string, "")
})

const MainPage = types.model("MainPage", {
    url: types.optional(types.string, ""),
    checkingVideo: types.optional(types.boolean, false),
    videoChecked: types.optional(VideoChecked, {})
});

const Store = types.model("Store", {
  bullshit: Bullshit,
  currentProcessing: CurrentProcessing,
  mainPage: MainPage
}).actions((self) => ({
    init() {
        // Appels REST pour le currentProcessing stuff
        fetch("http://localhost:5000/init")
        .then(data => data.json())
        .then(json => store.setCurrentProcessing(json))
        .catch(e => console.log("error during init:"+e))
    },
    setCurrentProcessing(json) {
        //cvs
    },
    changeUrl(url) {
        
        self.mainPage.url = url.target.value
        self.mainPage.videoChecked.url = ""
        self.mainPage.videoChecked.thumbnail = ""
        self.mainPage.videoChecked.title = ""
        self.mainPage.videoChecked.channelName = ""
        self.mainPage.videoChecked.channelUrl = ""
        self.mainPage.videoChecked.length = ""
        self.mainPage.videoChecked.rejectReason = ""
        self.mainPage.videoChecked.status = ""
        
        if (self.mainPage.url.length > 6) {
            let fetchUrl = self.mainPage.url
            let indexMin = self.mainPage.url.indexOf("watch?v=") > 0 ? self.mainPage.url.indexOf("watch?v=") + 8 : 0
            let indexMax = self.mainPage.url.indexOf("&") > 0 ? self.mainPage.url.indexOf("&") : self.mainPage.url.length
            fetchUrl = self.mainPage.url.substring(indexMin, indexMax)
            console.log("fetchUrl:"+fetchUrl)

            // affichage du svg d'attente
            self.mainPage.checkingVideo = true
            //self.mainPage.thumbnailUrl = "25.svg"

            fetch("http://localhost:3000/checkvideo/"+fetchUrl, {mode: "cors"})
            .then(data => {
                console.log("data:"+data)
                return data.json()
            })
            .then(json => {
                console.log(json)
                store.setVideosInfos(json)
                store.setCheckingVideo(false)
                
            })
            .catch(e => console.log("Error during the retrieve of video info"))

        } else {
            self.mainPage.checkingVideo = false
        }
    },
    setVideosInfos(json) {

        switch(json.rejectCode) {
            case 1:
                self.mainPage.videoChecked.rejectReason = "Video has already been parsed"
                break;
            case 2:
                self.mainPage.videoChecked.rejectReason = "Video not found"
                break;
            case 3:
                self.mainPage.videoChecked.rejectReason = "Video title must contain 'BBCF' or 'BLAZBLUE CONTRALFICTION'"
                break;
            case 4:
                self.mainPage.videoChecked.rejectReason = "No 720p available for this video"
                break;
            case 5:
                self.mainPage.videoChecked.rejectReason = "Must be from GAMEacho channel"
                break;
            default:
                self.mainPage.videoChecked.rejectReason = ""
        }
        self.mainPage.videoChecked.url = json.url
        self.mainPage.videoChecked.thumbnail = json.thumbnail
        self.mainPage.videoChecked.title = json.title
        self.mainPage.videoChecked.channelName = json.channelName
        self.mainPage.videoChecked.channelUrl = json.channelUrl
        self.mainPage.videoChecked.length = json.length
        self.mainPage.videoChecked.publishedDate = json.publishedDate
        self.mainPage.videoChecked.status = json.status
    },
    setCheckingVideo(checkingVideo) {
        self.mainPage.checkingVideo = checkingVideo
    },
    parseVideo() {
        let fetchUrl = self.mainPage.url
        let indexMin = self.mainPage.url.indexOf("watch?v=") > 0 ? self.mainPage.url.indexOf("watch?v=") + 8 : 0
        let indexMax = self.mainPage.url.indexOf("&") > 0 ? self.mainPage.url.indexOf("&") : self.mainPage.url.length
        fetchUrl = self.mainPage.url.substring(indexMin, indexMax)
        console.log("parseUrl:"+fetchUrl)

        fetch('http://localhost:3000/parsevideo/'+fetchUrl, {mode: 'cors'})
        .catch(e => console.log("Error during the parsing of video info :"+e))
        console.log('parsevideo ok')
    }

})).views((self) => ({

}));

const bs = Bullshit.create();
const cp = CurrentProcessing.create();
const mp = MainPage.create();


// const store = Store.create({
//     bullshit: bs,
//     currentProcessing: cp,
//     mainPage: mp
// });

const store = Store.create({
    bullshit: bs,
    currentProcessing: {
        processing: {
            video: {
                url: "abcdef",
                title: "titre 1",
                addDate: "10/09/2018"
            },
            dl: 50,
            parsing: 25
        }
        // ,
        // queued: [
        //     {
        //         url: "queued1",
        //         title: "title queued1"
        //     }, {
        //         url: "queued2",
        //         title: "title q2"
        //     }, {
        //         url: "queued333",
        //         title: "title queued33"
        //     }
        // ]
    },
    mainPage: mp
});

export default store;
