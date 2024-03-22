const { result } = require("@hapi/joi/lib/base");


async function formatSequelizeResponse(response) {
  // console.log(response);
  
  if (response instanceof Error) {
    show_log('error',response,"sequelize,formatSequelizeResponse",response.stack);
    response= {
      status: 'error',
      result: response.name
    }
  }
  else if (response instanceof Array) {
      keys = Object.keys(response[0]);
      if (!keys.includes('dataValues')) {
        response= { 
          status: 'success',
          result: response
        }
      } else {
        response= { 
          status: 'success',
          result: response.map((item) => item.dataValues)
        }
      }
      
    }
  else if (response instanceof Object) {
        response= {
          status: 'success',
          result: response.dataValues
        }
      }
  else{
        response= {
          status: 'success',
          result: response
        }
      } 
  return response;
  }


function formatHTTPResponse(response,status="success"){

  if (status === "error") {
    return { status: status, message: response };
  }
  else{
    return { status: status, result: response };
  }

}


// Function that executes a sequelize query and formats the response
async function executeAndFormat(model,action, ...args) {
  let result = null;
  try {
      switch (action) {
          case 'create':
              result = await model.create(...args);
              break;
          case 'findByPk':
              result = await model.findByPk(...args);
              break;
          case 'findAll':
              result = await model.findAll(...args);
              break;
          case 'update':
              result = await model.update(...args);
              break;
          case 'destroy':
              result = await model.destroy(...args);
              break;
          case 'query':
              result = await model.query(...args);
              break;
      }
  }
  catch (error) {
      result = error;

  }
  return formatSequelizeResponse(result);
}

function formatWSResponse(reason,data){
  return {reason: reason, data: data};
}


async function handleWS(name,app, ws, req) {
  show_log('info',`[${name}] WebSocket was opened by ${req.connection.remoteAddress}`,"app");
  app.on(name, (reason,data,req) => {
      ws.send(JSON.stringify(formatWSResponse(reason,data)));
  });

  ws.on('close', function() {
      show_log('info',`[${name}] WebSocket was closed by ${req.connection.remoteAddress}`,"app");
  });

  // We cannot test the error case of the WebSocket, so we ignore it in the coverage
  /* istanbul ignore next */
  ws.on('error', function(err) {
      console.error(`[${name}] WebSocket from ${req.connection.remoteAddress} encountered error: ${err}`);
      show_log('error',`[${name}] WebSocket from ${req.connection.remoteAddress} encountered error: ${err}`,"app");
  });
}

function show_log(level="log",message,context="general",error=null){
  // On met des couleurs différentes pour les différents niveaux de log pour que ce soit plus facile à lire,
  // Le contexte c'est pour savoir dans quel fichier on est, et le message c'est le message à afficher 
  // On met juste le level dans sa couleur, le reste ne change pas pour que ce soit plus lisible
  let color;
  switch (level) {
    case "log":
      color = "\x1b[90m"; // dark gray
      break;
    case "info":
      color = "\x1b[36m"; // turquoise
      break;
    case "warn":
      color = "\x1b[33m"; // orange
      break;
    case "error":
      color = "\x1b[31m"; // red
      break;
  }
  // Exemple [LOG-general] message
  if (error) {
    console.error(`${color}[${level.toUpperCase()}-${context}] \x1b[0m${message}`);
    console.error(`> \x1b[31m${error}\x1b[0m`);    
  }
  else{
    console.log(`${color}[${level.toUpperCase()}-${context}] \x1b[0m${message}`);
  }
}


function show_check(message, state, error = null) {
  let color;
  if (state === "OK") {
    color = "\x1b[32m"; // green
  } else {
    color = "\x1b[31m"; // red
  }
  
  console.log(`\x1b[34m[CHECK] \x1b[36m${message} : ${color}${state}\x1b[0m`);
  if (error) {
    console.error(`> \x1b[31m${error.stack}\x1b[0m`);
  }
}




function sendResponse(response, data, statusCode) {
  // If the status is 2xx, we send a response with a status "success", otherwise we send a response with a status "error"
  if (statusCode >= 200 && statusCode < 300) {
    status = "success";
    show_log('info',`${response.req.method} ${response.req.path} - ${response.req.ip} - ${statusCode} `, 'route');
  }
  else{
    status = "error";
    show_log('warn',`${response.req.method} ${response.req.path} - ${response.req.ip} - ${statusCode} - ${data}`, 'route');
  }
  // We log the response in the console (with the path, the ip, the status code and the response)
  response.status(statusCode).send(formatHTTPResponse(data, status));

}


module.exports = {
  executeAndFormat,
  formatSequelizeResponse,
  sendResponse,
  formatHTTPResponse,
  handleWS,
  formatWSResponse,
  show_log,
  show_check
}





