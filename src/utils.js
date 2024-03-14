async function formatSequelizeResponse(response) {
  // console.log(response);
  
  if (response instanceof Error) {
    response= {
      status: 'error',
      result: response.name
    }
  }
  else if (response instanceof Array) {
      // console.log("is array");
      response= {
        status: 'success',
        result: response.map((item) => item.dataValues)
      }
    }
  else if (response instanceof Object) {
        // console.log("is object");
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

  // The database returns an array with an undefined element when it doesn't find anything
  if (response instanceof Array && response[0] ==undefined) {
    response = null
  }
  if (status === "error") {
    return { status: status, message: response };
  }
  else{
    return { status: status, result: response };
  }

}


function formatWSResponse(reason,data){
  return {reason: reason, data: data};
}


async function handleWS(name,app, ws, req) {
  console.log(`[${name}] WebSocket was opened by ${req.connection.remoteAddress}`);
  app.on(name, (reason,data,req) => {
      ws.send(JSON.stringify(formatWSResponse(reason,data)));
  });

  ws.on('close', function() {
      console.log(`[${name}] WebSocket was closed by ${req.connection.remoteAddress}`);
  });

  ws.on('error', function(err) {
      console.error(`[${name}] WebSocket from ${req.connection.remoteAddress} encountered error: ${err}`);
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
    default:
      color = "\x1b[0m"; // reset color
      break;
  }
  // Exemple [LOG-general] message
  if (error) {
    console.error(`${color}[${level.toUpperCase()}-${context}] \x1b[0m${message}\n> \x1b[31m${error}\x1b[0m`);
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
  
  console.log(`\x1b[34m[CHECK] \x1b[36m${message} : ${color}${state}\x1b[0m${error ? `\n> \x1b[31m${error}\x1b[0m` : ''}`);
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
  formatSequelizeResponse,
  sendResponse,
  formatHTTPResponse,
  handleWS,
  formatWSResponse,
  show_log,
  show_check
}





show_check('TESTING show_check', 'OK');
show_check('TESTING show_check', 'KO');
show_log('log','TESTING show_log',"test");
show_log('info','TESTING show_log',"test");
show_log('warn','TESTING show_log',"test");
show_log('error','TESTING show_log',"test", "error message");