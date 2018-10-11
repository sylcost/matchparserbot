from __future__ import division
from flask import Flask, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
from flask_pymongo import PyMongo
import pymongo
import logging
from Downloader import Downloader
from Parser import Parser
import ConfigParser
import sys
import datetime
import os


#https://www.youtube.com/watch?v=u3DVs2XS50A   messenger
    #https://www.youtube.com/watch?v=60WNEb6dHsM   acho

app = Flask(__name__)
scheduler = None

# init log levels
logLevels = {"DEBUG":10, "INFO":20, "WARNING":30, "ERROR":40,"CRITICAL":50}

# read conf
Config = ConfigParser.ConfigParser()
Config.read("conf.ini")

''' check if conf is valid '''
try:
    # get mongo conf
    if Config.get('DB', 'mongoHost') == "" or Config.get('DB', 'mongoPort') == "" or Config.get('DB', 'mongoDbName') == "":
        print("please configure mongo connection in conf.ini")
        sys.exit()
    # check conf parser
    if Config.get('PARSER', 'videoFolder') == "" or Config.get('PARSER', 'characterFolder') == "" or Config.get('PARSER', 'templateFolder') == "":
        print("please configure work folders for the parser in conf.ini")
        sys.exit()
    if not os.path.isdir(Config.get('PARSER', 'videoFolder')) or not os.path.isdir(Config.get('PARSER', 'characterFolder')) or not os.path.isdir(Config.get('PARSER', 'templateFolder')):
        print("please configure acual folders for the parser in conf.ini")
        sys.exit()
    # get log level from conf if specified
    level = Config.get('LOG', 'level')

except Exception as e:
    print("Error reading conf: "+str(e))
    sys.exit()

# loggers
log = logging.getLogger('apscheduler.executors.default')
log2 = logging.getLogger('apscheduler.scheduler')
log.setLevel(level)
log2.setLevel(level)
fmt = logging.Formatter('%(levelname)s:%(name)s:%(message)s')
h = logging.StreamHandler()
h.setFormatter(fmt)
log.addHandler(h)
log2.addHandler(h)

#mongodb
app.config["MONGO_URI"] = "mongodb://"+Config.get('DB', 'mongoHost')+":"+Config.get('DB', 'mongoPort')+"/"+Config.get('DB', 'mongoDbName')
mongo = PyMongo(app)



# objects doing the work
downloader = Downloader(mongo, Config.get('PARSER', 'videoFolder'))
parser = Parser(mongo, Config.get('PARSER', 'videoFolder'), Config.get('PARSER', 'characterFolder'), Config.get('PARSER', 'templateFolder'))

# fire the main job
@app.route('/firemainjob')
def index():
    print("fire scheduler")
    scheduler.get_job("mainJob").modify(next_run_time=datetime.datetime.now())
    return jsonify({"fire": "ok"})


# Launched  by scheduler
# Get next video to DL from DB
# Download it then parse it
# Repeat
def work():
    print("work")

    # si il y a des video a traiter
    id = getNextVideoId()
    while id != "":
        print("new video to downlaod:"+id)
        downloader.downloadVideo(id)
        parser.parsevideo(id)
        id = getNextVideoId()

    print("fin work")

# get the next video id to download
def getNextVideoId():
    print("getnextvideo")
    id = ""
    result = mongo.db.videos.find({"status": "WAITING"}).sort("addDate", pymongo.ASCENDING)
    print(result.count())
    if result.count() > 0:
        id = result[0]["_id"]
    print("_id:"+id)
    return id

# In case the process has been shutdown during download or parsing, set video to redo the interrupted process
def correctDB():
    print("correct DB")

    mongo.db.videos.update({
        "status": "DOWNLOADING"
    }, {
        "$set": {
            "status": "WAITING",
            "dl": 0
    }})
    mongo.db.videos.update({
        "status": "PARSING"
    }, {
        "$set": {
            "status": "DOWNLOADED",
            "frameCounter": 0
     }})


if __name__ == '__main__':
    scheduler = BackgroundScheduler()
    correctDB()

    scheduler.add_job(work, 'interval', hours=24, id="mainJob", misfire_grace_time=None)
    scheduler.start()

app.run()