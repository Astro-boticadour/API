// Importer le module Express
const express = require('express');
const Database = require('./database');
const Config = require('./config');
const Utils = require('./utils');

const User = require('./models/user-models');
const Admin = require('./models/admin-model');
const Project = require('./models/project-model');
const Ressource = require('./models/ressource-model');
const Session = require('./models/session-model');

const User_Controler = require('./controlers/user-controler');
const Admin_Controler = require('./controlers/admin-controler');
const Project_Controler = require('./controlers/project-controler');
const Ressource_Controler = require('./controlers/ressource-controler');
const Session_Controler = require('./controlers/session-controler');
const fs = require('fs');
const path = require('path');





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
  await Project(app);
  await Ressource(app);
  await Session(app);


  await User_Controler(app);
  await Admin_Controler(app);
  await Project_Controler(app);
  await Ressource_Controler(app);
  await Session_Controler(app);

  const port = app.get('config').app.port;


  
  if (app.get('config').app.env === 'development'){
    app.post('/shutdown', (req, res) => {
      Utils.show_log("info", "Shutting down the server", "app");
      res.send("Server is shutting down");
      setTimeout(() => {
        process.exit(0);
      }, 1000);
    });
  }

  // Démarrer le serveur et écouter les requêtes sur le port spécifié
  app.listen(port,() => {
    Utils.show_log("info",`Server is running on port ${port}`,"app");
  });
  return app;
}
