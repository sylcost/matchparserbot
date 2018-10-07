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


#https://www.youtube.com/watch?v=u3DVs2XS50A   messenger
    #https://www.youtube.com/watch?v=60WNEb6dHsM   acho

app = Flask(__name__)

filesize = 0
currentDownloadPercentage = 0
idVideo = ""


#logger
log = logging.getLogger('apscheduler.executors.default')
log.setLevel(logging.INFO)  # DEBUG

fmt = logging.Formatter('%(levelname)s:%(name)s:%(message)s')
h = logging.StreamHandler()
h.setFormatter(fmt)
log.addHandler(h)

#mongodb
app.config["MONGO_URI"] = "mongodb://localhost:27017/matchparserdb"
mongo = PyMongo(app)


now = datetime.datetime.now()


tt = True
compteur = 0

def work():
    print("work")

    # verifier et ajouter les nouvelles video gameacho

    # si il y a des video a traiter
    url = getNextVideoUrl()
    while url != "":
        print("new video to downlaod:"+url)
        downloadVideo(url)
        parsevideo("video.mp4")
        url = getNextVideoUrl()
        url = ""

    print("fin work")

def downloadVideo(url):
    print("downloadVideo")
    global filesize, idVideo
    idVideo = url
    yt = YouTube("https://www.youtube.com/watch?v="+url, on_progress_callback=progress_Check)
    vid = yt.streams.filter(resolution='720p').first()
    filesize = vid.filesize
    mongo.db.videos.update({
        "_id": url
    }, {
        "$set": {
            "status": "DOWNLOADING"
        }})
    vid.download("E:/Dev/videos", "video")
    print("fin download")


def getNextVideoUrl():
    print("getnextvideo")
    id = ""
    result = mongo.db.videos.find({"status": "WAITING"}).sort("addDate", pymongo.ASCENDING)
    print(result.count())
    if result.count() > 0:
        id = result[0]["_id"]
    print("_id:"+id)
    return id

# on_progress_callback takes 4 parameters.
def progress_Check(stream = None, chunk = None, file_handle = None, remaining = None):

    global currentDownloadPercentage
    percent = (100*(filesize-remaining))//filesize

    if percent > currentDownloadPercentage + 4:
        currentDownloadPercentage = percent
        print(currentDownloadPercentage)
        mongo.db.videos.update({
            "_id": idVideo
        }, {
            "$set": {
                "dl": percent
        }})


'''
    print("{:.2} downloaded".format(remaining/filesize))
    print(stream)
    #print(chunk)
    #print(file_handle)
    print(remaining)
    print(filesize)
    print(remaining/filesize)
'''


