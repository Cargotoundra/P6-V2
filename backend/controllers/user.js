//importation du modèle user
const User = require('../models/users');

//importation du moduble bcryptjs et jsonwebtoken
const bcrypt = require('bcryptjs');
const jsonWebToken = require('jsonwebtoken');
//Permet d'accèder au fichier env
require('dotenv').config();


// fonction inscription d'un nouveau user
exports.signup = (req, res, next) => {
    //Si le mdp fait moins de 10 caractères on retourne un message d'erreur
    if (req.body.password.length <= 9)
    {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 10 caractères' });
    }
    //hachage du mdp, X fois
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        // création d'un nouvel objet USER et sauvegarde ds la BD
        const user = new User({
          email: req.body.email,
          password: hash, 
        });
        user.save()
          .then(() =>
            res.status(201).json({ message: "Utilisateur créé dans la base de donnée." })
          )
          .catch(
            (error) => res.status(400).json({ error })
            );
      })
      .catch(
        (error) => res.status(500).json({ error })
        );
  };


exports.login = (req, res, next) => {
  //On vérifie si l'email est déjà connu dans le BD
  User.findOne({ email: req.body.email })
    .then(user => 
    {
      console.log(user)
      //Si email non connu alors on renvoi une erreur
      if (!user) 
      {
        return res.status(401).json({ message: 'Aucun utilisateur connu' });
      }
    //Si email connu on compare les données renseignés par l'utilisateur
    bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            //Si non ok alors erreur
            if (!valid) {
              return res.status(401).json({ message: 'Mauvaises adresse email ou mot de passe' });
            }
            //Si non
            res.status(200).json(
            {
              userId: user._id,
              token: jsonWebToken.sign(
                //On transmet les données à encoder et la clef secrete
                { userId: user._id },
                process.env.TOKEN,
                { expiresIn: '24h' }
              )
            });
          })
        .catch(
          (error) => res.status(500).json({ error })
          );
    })
        .catch(
          (error) => res.status(500).json({ error })
          );
};