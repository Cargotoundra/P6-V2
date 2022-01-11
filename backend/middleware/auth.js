//On importe le package jsonwebtoken
const jsonWebToken = require ('jsonwebtoken');
//On importe le fichier local .env
require('dotenv').config();

// On exporte le module token
module.exports = (req, res, next) => {
    try {
        //On récupère le module dans le header et l'index 1 du tableau
        const token = req.headers.authorization.split(' ')[1];
        //On décode le toten avec la clefs
        const decodedToken = jsonWebToken.verify(token, process.env.TOKEN);
        //On récupère l'ID depuis le token décodé
        const userId = decodedToken.userId;
        req.auth = {userId};
        //Si l'id décodé != que l'ID de l'user alors erreur
        if (req.body.userId && req.body.userId !== userId) {
            //SI non on renvoi une erreur
            throw "ID non valide";
          } else {
            // si ok alors on passe à la route
            next();
          }
        } catch (error) {
          console.log("erreur d'authentification", error);
          //On renvoi un problème d'authentification
          res.status(401).json({ error: error | "Requête non authentifiée" });
        }
    };