def parsevideo(filename):
    matchFound = []
    print("Nouvelle video :"+filename)
    dossierVideos = "E:/Dev/videos/"
    dossierCharacters720 = "E:/Dev/images/characters/"
    dossierTemplates = "E:/Dev/images/templates/"
    cam = cv2.VideoCapture(dossierVideos + filename)
    frameTotal = cam.get(cv2.CAP_PROP_FRAME_COUNT)
    print(str(frameTotal)+" frames")
    mongo.db.videos.update({
        "_id": idVideo
    }, {
        "$set": {
            "frameTotal": frameTotal,
            "status": "PARSING"
    }})

    width = cam.get(cv2.CAP_PROP_FRAME_WIDTH)
    height = cam.get(cv2.CAP_PROP_FRAME_HEIGHT)
    framerate = cam.get(cv2.CAP_PROP_FPS)
    # step is the number of check for 'Rebel 1' per second, at the end of each check, we jump step frame
    step = framerate / 5
    #lastUpdate is the last time parsing progress has been saved in DB
    lastUpdate = 0


    print("width:"+str(width)+" height:"+str(height)+" framerate="+str(framerate))

    if height != 720:
        print("Uniquement 720p !!!")
        sys.exit()

    ''' pixels pour la selection de roi dans chaque image'''
    # p1
    x1p1 = int(width*0)
    x2p1 = int(width*.12)
    y1p1 = int(height*0)
    y2p1 = int(height*.2)
    # p2
    x1p2 = int(width*.88)
    x2p2 = int(width*1)
    y1p2 = int(height*0)
    y2p2 = int(height*.2)
    # rebel1
    x1rebel1 = int(width*.33)
    x2rebel1 = int(width*.66)
    y1rebel1 = int(height*.28)
    y2rebel1 = int(height*.72)
    # chiffre 1 et 2
    x1chiffre = int(width*.43)
    x2chiffre = int(width*.52)
    y1chiffre = int(height*.45)
    y2chiffre = int(height*.72)

    ''' threshold pour Canny '''
    canny_lower_threshold = 10
    canny_upper_threshold = 200

    ''' thresholds pour le max_val d'une comparaison Canny '''
    threshold_rebel1 = 0.1
    threshold_chiffre1 = 0.15

    rebel1 = cv2.imread(dossierTemplates+'rebel1.png', 0)
    rebel1_canny = cv2.Canny(rebel1, canny_lower_threshold, canny_upper_threshold)

    # les chiffres
    chiffre1_gray = cv2.imread(dossierTemplates+'1.png', 0)
    chiffre1_edged = cv2.Canny(chiffre1_gray, canny_lower_threshold, canny_upper_threshold)
    chiffre2_gray = cv2.imread(dossierTemplates+'2.png', 0)
    chiffre2_edged = cv2.Canny(chiffre2_gray, canny_lower_threshold, canny_upper_threshold)

    # gestion template personnages
    mapTemplate = []
    if height == 720:
        for filename in os.listdir(dossierCharacters720):
            template = cv2.imread(dossierCharacters720+filename,0)
            mapTemplate.append([filename[:-8], template])

    while True:
        ret,frame = cam.read()
        if frame is None:
            break
        framenb = cam.get(cv2.CAP_PROP_POS_FRAMES)
        timestamp = cam.get(cv2.CAP_PROP_POS_MSEC)



        if round(timestamp / 1000, 0) > lastUpdate + 9:
            mongo.db.videos.update({
                "_id": idVideo
            }, {
                "$set": {
                    "frameCounter": framenb
            }})


        roi_rebel1 = frame[y1rebel1:y2rebel1, x1rebel1:x2rebel1]
        roi_rebel1_gray = cv2.cvtColor(roi_rebel1, cv2.COLOR_BGR2GRAY)
        roi_rebel1_edged = cv2.Canny(roi_rebel1_gray, canny_lower_threshold, canny_upper_threshold)
        resultatRebel1 = cv2.matchTemplate(roi_rebel1_edged, rebel1_canny, cv2.TM_CCOEFF_NORMED)
        min_val, max_val_rebel1, min_loc, max_loc = cv2.minMaxLoc(resultatRebel1)

        if max_val_rebel1 >= threshold_rebel1:
            #rebel1 detecte, on verifie que le chiffre est bien un 1

            # roi_chiffre1
            roi_chiffre = frame[y1chiffre:y2chiffre, x1chiffre:x2chiffre]
            roi_chiffre_gray = cv2.cvtColor(roi_chiffre, cv2.COLOR_BGR2GRAY)
            roi_chiffre_edged = cv2.Canny(roi_chiffre_gray, canny_lower_threshold, canny_upper_threshold)
            resultatChiffre1 = cv2.matchTemplate(roi_chiffre_edged, chiffre1_edged, cv2.TM_CCOEFF_NORMED)
            resultatChiffre2 = cv2.matchTemplate(roi_chiffre_edged, chiffre2_edged, cv2.TM_CCOEFF_NORMED)
            min_val, max_val_chiffre1, min_loc, max_loc = cv2.minMaxLoc(resultatChiffre1)
            min_val, max_val_chiffre2, min_loc, max_loc = cv2.minMaxLoc(resultatChiffre2)

            if max_val_chiffre1 > max_val_chiffre2 and max_val_chiffre1 > threshold_chiffre1:
                # REBEL 1 confirme : nouveau match

                # on verifie les persos en haut a droite et a gauche
                imgGrayP1 = cv2.cvtColor(frame[y1p1:y2p1, x1p1:x2p1], cv2.COLOR_BGR2GRAY)
                imgGrayP2 = cv2.cvtColor(frame[y1p2:y2p2, x1p2:x2p2], cv2.COLOR_BGR2GRAY)

                #on compare les portraits P1 et P2 avec tous les templates
                maxMatchP1 = 0
                nomP1 = '?'
                maxMatchP2 = 0
                nomP2 = '?'
                for couple in mapTemplate:
                    #P1
                    resultatP1 = cv2.matchTemplate(imgGrayP1, couple[1], cv2.TM_CCOEFF_NORMED)
                    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(resultatP1)
                    if max_val > maxMatchP1:
                        # meilleur match que l'actuel
                        maxMatchP1 = max_val
                        nomP1 = couple[0] if max_val > 0.6 else couple[0]+'?'

                    #P2
                    resultatP2 = cv2.matchTemplate(imgGrayP2, couple[1], cv2.TM_CCOEFF_NORMED)
                    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(resultatP2)
                    if max_val > maxMatchP2:
                        # meilleur match que l'actuel
                        maxMatchP2 = max_val
                        nomP2 = couple[0] if max_val > 0.6 else couple[0]+'?'

                # on note minute/seconde
                secondes = round(timestamp / 1000, 0)
                resteSecondes = secondes % 60
                minutes = (secondes - resteSecondes) / 60
                if resteSecondes < 10:
                    resteSecondes = "0" + str(resteSecondes)
                resteSecondes = str(resteSecondes)[:-2]
                ts = str(minutes)[:-2] + ":" + resteSecondes

                # On ajoute 1s pour eviter de refaire le test avec la frame d'apres
                cam.set(cv2.CAP_PROP_POS_FRAMES, framenb + framerate)
                framenb = cam.get(cv2.CAP_PROP_POS_FRAMES)
                matchFound.append(str(ts) + " " + nomP1+' vs '+nomP2)
                print("Rebel 1 : "+nomP1+" Vs "+nomP2+" :" + str(ts))

        # on avance de frame avec le step, 5 images analysees par seconde (perf)
        cam.set(cv2.CAP_PROP_POS_FRAMES, framenb + step)

    # update db
    mongo.db.videos.update({
        "_id": idVideo
    }, {
        "$set": {
            "frameCounter": frameTotal,
            "result": matchFound,
            "status": "FINISHED"
    }})

    print("fin parsing")
    print(matchFound)
    cam.release()
    cv2.destroyAllWindows()






if __name__ == '__main__':
    scheduler = BackgroundScheduler()

    scheduler.add_job(work, 'interval', seconds=10, misfire_grace_time=None)
    scheduler.start()

app.run()