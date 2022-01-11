const multer = require("multer");
//Permet de remplacer les .XXX des fichiers
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

//On crée le fichier de stockage et la destination
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  //On remplace les " " par des "_" et on rajoute la datedujour pour avoir un nom unique
  filename: (req, file, callback) => {
  const name = file.originalname.split(' ').join('_');
  const extension = MIME_TYPES[file.mimetype];
  //On renomme le fichier d'origine
  callback(null, name + Date.now() + '.' + extension);
}
});

module.exports = multer({ storage }).single("image");