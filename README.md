# matchparserbot

Install PYTHON 2.7
`pip install opencv pytube pymongo`

Installation
 `npm install`

Lancer le front
 `npm start` 

Lancer le back (sans BDD)
 `node src/serveur/servNoBDD.js`
 
Lancer le back (avec BDD)
 `node src/serveur/serv.js`

Conf mysql necessaire : 
utilisateur `annuaire`
mdp `annuaire`
schema `sannuaire`
doit avoir les droits `CREATE DROP SELECT INSERT UPDATE DELETE` sur le schema `sannuaire`.
A modifier éventuellement dans src/serveur/serv.js (~ l.23)
 
 
Accès via `http://localhost:3000`
