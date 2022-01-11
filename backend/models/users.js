//Importation MongoDB
const mongoose = require('mongoose');
//Importation du module unique-validator pour valider que l'adresse email est bien unique
//const uniqueValidator = require('mongoose-unique-validator');

//Création du schéma User pour la DB
const userSchema = mongoose.Schema ({
    email : {type: String, required: true, unique: true },
    password : {type: String, required : true}
});

//userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);