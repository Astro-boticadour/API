const {formatHTTPResponse} = require('../utils');

module.exports = async (app) => {
    const User = app.get('User');
    const Admin = app.get('Admin');
    app.use('/users', async (req, res, next) => {
        // for the /users endpoint, we want to require authentication for the following methods
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
            let isAuthentified = await Admin.isAuthentified(req.headers.authorization);
            if(!isAuthentified){
                res.status(401).send(formatHTTPResponse('Invalid token','error'));
                return;
            }
    
        }
        console.log('middleware');
        next();
    });

      
    // GET /users - Read all users
    app.get('/users', async (req, res) => {
        let result = await User.readAll();
        res.json(result);
        }
    );

    // GET /users/:login - Read a user
    app.get('/users/:login', async (req, res) => {
        let result = await User.read(req.params.login);
        if (result.result===null){
            res.status(404).send(formatHTTPResponse('User not found','error'));
        }
        else{
            res.status(200).send(formatHTTPResponse(result.result,'success'));
        }
        }
    );


    // POST /users - Create a user
    app.post('/users', async (req, res) => {
        let result = await User.create(req.body.login, req.body.firstName, req.body.lastName, req.body.pole);
        if (result.status === 'error'){
            res.status(400).send(formatHTTPResponse(result.result,'error'));
        }
        else{
            res.status(201).send(formatHTTPResponse(result.result,'success'));
        }
        }
    );

}


