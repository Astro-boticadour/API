async function formatSequelizeResponse(response) {
  // console.log(response);
  
  if (response instanceof Error) {
    response= {
      status: 'error',
      result: response.name
    }
  }
  else{
    if (response instanceof Array) {
      // console.log("is array");
      response= {
        status: 'success',
        result: response.map((item) => item.dataValues)
      }
    }
    else{
      if (response instanceof Object) {
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
    }

  }

  // console.log(response);
  return response;
}



module.exports = formatSequelizeResponse;

