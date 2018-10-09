from pytube import YouTube

class Downloader(object):
    mongodb = ""
    idVideo = ""
    filesize = 0
    currentPercentage = 0

    # The class "constructor" - It's actually an initializer
    def __init__(self, mongodb):
        self.mongodb = mongodb
        self.idVideo = ""
        self.filesize = 0
        self.currentPercentage = 0

    # on_progress_callback takes 4 parameters.
    def dlProgress(self, stream=None, chunk=None, file_handle=None, remaining=None):
        print("filesize="+str(self.filesize)+" remaining="+str(remaining))
        if remaining != None:
            percent = (100 * (self.filesize - remaining)) // self.filesize

            if percent > self.currentPercentage:
                self.currentPercentage = percent
                print(self.currentPercentage)
                self.mongodb.db.videos.update({
                    "_id": self.idVideo
                }, {
                    "$set": {
                        "dl": percent
                    }})

    def downloadVideo(self, id):
        print("downloadVideo:" + id)
        self.idVideo = id
        yt = YouTube("https://www.youtube.com/watch?v=" + id, on_progress_callback=self.dlProgress)
        vid = yt.streams.filter(resolution='720p').first()
        self.filesize = vid.filesize
        self.mongodb.db.videos.update({
            "_id": id
        }, {
            "$set": {
                "status": "DOWNLOADING"
            }})
        vid.download("E:/Dev/videos", id)
        self.mongodb.db.videos.update({
            "_id": id
        }, {
            "$set": {
                "status": "DOWNLOADED"
            }})
        print("fin download")