
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
    matches: types.optional(types.array(Match), [])
})

const MainPage = types.model("MainPage", {
    url: types.optional(types.string, ""),
    checkingVideo: types.optional(types.boolean, false),
    addingVideo: types.optional(types.boolean, false),
    videoChecked: types.optional(VideoChecked, {})
});

const Store = types.model("Store", {
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
    async changeUrl(url) {
        
        applySnapshot(self.mainPage.videoChecked, {})
        self.mainPage.url = url.target.value
        
        if (self.mainPage.url.length > 6) {
            let fetchUrl = self.mainPage.url
            let indexMin = self.mainPage.url.indexOf("watch?v=") > 0 ? self.mainPage.url.indexOf("watch?v=") + 8 : 0
            let indexMax = self.mainPage.url.indexOf("&") > 0 ? self.mainPage.url.indexOf("&") : self.mainPage.url.length
            fetchUrl = self.mainPage.url.substring(indexMin, indexMax)
            console.log("fetchUrl:"+fetchUrl)

            // affichage du svg d'attente
            self.mainPage.checkingVideo = true

            try {
                let data = await fetch("http://localhost:3000/checkvideo/"+fetchUrl, {mode: "cors"})
                let json = await data.json()
    
                store.setVideosInfos(json)
                store.setCheckingVideo(false)
            }
            catch (e) {
                console.log("Error during the retrieve of video info: "+e)
            }
            
        } else {
            self.mainPage.checkingVideo = false
        }
    },
    setVideosInfos(json) {

        applySnapshot(self.mainPage.videoChecked, json)

        switch(json.rejectCode) {
            case 1:
                self.mainPage.videoChecked.rejectReason = "Video has already been parsed."
                break;
            case 2:
                self.mainPage.videoChecked.rejectReason = "Video not found."
                break;
            case 3:
                self.mainPage.videoChecked.rejectReason = "Video title must contain 'BBCF' or 'BLAZBLUE CONTRALFICTION'."
                break;
            case 4:
                self.mainPage.videoChecked.rejectReason = "No 720p available for this video."
                break;
            case 5:
                self.mainPage.videoChecked.rejectReason = "Must be from GAMEacho channel."
                break;
            case 6:
                self.mainPage.videoChecked.rejectReason = "Video is queued, it will be parsed as soon as possible."
                break;
            default:
                self.mainPage.videoChecked.rejectReason = ""
        }
    },
    setCheckingVideo(checkingVideo) {
        self.mainPage.checkingVideo = checkingVideo
    },
    setAddingVideo(addingVideo) {
        self.mainPage.addingVideo = addingVideo
    },
    async addVideo() {
        let fetchUrl = self.mainPage.url
        let indexMin = self.mainPage.url.indexOf("watch?v=") > 0 ? self.mainPage.url.indexOf("watch?v=") + 8 : 0
        let indexMax = self.mainPage.url.indexOf("&") > 0 ? self.mainPage.url.indexOf("&") : self.mainPage.url.length
        fetchUrl = self.mainPage.url.substring(indexMin, indexMax)
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
const mp = MainPage.create();


const store = Store.create({
    currentProcessing: cp,
    mainPage: mp
});

export default store;
