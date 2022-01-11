//Importation express
const express = require('express');
const router = express.Router();
//Importation des controllers
const userControl = require('../controllers/user');

//Création des routes vers l'API
router.post('/signup', userControl.signup);
router.post('/login', userControl.login);


module.exports = router;