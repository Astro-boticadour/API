const bcrypt = require('bcrypt');
const {sendResponse} = require('../utils');

module.exports = async (app) => {
    const Admin = app.get('Admin');

    app.post('/login', async (req, res) => {
        // If we have an Authorization header, we check if its a Bearer token or a Basic auth
        let authorization = req.headers.authorization;
        let isAuthentified= await Admin.isAuthentified(authorization);
        // If the user was authenticated with a token, we tell him that the token is valid
        if (isAuthentified && authorization.startsWith('Bearer ')){
            sendResponse(res, 'Token is valid', 200);
        }
        // If the user was authenticated with a Basic auth, we generate a token for him
        if (isAuthentified && authorization.startsWith('Basic ')){
            let token = await Admin.generateJWTToken(authorization);
            sendResponse(res, {"token":token}, 200);
        }

        // If the user was not authenticated, but the Authorization header is present, we tell him that the credentials are invalid
        if (!isAuthentified && authorization){
            sendResponse(res, 'Invalid credentials', 401);
        }
        // If the Authorization header is not present, we tell the user that he needs to authenticate
        if (!authorization){
            sendResponse(res, 'Must authenticate with Basic or Bearer', 401);
        }
    }
    );
}


