from __future__ import division
from flask import Flask
from apscheduler.schedulers.background import BackgroundScheduler
from pytube import YouTube
import time
import datetime
from flask_pymongo import PyMongo
import pymongo
import pprint
import logging
import cv2
import numpy as np
import os
import sys
from Downloader import Downloader
from Parser import Parser


#https://www.youtube.com/watch?v=u3DVs2XS50A   messenger
    #https://www.youtube.com/watch?v=60WNEb6dHsM   acho

app = Flask(__name__)

filesize = 0
currentDownloadPercentage = 0
idVideo = ""


#logger
log = logging.getLogger('apscheduler.executors.default')
log2 = logging.getLogger('apscheduler.scheduler')
log.setLevel(logging.DEBUG)  # DEBUG
log2.setLevel(logging.DEBUG)  # DEBUG

fmt = logging.Formatter('%(levelname)s:%(name)s:%(message)s')
h = logging.StreamHandler()
h.setFormatter(fmt)
log.addHandler(h)
log2.addHandler(h)

#mongodb
app.config["MONGO_URI"] = "mongodb://localhost:27017/matchparserdb"
mongo = PyMongo(app)

downloader = Downloader(mongo)
parser = Parser(mongo)


now = datetime.datetime.now()


tt = True
compteur = 0

def work():
    print("work")

    # si il y a des video a traiter
    id = getNextVideoId()
    while id != "":
        print("new video to downlaod:"+id)
        downloader.downloadVideo(id)
        parser.parsevideo(id)
        id = getNextVideoId()
        id = ""

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
    scheduler = BackgroundScheduler()

    scheduler.add_job(work, 'interval', seconds=10, misfire_grace_time=None)
    scheduler.start()

app.run()
