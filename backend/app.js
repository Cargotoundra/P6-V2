//Importation du module MongoDB
const mongoose = require('mongoose');
//Importation du module Express
const express = require('express');
const app = express();
const expressLimit = require('express-rate-limit');

//Importation de Helmet pour securiser les en têtes HTTP
const helmet = require('helmet');

//Importation de mongo sanitize pour empêcher l'injection d'opérateur MongoDB via les données user
const sanitize = require("express-mongo-sanitize");

const path = require('path');

//Importation du fichier .env pour masque les accès à MongoDB
require('dotenv').config();

//Importation des routes
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

//Connexion à MongoDB
mongoose.connect(process.env.BD_CODE,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

//Headers de connexion (pour permettre la communication entre deux adresses locales différentes)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

//limiter le nombre de requetes possibles
const limitExpress = expressLimit({
  //30 min
  windowMs: 30 * 60 * 1000,
  //Nombre max de requetes
  max: 100
});
app.use(limitExpress);

//limite le nombre de connexion par IP
const createAccountLimiter = expressLimit({
  //15 min
  windowMs: 15 * 60 * 1000,
  //Nombre max de requete dans le temps au dessus
  max: 15
});

//Mise en place helmet
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

//Supprime l'entete utilisé par Express
//app.disable("x-powered-by")

app.use(express.json());
app.use(sanitize());

//Rends le fichier images statiques
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/auth',createAccountLimiter, userRoutes);
app.use('/api/sauces', sauceRoutes);

module.exports = app ;