from __future__ import division
from flask import Flask
from apscheduler.schedulers.background import BackgroundScheduler
from flask_pymongo import PyMongo
import pymongo
import logging
from Downloader import Downloader
from Parser import Parser
import ConfigParser
import sys
import datetime


#https://www.youtube.com/watch?v=u3DVs2XS50A   messenger
    #https://www.youtube.com/watch?v=60WNEb6dHsM   acho

app = Flask(__name__)
logLevels = {"DEBUG":10, "INFO":20, "WARNING":30, "ERROR":40,"CRITICAL":50}
level = logLevels["INFO"]

Config = ConfigParser.ConfigParser()
Config.read("conf.ini")
levelConf = Config.get('LOG', 'level')

if levelConf != None and logLevels[levelConf] != None:
    level = logLevels[levelConf]

print level
#logger
log = logging.getLogger('apscheduler.executors.default')
log2 = logging.getLogger('apscheduler.scheduler')
log.setLevel(level)
log2.setLevel(level)

fmt = logging.Formatter('%(levelname)s:%(name)s:%(message)s')
h = logging.StreamHandler()
h.setFormatter(fmt)
log.addHandler(h)
log2.addHandler(h)

if Config.get('DB', 'mongoHost') == "" or Config.get('DB', 'mongoPort') == "" or Config.get('DB', 'mongoDbName') == "":
    print("please configure mongo connection")
    sys.exit()

#mongodb
app.config["MONGO_URI"] = "mongodb://"+Config.get('DB', 'mongoHost')+":"+Config.get('DB', 'mongoPort')+"/"+Config.get('DB', 'mongoDbName')
mongo = PyMongo(app)

downloader = Downloader(mongo)
parser = Parser(mongo)

scheduler = None


@app.route('/firemainjob')
def index():
    print("fire scheduler")
    scheduler.get_job("mainJob").modify(next_run_time=datetime.now())

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


def getNextVideoId():
    print("getnextvideo")
    id = ""
    result = mongo.db.videos.find({"status": "WAITING"}).sort("addDate", pymongo.ASCENDING)
    print(result.count())
    if result.count() > 0:
        id = result[0]["_id"]
    print("_id:"+id)
    return id




if __name__ == '__main__':
    global scheduler
    scheduler = BackgroundScheduler()

    scheduler.add_job(work, 'interval', seconds=10, id="mainJob", misfire_grace_time=None)
    #scheduler.start()

app.run()