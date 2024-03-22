// Importer le module Express
const express = require('express');
const cron = require('node-cron');
const Database = require('./database');
const Config = require('./config');
const Utils = require('./utils');

const User = require('./models/user-models');
const Admin = require('./models/admin-model');
const Project = require('./models/project-model');
const Ressource = require('./models/ressource-model');
const Session = require('./models/session-model');
const Utilisation = require('./models/utilisation-model');
const Data = require('./models/data-model');

const User_Controler = require('./controlers/user-controler');
const Admin_Controler = require('./controlers/admin-controler');
const Project_Controler = require('./controlers/project-controler');
const Ressource_Controler = require('./controlers/ressource-controler');
const Session_Controler = require('./controlers/session-controler');
// const Utilisation_Controler = require('./controlers/utilisation-controler');
const Data_Controler = require('./controlers/data-controler');
const Utilisation_Controler = require('./controlers/utilisation-controler');





// Créer une instance de l'application Express
module.exports = async function start(){
  const app = express();
  app.use(express.json());
  require('express-ws')(app);



  // We don't want to expose the fact that we are using Express
  app.disable('x-powered-by');
  


  await Config(app);
  await Database(app);

  await User(app);
  await Admin(app);
  await Project(app);
  await Ressource(app);
  await Session(app);
  await Utilisation(app);
  await Data(app);


  // We want to execute some inner code that is not accessible from the routes, so that the coverage is 100%
  if (app.get('config').app.env === 'test') {
    await require('./tests')(app);
  }

  await User_Controler(app);
  await Admin_Controler(app);
  await Project_Controler(app);
  await Ressource_Controler(app);
  await Session_Controler(app);
  // await Utilisation_Controler(app);
  await Data_Controler(app);
  await Utilisation_Controler(app);

  cron.schedule(app.get('config').app.close_cron, () => {
    // console.log('Closing all active sessions');
    Utils.show_log("info","Closing all active sessions","app");
    app.get('Session').closeAllSessions();
  });
  

  const port = app.get('config').app.port;
  // Démarrer le serveur et écouter les requêtes sur le port spécifié
  app.listen(port,() => {
    Utils.show_log("info",`Server is running on port ${port}`,"app");
  });


  // Other routes rules
  app.get('/healthcheck', (req, res, next) => {Utils.sendResponse(res, 'Service is healthy', 200)});
  app.get('/coffee', (req, res, next) => {Utils.sendResponse(res, 'no coffee available', 418)});
  // if we are in development mode, we allow a route /shutdown to stop the server
  if (app.get('config').app.env !== 'production') app.post('/shutdown', (req, res, next) => { ; Utils.sendResponse(res, 'Service is shutting down', 200);Utils.show_log('info','Service is shutting down',"app"); process.exit(0); });
  // If the json is not parsable, we send an error response
  app.use((err, req, res, next) => {if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {Utils.sendResponse(res, 'Invalid JSON', 400)}});
  // If the route does not exist, we send an error response
  app.use((req, res, next) => {if (!res.headersSent) {Utils.sendResponse(res, 'Not found', 404)}

  


  });


  return app;
}
