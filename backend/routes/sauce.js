//On importe express et router
const express = require('express');
const router = express.Router();

//On importe les controllers et middleware
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const saucesControllers = require('../controllers/sauces');


//Création des routes vers l'API
router.get('/', auth, saucesControllers.getAll);
router.get('/:id', auth, saucesControllers.getOne);
router.post('/',auth, multer, saucesControllers.createSauce);
router.put('/:id', auth, multer, saucesControllers.modifySauce);
router.delete('/:id', auth, multer, saucesControllers.deleteSauce);
router.post('/:id/like', auth, multer, saucesControllers.likeAndDislike);

module.exports = router;