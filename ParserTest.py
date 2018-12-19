import cv2
import os
import sys
from jsonmerge import merge

class ParserTest(object):
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


    def test(self):
        cam = cv2.VideoCapture(self.videoFolder + "gUsyr7s_G1o.mp4")
        frameTotal = cam.get(cv2.CAP_PROP_FRAME_COUNT)
        currentPercentageParsing = 0
        print(str(frameTotal) + " frames")
        width = cam.get(cv2.CAP_PROP_FRAME_WIDTH)
        height = cam.get(cv2.CAP_PROP_FRAME_HEIGHT)
        framerate = cam.get(cv2.CAP_PROP_FPS)
        # step is the number of check for 'Rebel 1' per second, at the end of each check, we jump step frame
        step = framerate / 5
        # lastUpdate is the last time parsing progress has been saved in DB
        lastUpdate = 0

        print("width:" + str(width) + " height:" + str(height) + " framerate=" + str(framerate))

        if height != 720:
            print("Uniquement 720p !!!")
            sys.exit()


        ''' threshold pour Canny '''
        canny_lower_threshold = 10
        canny_upper_threshold = 200
        rebel1 = cv2.imread(self.templateFolder + 'chiffre1_complet.png', 0)
        rebel1_canny = cv2.Canny(rebel1, canny_lower_threshold, canny_upper_threshold)

        cv2.imshow('image', rebel1_canny)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

        while True:
            ret, frame = cam.read()
            if frame is None:
                break

            timestamp = cam.get(cv2.CAP_PROP_POS_MSEC)

            #img = cv2.imread(frame[100:150, 200:250], cv2.IMREAD_GRAYSCALE)
            '''
            e_left_y1 = 255
            e_left_y2 = 322
            e_left_x1 = 537
            e_left_x2 = 553
            
            r_left_y1 = 255
            r_left_y2 = 322
            r_left_x1 = 453
            r_left_x2 = 470
            '''
            roi_rebel1 = frame[360:480, 610:670]
            roi_rebel1_gray = cv2.cvtColor(roi_rebel1, cv2.COLOR_BGR2GRAY)
            roi_rebel1_edged = cv2.Canny(roi_rebel1_gray, canny_lower_threshold, canny_upper_threshold)
            resultatRebel1 = cv2.matchTemplate(roi_rebel1_edged, rebel1_canny, cv2.TM_CCOEFF_NORMED)
            min_val, max_val_rebel1, min_loc, max_loc = cv2.minMaxLoc(resultatRebel1)

            print("max_val_rebel1:" + str(max_val_rebel1))
            cv2.imshow('image', frame[360:480, 610:670])
            cv2.waitKey(0)
            cv2.destroyAllWindows()

            '''
            if max_val_rebel1 >= 0.3 and max_val_rebel1 != 1:
                print("max_val_rebel1:" + str(max_val_rebel1))
                # on note minute/seconde
                secondes = round(timestamp / 1000, 0)
                resteSecondes = secondes % 60
                minutes = (secondes - resteSecondes) / 60
                resteMinutes = minutes % 60
                heures = (minutes - resteMinutes) / 60
                heures = str(heures)[:-2]
                resteMinutes = str(resteMinutes)[:-2]
                resteSecondes = str(resteSecondes)[:-2]
                print(heures+":"+resteMinutes+":"+resteSecondes)
                cv2.imshow('image', frame[253:324, 445:835])
                cv2.waitKey(0)
                cv2.destroyAllWindows()
            '''


    def parsevideo(self, id):
        matchFound = []
        print("Nouvelle video :"+id+".mp4")
        cam = cv2.VideoCapture(self.videoFolder + id + ".mp4")
        frameTotal = cam.get(cv2.CAP_PROP_FRAME_COUNT)
        currentPercentageParsing = 0
        print(str(frameTotal)+" frames")

        width = cam.get(cv2.CAP_PROP_FRAME_WIDTH)
        height = cam.get(cv2.CAP_PROP_FRAME_HEIGHT)
        framerate = cam.get(cv2.CAP_PROP_FPS)
        # step is the number of check for 'Rebel 1' per second, at the end of each check, we jump step frame
        step = 3
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
        # rebel
        x1rebel = 445
        x2rebel = 835
        y1rebel = 253
        y2rebel = 324
        # chiffre 1 et 2
        x1chiffre = int(width*.43)
        x2chiffre = int(width*.52)
        y1chiffre = int(height*.45)
        y2chiffre = int(height*.72)
        # chiffre 1 360:480, 610:670
        x1chiffre1 = 610
        x2chiffre1 = 670
        y1chiffre1 = 360
        y2chiffre1 = 480

        ''' threshold pour Canny '''
        canny_lower_threshold = 10
        canny_upper_threshold = 200

        ''' thresholds pour le max_val d'une comparaison Canny '''
        threshold_rebel = 0.22
        threshold_chiffre1 = 0.15

        rebel = cv2.imread(self.templateFolder+'REBEL.png', 0)
        rebel_canny = cv2.Canny(rebel, canny_lower_threshold, canny_upper_threshold)

        # les chiffres
        chiffre1_gray = cv2.imread(self.templateFolder+'chiffre1_complet.png', 0)
        chiffre1_edged = cv2.Canny(chiffre1_gray, canny_lower_threshold, canny_upper_threshold)
        #chiffre2_gray = cv2.imread(self.templateFolder+'2.png', 0)
        #chiffre2_edged = cv2.Canny(chiffre2_gray, canny_lower_threshold, canny_upper_threshold)

        # gestion template personnages
        mapTemplate = []
        if height == 720:
            for filename in os.listdir(self.characterFolder):
                template = cv2.imread(self.characterFolder+filename,0)
                mapTemplate.append([filename[:-8], template])

        while True:
            ret,frame = cam.read()
            if frame is None:
                break
            framenb = cam.get(cv2.CAP_PROP_POS_FRAMES)
            timestamp = cam.get(cv2.CAP_PROP_POS_MSEC)

            roi_rebel = frame[y1rebel:y2rebel, x1rebel:x2rebel]
            roi_rebel_gray = cv2.cvtColor(roi_rebel, cv2.COLOR_BGR2GRAY)
            roi_rebel_edged = cv2.Canny(roi_rebel_gray, canny_lower_threshold, canny_upper_threshold)
            resultatRebel = cv2.matchTemplate(roi_rebel_edged, rebel_canny, cv2.TM_CCOEFF_NORMED)
            min_val, max_val_rebel, min_loc, max_loc = cv2.minMaxLoc(resultatRebel)

            if max_val_rebel >= threshold_rebel and max_val_rebel != 1:

                # on note minute/seconde
                secondes = round(timestamp / 1000, 0)
                resteSecondes = secondes % 60
                minutes = (secondes - resteSecondes) / 60
                resteMinutes = minutes % 60
                heures = (minutes - resteMinutes) / 60
                heures = str(heures)[:-2]
                resteMinutes = str(resteMinutes)[:-2]
                resteSecondes = str(resteSecondes)[:-2]

                print(heures+":"+resteMinutes+":"+resteSecondes+"       "+str(max_val_rebel))
                #rebel detecte, on verifie que le chiffre est bien un 1

                # roi_chiffre1
                roi_chiffre = frame[y1chiffre:y2chiffre, x1chiffre:x2chiffre]
                roi_chiffre_gray = cv2.cvtColor(roi_chiffre, cv2.COLOR_BGR2GRAY)
                roi_chiffre_edged = cv2.Canny(roi_chiffre_gray, canny_lower_threshold, canny_upper_threshold)
                resultatChiffre1 = cv2.matchTemplate(roi_chiffre_edged, chiffre1_edged, cv2.TM_CCOEFF_NORMED)
                #resultatChiffre2 = cv2.matchTemplate(roi_chiffre_edged, chiffre2_edged, cv2.TM_CCOEFF_NORMED)
                min_val, max_val_chiffre1, min_loc, max_loc = cv2.minMaxLoc(resultatChiffre1)
                #min_val, max_val_chiffre2, min_loc, max_loc = cv2.minMaxLoc(resultatChiffre2)

                print(str(max_val_chiffre1))
                if max_val_chiffre1 > threshold_chiffre1:
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



                    # On ajoute 1s pour eviter de refaire le test avec la frame d'apres
                    cam.set(cv2.CAP_PROP_POS_FRAMES, framenb + framerate)
                    framenb = cam.get(cv2.CAP_PROP_POS_FRAMES)

                    # Add match
                    match = {
                        "hour": heures,
                        "minute": resteMinutes,
                        "second": resteSecondes,
                        "p1": nomP1,
                        "p2": nomP2
                    }
                    matchFound.append(match)
                    print("Rebel 1 : "+nomP1+" Vs "+nomP2+" => " + str(heures)+":"+str(resteMinutes)+":"+str(resteSecondes))

            # on avance de frame avec le step, 5 images analysees par seconde de video (perf)
            cam.set(cv2.CAP_PROP_POS_FRAMES, framenb + step)

        # update db


        print("fin parsing")
        print(matchFound)
        cam.release()
        cv2.destroyAllWindows()

        # on supprime la video


