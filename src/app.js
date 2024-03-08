// Importer le module Express
const express = require('express');
const User = require('./models/user-models');
const Admin = require('./models/admin-model');
const Database = require('./database');
const Config = require('./config');
const User_Controler = require('./controlers/user-controler');
const Admin_Controler = require('./controlers/admin-controler');


// Créer une instance de l'application Express
module.exports = async function start(){
  const app = express();
  var router = express.Router();

  await Config(app);
  await Database(app);
  await User(app);
  await Admin(app);
  await User_Controler(app);
  await Admin_Controler(app);



  console.log('READY');

  // Définir une route pour la racine de l'URL
  app.get('/', (req, res) => {
    res.send('Hello, World!'); // Répondre avec le message "Hello, World!"
    
  });

  // Définir le port sur lequel le serveur écoutera les requêtes
  const port = 3000;

  // Démarrer le serveur et écouter les requêtes sur le port spécifié
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}