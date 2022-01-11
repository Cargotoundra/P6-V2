//Importation express
const express = require('express');
const router = express.Router();
//Importation des controllers
const userControl = require('../controllers/user');

//Route lors de l'inscription
router.post('/signup', userControl.signup);
router.post('/login', userControl.login);


module.exports = router;