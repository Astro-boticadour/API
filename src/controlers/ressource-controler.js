const {handleWS,show_log,sendResponse} = require('../utils');
const JoiDate = require('@hapi/joi-date');
const Joi = require('@hapi/joi').extend(JoiDate);


module.exports = async (app) => {
    const Ressource = app.get('Ressource');
    const Admin = app.get('Admin');
    app.ws('/ressources', async function(ws, req) {await handleWS('ressources',app, ws, req)});
    

    // We use a middleware to require authentication for the /ressources endpoint
    app.use('/ressources', async (req, res, next) => {
        // for the /ressources endpoint, we want to require authentication for the following methods
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



      
    // GET /ressources - Read all ressources
    app.get('/ressources', async (req, res) => {
        let result = await Ressource.readAll();
        sendResponse(res, result.result, 200);
        }
    );

    // GET /ressources/:id - Read a Ressource
    app.get('/ressources/:id', async (req, res) => {
        let result = await Ressource.read(req.params.id);
        if (result.result===null){
            sendResponse(res, 'Ressource not found', 404);

        }
        else{
            sendResponse(res, result.result, 200);
        }
        }
    );


    // POST /ressources - Create a Ressource
    app.post('/ressources', async (req, res) => {
        // We use JOI to validate the request body
        const schema = Joi.object({
            name: Joi.string().max(127).required(),
            model: Joi.string().max(127).required(),
            type: Joi.string().max(127).required()
        });
        const { error } = schema.validate(req.body);
        // If the request body is not valid, we send an error response
        if (error) {
            sendResponse(res, error.details[0].message, 400);
            return;
        }


        let result = await Ressource.create(req.body.name, req.body.type, req.body.model, req.body.isUsed);
        // If the Ressource was created, we send a success response, otherwise we send an error response
        if (result.status === 'error'){
            // can't test this line because can't find a way to make the database fail
            /* istanbul ignore next */
            sendResponse(res, result.result, 400);
        }
        else{
            sendResponse(res, result.result, 201);
            // app.emit('ressources',"created",result.result,req);
        }
        }
    );

    // patch /ressources/:id - Update a Ressource
    app.patch('/ressources/:id', async (req, res) => {
        // We use JOI to validate the request body
        const schema = Joi.object({
            name: Joi.string().max(127),
            model: Joi.string().max(127),
            type: Joi.string().max(127)
        });

        const { error } = schema.validate(req.body);
        // If the request body is not valid, we send an error response
        if (error) {
            sendResponse(res, error.details[0].message, 400);
            return;
        }

        // If the Ressource does not exist, we send an error response
        if (!await Ressource.exists(req.params.id)){
            sendResponse(res, 'Ressource not found', 404);
            return;
        }

        let result = await Ressource.update(req.params.id, req.body);
        // If the Ressource was updated, we send a success response, otherwise we send an error response
        // can't test this line because can't find a way to make the database fail
        /* istanbul ignore next */
        if (result.status === 'error'){
            sendResponse(res, result.result, 400);
        }
        else{
            // We get the Ressource from the database to send it in the response
            let p = await Ressource.read(req.params.id);
            app.emit('ressources',"updated",p.result,req);
            sendResponse(res, p.result, 200);
        }
        }
    );

    // DELETE /ressources/:id - Delete a Ressource
    app.delete('/ressources/:id', async (req, res) => {
        // If the Ressource does not exist, we send an error response
        if (!await Ressource.exists(req.params.id)){
            sendResponse(res, 'Ressource not found', 404);
            return;
        }

        let result = await Ressource.delete(req.params.id);
        // If the Ressource was deleted, we send a success response, otherwise we send an error response
        // can't test this line because can't find a way to make the database fail
        /* istanbul ignore next */
        if (result.status === 'error'){
            sendResponse(res, result.result, 400);
        }
        else{
            sendResponse(res, {id: Number(req.params.id)}, 200);
            app.emit('ressources',"deleted",{id: Number(req.params.id)},req);
        }
        }
    );


}


