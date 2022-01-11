//On importe le schéma sauces
const sauce = require('../models/sauces');
//Permet de modifier les fichiers du système
const fs = require("fs");

exports.createSauce = (req, res, next) => {
    //On transforme les données en objet JS
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    //Création d'une nouvelle sauce
    const newSauce = new sauce({
      ...sauceObject,
      //On récupère l'URL complète de l'image
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      //likes: 0,
      //dislikes: 0,
      //usersLiked: [],
      //usersDisliked: [],
    });
    //Sauvegarde de la nouvelle sauce
    newSauce.save()
    .then(() => res.status(201).json({ message: "sauce enregistré" }))
    .catch((error) =>
      res.status(400).json({ message: "Sauce non enregistré" })
    );
  };

exports.getAll = (req, res, next) => {
    //On chercher TOUTES les sauces
    sauce.find()
    .then(
      (allSauces) => { res.status(200).json(allSauces);}
    )
    .catch(
      (error) => { res.status(400).json({ error });}
    );
  };
  
exports.getOne = (req, res, next) => {
    //On cherche un objet par son ID
    sauce.findOne({_id: req.params.id})
    .then(
      (oneSauce) => { res.status(200).json(oneSauce);}
    )
    .catch(
      (error) => {res.status(404).json({error});}
    );
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
    //SI la modif concerne l'image
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    } : { ...req.body };
    //Sinon MAJ
    //updateOne vérifie que l'ID et l'ID de celui ayant rentré la sauce
    sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(
        () => res.status(200).json({ message: 'Modification effectuée !'})
        )
    .catch(
        error => res.status(400).json({error}));
  };
  
exports.deleteSauce = (req, res, next) => {
  //On vérifie que l'ID de l'user et l'ID de l'user ayant rentré la sauce
    sauce.findOne({ _id: req.params.id })
      .then(
          sauce => {
            //On récupère le 2ème élèment du tableau qui est le nom de l'image, le premier étant le début de l'URL
            const imageName = sauce.imageUrl.split('/images/')[1];
            //On supprime l'image du fichier /images
            fs.unlink(`images/${imageName}`, 
            () => {
            //On supprime l'objet sauce ayant l'ID de celle sur lequel on est
            sauce.deleteOne({ _id: req.params.id })
                .then(
                    () => res.status(200).json({ message: 'Suppression ok'})
                    )
                .catch(
                    error => res.status(400).json({ error})
                    );
            });
        })
      .catch(error => res.status(500).json({ error }));
  };
  
exports.likeAndDislike = (req, res, next) => {
    //On isole la sauce sur laquelle on est
    sauce.findOne({_id: req.params.id})
        .then(
            sauce => {
            //Si l'utilisateur like la sauce
            if (req.body.like === 1) {
                //On ajoute un like
                sauce.likes++;
                //Si l'utilisateur qui like la sauce n'est pas dans le tableau usersLiked alors on l'ajoute
                if (!sauce.usersLiked.includes(req.body.userId)) 
                {
                    sauce.usersLiked.push(req.body.userId);
                }
            //Si l'utilisateur n'aime pas la sauce
            } else if (req.body.like === -1) {
                //On ajoute un dislike
                sauce.dislikes++;
                //Si l'utilisateur qui dislike la sauce n'est pas dans le tableau usersDisliked alors on l'ajoute
                if (!sauce.usersDisliked.includes(req.body.userId)) 
                {
                    sauce.usersDisliked.push(req.body.userId);
                }
            } else {
                //Si l'utisateur qui aime la sauce est déjà dans le tableau des usersLiked
                if (sauce.usersLiked.includes(req.body.userId)) 
                {
                    //Il annule son like
                    sauce.likes--;
                    //On cherche son index ds le tableau des usersLiked
                    const indexOfUser = sauce.usersLiked.indexOf(req.body.userId);
                    //On le supprime
                    sauce.usersLiked.splice(indexOfUser,1);
                }else{
                    //In annule son dislike
                    sauce.dislikes--;
                    //On cherche son index ds le tableau des usersDisliked
                    const indexOfUser = sauce.usersDisliked.indexOf(req.body.userId);
                    //On le supprime
                    sauce.usersDisliked.splice(indexOfUser,1);
                }
            }
            //MAJ
            sauce.save()
                .then(
                    () => res.status(201).json({message: 'Notes pries en compte !'}))
                .catch(
                    error => res.status(400).json({error}));
        })
        .catch(error => res.status(500).json({error}));
}