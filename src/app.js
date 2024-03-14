// Importer le module Express
const express = require('express');

const User = require('./models/user-models');
const Admin = require('./models/admin-model');
const Database = require('./database');
const Config = require('./config');
const User_Controler = require('./controlers/user-controler');
const Admin_Controler = require('./controlers/admin-controler');
const Utils = require('./utils');


// Créer une instance de l'application Express
module.exports = async function start(){
  const app = express();
  app.use(express.json());


  // Error handling in json
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      res.status(400).send({status: 'error', message: 'Invalid JSON'});
    } else {
      next();
    }
  });

  // We don't want to expose the fact that we are using Express
  app.disable('x-powered-by');

  const ws=require('express-ws')(app);
  app.set('ws',ws);
  


  await Config(app);
  await Database(app);
  await User(app);
  await Admin(app);
  await User_Controler(app);
  await Admin_Controler(app);

  // Définir une route pour la racine de l'URL
  app.get('/', (req, res) => {
    res.send('Hello, World!'); // Répondre avec le message "Hello, World!"
    
  });


  const port = app.get('config').app.port;

  // Démarrer le serveur et écouter les requêtes sur le port spécifié
  app.listen(port,() => {
    Utils.show_log("info",`Server is running on port ${port}`,"app");
  });
}