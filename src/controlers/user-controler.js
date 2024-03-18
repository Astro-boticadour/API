const {handleWS,show_log,sendResponse} = require('../utils');
const Joi = require('@hapi/joi');

module.exports = async (app) => {
    const User = app.get('User');
    const Admin = app.get('Admin');
    app.ws('/users', async function(ws, req) {await handleWS('users',app, ws, req)});
    

    // We use a middleware to require authentication for the /users endpoint
    app.use('/users', async (req, res, next) => {
        // for the /users endpoint, we want to require authentication for the following methods
        if ([ 'POST', 'PATCH', 'DELETE'].includes(req.method)) {
            let isAuthentified = await Admin.isAuthentified(req.headers.authorization);
            if(!isAuthentified){
                sendResponse(res, 'Invalid token', 401);
                return;
            }
        }
        if ([ 'PUT' ].includes(req.method)) {
            sendResponse(res, 'Method not allowed', 405);
            return;
        }
        next();
    });



      
    // GET /users - Read all users
    app.get('/users', async (req, res) => {
        let result = await User.readAll();
        sendResponse(res, result.result, 200);
        }
    );

    // GET /users/:login - Read a user
    app.get('/users/:login', async (req, res) => {
        let result = await User.read(req.params.login);
        if (result.result===null){
            sendResponse(res, 'User not found', 404);

        }
        else{
            sendResponse(res, result.result, 200);
        }
        }
    );


    // POST /users - Create a user
    app.post('/users', async (req, res) => {
        // We use JOI to validate the request body
        const schema = Joi.object({
            login: Joi.string().max(127).required(),
            firstName: Joi.string().max(127).required(),
            lastName: Joi.string().max(127).required(),
            pole: Joi.string().max(127).required()
        });
        const { error } = schema.validate(req.body);
        // If the request body is not valid, we send an error response
        if (error) {
            sendResponse(res, error.details[0].message, 400);
            return;
        }

        // If the user already exists, we send an error response
        if (await User.exists(req.body.login)){
            sendResponse(res, 'User already exists', 409);
            return;
        }

        let result = await User.create(req.body.login, req.body.firstName, req.body.lastName, req.body.pole);
        // If the user was created, we send a success response, otherwise we send an error response
        // can't test this line because can't find a way to make the database fail
        /* istanbul ignore next */
        if (result.status === 'error'){
            sendResponse(res, result.result, 400);
        }
        else{
            sendResponse(res, result.result, 201);
            app.emit('users',"created",result.result,req);
        }
        }
    );

    // patch /users/:login - Update a user
    app.patch('/users/:login', async (req, res) => {
        // We use JOI to validate the request body
        const schema = Joi.object({
            firstName: Joi.string().max(127),
            lastName: Joi.string().max(127),
            pole: Joi.string().max(127)
        });
        const { error } = schema.validate(req.body);
        // If the request body is not valid, we send an error response
        if (error) {
            sendResponse(res, error.details[0].message, 400);
            return;
        }

        // If the user does not exist, we send an error response
        if (!await User.exists(req.params.login)){
            sendResponse(res, 'User not found', 404);
            return;
        }

        let result = await User.update(req.params.login, req.body)
        // If the user was updated, we send a success response, otherwise we send an error response
        // can't test this line because can't find a way to make the database fail
        /* istanbul ignore next */
        if (result.status === 'error'){
            sendResponse(res, result.result, 400);
        }
        else{
            // We get the user from the database to send it in the response
            let user = await User.read(req.params.login);
            sendResponse(res, user.result, 200);
            app.emit('users',"updated",user.result,req);
        }
        }
    );

    // DELETE /users/:login - Delete a user
    app.delete('/users/:login', async (req, res) => {
        // If the user does not exist, we send an error response
        if (!await User.exists(req.params.login)){
            sendResponse(res, 'User not found', 404);
            return;
        }

        let result = await User.delete(req.params.login);
        // If the user was deleted, we send a success response, otherwise we send an error response
        if (result.status === 'error'){
            // can't test this line because can't find a way to make the database fail
            /* istanbul ignore next */
            sendResponse(res, result.result, 400);
        }
        else{
            sendResponse(res, {login: req.params.login}, 200);
            app.emit('users',"deleted",{login: req.params.login},req);
        }
        }
    );


}


