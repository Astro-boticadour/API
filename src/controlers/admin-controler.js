const bcrypt = require('bcrypt');

module.exports = async (app) => {
    const Admin = app.get('Admin');

    app.post('/login', async (req, res) => {
        // If we have an Authorization header, we check if its a Bearer token or a Basic auth
        if (req.headers.authorization) {
            if (req.headers.authorization.startsWith('Bearer ')) {
                // If its a Bearer token, we check if its valid
                let token = req.headers.authorization.slice(7);
                let decoded = Admin.verifyToken(token);
                if (decoded) {
                    res.status(200).send({message: 'Token valid'});
                }
                else {
                    res.status(401).send({error: 'Unauthorized', message: 'Invalid token'});
                }
            }
            else if (req.headers.authorization.startsWith('Basic ')) {
                // If its a Basic auth, we check if the credentials are valid
                let credentials = Buffer.from(req.headers.authorization.slice(6), 'base64').toString();

                let [login, password] = credentials.split(':');
                let result = await Admin.isPasswordValid(login, password);
                
                if (result) {
                    let token = await Admin.generateJWTToken(login);
                    res.status(200).send({"status": "success", "token": token});
                }
                else {
                    res.status(401).send({error: 'Unauthorized', message: 'Invalid credentials'});
                }
                
                
            }
            else {
                res.status(400).send({error: 'Bad Request', message: 'Invalid Authorization header'});
            }
        }
        else {
            res.status(400).send({error: 'Bad Request', message: 'Authorization header is missing'});
        }
    }
    );
}


