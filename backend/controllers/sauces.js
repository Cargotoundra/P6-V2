//On importe le schéma sauces
const sauce = require('../models/sauces');
//Permet de modifier les fichiers du système
const fs = require("fs");

exports.createSauce = (req, res, next) => {
    //On transforme les données en objet JS
    const sauceObject = JSON.parse(req.body.sauce);
    //On supprime l'ID crée par MONGO
    delete sauceObject._id;
    //Création d'une nouvelle sauce
    const newSauce = new sauce({
      ...sauceObject,
      //On récupère l'URL complète de l'image
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      //On donne une valeur de création aux élèments suivants :
      likes: 0,
      dislikes: 0,
      usersLiked: [],
      usersDisliked: [],
    });
    //Sauvegarde de la nouvelle sauce
    newSauce.save()
    .then(
      () => res.status(201).json({ message: "sauce enregistré" })
      )
    .catch(
      (error) => res.status(400).json({ error })
    );
  };

exports.getAll = (req, res, next) => {
    //On chercher TOUTES les sauces
    sauce.find()
    .then(
      (allSauces) => { res.status(200).json( allSauces );}
    )
    .catch(
      (error) => { res.status(400).json({ error });}
    );
  };
  
exports.getOne = (req, res, next) => {
    //On cherche une sauce par son ID
    sauce.findOne({_id: req.params.id})
    .then(
      (oneSauce) => { res.status(200).json( oneSauce );}
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
    //updateOne SI l'ID == l'ID de celui ayant rentré la sauce
    sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(
        () => res.status(200).json({ message: 'Modification effectuée !'})
        )
    .catch(
        error => res.status(400).json({error})
        );
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
      .catch(
        error => res.status(500).json({ error })
        );
  };

function findAndSave (req, res, a,){
  sauce.findOneAndUpdate(
    { _id: req.params.id },
    { $inc: { likes : a }, $push: { usersLiked : req.body.userId } }
  )
    .then(
      () => res.status(200).json({ message: "Like ajouté avec succès !" })
      )
    .catch(
      (error) => res.status(400).json({ error })
      );
}
  
exports.likeAndDislike = (req, res) => {
    //Si l'utilisateur aime la sauce alors on incrémente ($inc) et on inscrit l'userID dans le tableau usersLiked de la BD
    if (req.body.like === 1) {
      findAndSave(req, res, 1,);
      /*sauce.findOneAndUpdate(
        { _id: req.params.id },
        { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } }
      )
        .then(
          () => res.status(200).json({ message: "Like ajouté avec succès !" })
          )
        .catch(
          (error) => res.status(400).json({ error })
          );*/

      //Idem si l'utilisateur n'aime pas la sauce
    } else if (req.body.like === -1) {
      sauce.findOneAndUpdate(
        { _id: req.params.id },
        { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId } }
      )
        .then(
          () => res.status(200).json({ message: "Dislike ajouté avec succès !" })
          )
        .catch(
          (error) => res.status(400).json({ error })
          );
      //Si l'utilisateur retire sa note
    } else {
      sauce.findOne({ _id: req.params.id })
        .then((result) => {
          //Si l'utilisateur est bien inclus dans le tableau des usersLiked
          if (result.usersLiked.includes(req.body.userId)) {
            // Alors on incrémente -1 aux like et on le supprime du tableau
            sauce.findOneAndUpdate(
              { _id: req.params.id },
              { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } }
            )
              .then(
                () => res.status(200).json({ message: "Like retiré avec succès !" })
                )
              .catch(
                (error) => res.status(400).json({ error })
                );
          //Si l'utilisateur est bien inclus dans le tableau des usersDisliked
          } else if (result.usersDisliked.includes(req.body.userId)) {
            //Idem pour les likes
            sauce.findOneAndUpdate(
              { _id: req.params.id },
              { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } }
            )
              .then(
                () => res.status(200).json({ message: "Dislike retiré avec succès !" })
                )
              .catch(
                (error) => res.status(400).json({ error })
                );
        }
      });
    }
  };