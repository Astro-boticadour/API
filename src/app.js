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
  require('express-ws')(app);


  // Error handling in json
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      Utils.sendResponse(res, 'Invalid JSON', 400);
    } else {
      next();
    }
  });


  // We don't want to expose the fact that we are using Express
  app.disable('x-powered-by');
  


  await Config(app);
  await Database(app);
  await User(app);
  await Admin(app);
  await User_Controler(app);
  await Admin_Controler(app);



  const port = app.get('config').app.port;

  // Démarrer le serveur et écouter les requêtes sur le port spécifié
  app.listen(port,() => {
    Utils.show_log("info",`Server is running on port ${port}`,"app");
  });
}