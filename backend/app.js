//Importation du module MongoDB
const mongoose = require('mongoose');
//Importation du module Express
const express = require('express');
const app = express();
const expressLimit = require('express-rate-limit');

//Importation de Helmet pour protection OWASP
const helmet = require('helmet');
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

//limiter le nombre de connexions possibles
const limitExpress = expressLimit({
  //30 min
  windowMs: 30 * 60 * 1000,
  //Nombre max de requetes
  max: 20
});
app.use(limitExpress);

//limite le nombre de connexion par IP
const createAccountLimiter = expressLimit({
  //15 min
  windowMs: 15 * 60 * 1000,
  //Nombre max de requete dans le temps au dessus
  max: 5
});

app.use(express.json());

//Rends le fichier images statiques
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

module.exports = app ;