import cv2
import os
import sys
from jsonmerge import merge

class Parser(object):
    mongodb = ""
    videoFolder = ""
    characterFolder = ""
    templateFolder = ""

    # The class "constructor" - It's actually an initializer
    def __init__(self, mongodb, videoFolder, characterFolder, templateFolder):
        self.mongodb = mongodb
        self.videoFolder = videoFolder
        self.characterFolder = characterFolder
        self.templateFolder = templateFolder
        width = 1280
        height = 720
        # p1
        self.x1p1 = int(width * 0)
        self.x2p1 = int(width * .12)
        self.y1p1 = int(height * 0)
        self.y2p1 = int(height * .2)
        # p2
        self.x1p2 = int(width * .88)
        self.x2p2 = int(width * 1)
        self.y1p2 = int(height * 0)
        self.y2p2 = int(height * .2)
        # rebel
        self.x1rebel = 445
        self. x2rebel = 835
        self.y1rebel = 253
        self.y2rebel = 324

        self.x1chiffre = int(width * .43)
        self.x2chiffre = int(width * .52)
        self.y1chiffre = int(height * .45)
        self.y2chiffre = int(height * .72)

        ''' threshold pour Canny '''
        self.canny_lower_threshold = 10
        self.canny_upper_threshold = 200

        ''' thresholds pour le max_val d'une comparaison Canny '''
        #self.threshold_rebel = 0.22
        self.threshold_rebel = 0.18
        #self.threshold_chiffre1 = 0.15
        self.threshold_chiffre1 = 0.1


    def setupParsing(self, id):
        self.matchFound = []
        self.cam = cv2.VideoCapture(self.videoFolder + id + ".mp4")
        self.frameTotal = self.cam.get(cv2.CAP_PROP_FRAME_COUNT)

        print(str(self.frameTotal) + " frames")
        self.mongodb.db.videos.update_one({
            "_id": id
        }, {
            "$set": {
                "status": "PARSING"
            }})

        width = self.cam.get(cv2.CAP_PROP_FRAME_WIDTH)
        height = self.cam.get(cv2.CAP_PROP_FRAME_HEIGHT)
        self.framerate = self.cam.get(cv2.CAP_PROP_FPS)
        # step is the number of check for 'Rebel 1' per second, at the end of each check, we jump step frame
        self.step = 3
        # lastUpdate is the last time parsing progress has been saved in DB
        lastUpdate = 0

        print("width:" + str(width) + " height:" + str(height) + " framerate=" + str(self.framerate))

        if height != 720:
            print("Uniquement 720p !!!")
            sys.exit()

        ''' pixels pour la selection de roi dans chaque image'''


        rebel = cv2.imread(self.templateFolder + 'REBEL.png', 0)
        self.rebel_canny = cv2.Canny(rebel, self.canny_lower_threshold, self.canny_upper_threshold)

        # les chiffres
        chiffre1_gray = cv2.imread(self.templateFolder + 'chiffre1_complet.png', 0)
        self.chiffre1_edged = cv2.Canny(chiffre1_gray, self.canny_lower_threshold, self.canny_upper_threshold)

        # gestion template personnages
        self.mapTemplate = []
        if height == 720:
            for filename in os.listdir(self.characterFolder):
                template = cv2.imread(self.characterFolder + filename, 0)
                self.mapTemplate.append([filename[:-8], template])



    def parsevideo(self, id):
        print("Nouvelle video :" + id + ".mp4")

        self.setupParsing(id)

        currentPercentageParsing = 0

        #cam.set(cv2.CAP_PROP_POS_FRAMES, framenb + step)
        while True:
            ret,frame = self.cam.read()
            if frame is None:
                break
            framenb = self.cam.get(cv2.CAP_PROP_POS_FRAMES)
            timestamp = self.cam.get(cv2.CAP_PROP_POS_MSEC)

            percent = (100 * framenb) // self.frameTotal
            if percent > currentPercentageParsing:
                currentPercentageParsing = percent
                self.mongodb.db.videos.update_one({
                    "_id": id
                }, {
                    "$set": {
                        "parsing": currentPercentageParsing
                    }})

            roi_rebel = frame[self.y1rebel:self.y2rebel, self.x1rebel:self.x2rebel]
            roi_rebel_gray = cv2.cvtColor(roi_rebel, cv2.COLOR_BGR2GRAY)
            roi_rebel_edged = cv2.Canny(roi_rebel_gray, self.canny_lower_threshold, self.canny_upper_threshold)
            resultatRebel = cv2.matchTemplate(roi_rebel_edged, self.rebel_canny, cv2.TM_CCOEFF_NORMED)
            min_val, max_val_rebel, min_loc, max_loc = cv2.minMaxLoc(resultatRebel)

            if max_val_rebel >= self.threshold_rebel:
                #rebel1 detecte, on verifie que le chiffre est bien un 1

                # roi_chiffre1
                roi_chiffre = frame[self.y1chiffre:self.y2chiffre, self.x1chiffre:self.x2chiffre]
                roi_chiffre_gray = cv2.cvtColor(roi_chiffre, cv2.COLOR_BGR2GRAY)
                roi_chiffre_edged = cv2.Canny(roi_chiffre_gray, self.canny_lower_threshold, self.canny_upper_threshold)
                resultatChiffre1 = cv2.matchTemplate(roi_chiffre_edged, self.chiffre1_edged, cv2.TM_CCOEFF_NORMED)
                min_val, max_val_chiffre1, min_loc, max_loc = cv2.minMaxLoc(resultatChiffre1)

                if max_val_chiffre1 > self.threshold_chiffre1:
                    # REBEL 1 confirme : nouveau match

                    # on verifie les persos en haut a droite et a gauche
                    imgGrayP1 = cv2.cvtColor(frame[self.y1p1:self.y2p1, self.x1p1:self.x2p1], cv2.COLOR_BGR2GRAY)
                    imgGrayP2 = cv2.cvtColor(frame[self.y1p2:self.y2p2, self.x1p2:self.x2p2], cv2.COLOR_BGR2GRAY)

                    #on compare les portraits P1 et P2 avec tous les templates
                    maxMatchP1 = 0
                    nomP1 = '?'
                    maxMatchP2 = 0
                    nomP2 = '?'
                    for couple in self.mapTemplate:
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
                    resteMinutes = minutes % 60
                    heures = (minutes - resteMinutes) / 60
                    heures = str(heures)[:-2]
                    resteMinutes = str(resteMinutes)[:-2]
                    resteSecondes = str(resteSecondes)[:-2]

                    # On ajoute 1s pour eviter de refaire le test avec la frame d'apres
                    self.cam.set(cv2.CAP_PROP_POS_FRAMES, framenb + self.framerate)
                    framenb = self.cam.get(cv2.CAP_PROP_POS_FRAMES)

                    # Add match
                    match = {
                        "hour": heures,
                        "minute": resteMinutes,
                        "second": resteSecondes,
                        "p1": nomP1,
                        "p2": nomP2
                    }
                    self.matchFound.append(match)
                    print("Rebel 1 : "+nomP1+" Vs "+nomP2+" => " + str(heures)+":"+str(resteMinutes)+":"+str(resteSecondes))

            # on avance de frame avec le step, 5 images analysees par seconde de video (perf)
            self.cam.set(cv2.CAP_PROP_POS_FRAMES, framenb + self.step)

        # update db
        self.mongodb.db.videos.update_one({
            "_id": id
        }, {
            "$set": {
                "parsing": 100,
                "status": "FINISHED"
        }})

        for match in self.matchFound:
            matchDb = merge({"idVideo": id}, match)
            self.mongodb.db.matches.insert_one(matchDb)

        print("fin parsing")
        print(self.matchFound)
        self.cam.release()
        cv2.destroyAllWindows()

        # on supprime la video
        os.remove(self.videoFolder + id + ".mp4")

