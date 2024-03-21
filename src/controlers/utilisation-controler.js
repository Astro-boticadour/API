const {handleWS,show_log,sendResponse} = require('../utils');
const JoiDate = require('@hapi/joi-date');
const Joi = require('@hapi/joi').extend(JoiDate);


module.exports = async (app) => {
    const Utilisation = app.get('Utilisation');
    const Admin = app.get('Admin');
    const Ressource = app.get('Ressource');
    const Session = app.get('Session');

    // For now we don't use websockets, but we keep the code for future use just in case
    // app.ws('/utilisations', async function(ws, req) {await handleWS('utilisations',app, ws, req)});
    

    // We use a middleware to require authentication for the /utilisations endpoint
    app.use('/utilisations', async (req, res, next) => {
        // for the /users endpoint, we want to require authentication for the following methods
        if (['DELETE'].includes(req.method)) {
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



      
    // GET /utilisations - Read all utilisations
    app.get('/utilisations', async (req, res) => {
        let result = await Utilisation.readAll();
        sendResponse(res, result.result, 200);
        }
    );

    // GET /utilisations/:id - Read a Utilisation
    app.get('/utilisations/:id', async (req, res) => {
        let result = await Utilisation.read(req.params.id);
        if (result.result===null){
            sendResponse(res, 'Utilisation not found', 404);

        }
        else{
            sendResponse(res, result.result, 200);
        }
        }
    );


    // POST /utilisations - Create a Utilisation
    app.post('/utilisations', async (req, res) => {
        // We use JOI to validate the request body
        const schema = Joi.object({
            usageStartDate : Joi.date().format(['YYYY-MM-DD HH:mm:ss']).required(),
            usageEndDate : Joi.date().format(['YYYY-MM-DD HH:mm:ss']),
            sessionId : Joi.number().required(),
            ressourceId : Joi.number().required(),
        });



        const { error } = schema.validate(req.body);
        // If the request body is not valid, we send an error response
        if (error) {
            sendResponse(res, error.details[0].message, 400);
            return;
        }
        // We check if the Session and the Ressource exist
        if (!await checkDependencies(res,null,req.body.ressourceId,req.body.sessionId)){
            return;
        }

        // We check if the ressource is already used
        if (await Ressource.isUsed(req.body.ressourceId)){
            sendResponse(res, 'Ressource is already used', 409);
            return;
        }

        // We check if the session is active
        if (await Session.is_closed(req.body.sessionId)){
            sendResponse(res, 'Session is closed', 409);
            return;
        }

        // StartDate can't be in the future
        const margin = 20 * 60 * 1000; // 20 minutes in milliseconds
        if (new Date(req.body.usageStartDate) > new Date(Date.now() + margin)){
            sendResponse(res, 'usageStartDate can\'t be in the future', 400);
            return;
        }




        // We check if the usageEndDate is greater than the usageStartDate
        if (req.body.usageEndDate){
            if (new Date(req.body.usageEndDate) < new Date(req.body.usageStartDate)){
                sendResponse(res, 'usageEndDate must be greater than usageStartDate', 400);
                return;
            }
        }


        let result = await Utilisation.create(req.body.usageStartDate, req.body.usageEndDate, req.body.sessionId, req.body.ressourceId);

        if (!req.body.usageEndDate){
            // We set the ressource as used, only if we don't provide an endTime
            await Ressource.use(req.body.ressourceId); 
        }

        // If the Utilisation was created, we send a success response, otherwise we send an error response
        // can't test this line because can't find a way to make the database fail
        /* istanbul ignore next */
        if (result.status === 'error'){
            sendResponse(res, result.result, 400);
        }
        else{
            sendResponse(res, result.result, 201);
        }
        }
    );

    // patch /utilisations/:id - Update a Utilisation
    app.patch('/utilisations/:id', async (req, res) => {
        // We use JOI to validate the request body
        const schema = Joi.object({
            usageEndDate: Joi.date().format(['YYYY-MM-DD HH:mm:ss']).required(),
        });

        const { error } = schema.validate(req.body);
        // If the request body is not valid, we send an error response
        if (error) {
            sendResponse(res, error.details[0].message, 400);
            return;
        }

        // We check if the Utilisation exists
        if (!await checkDependencies(res,req.params.id,null)){
            return;
        }

        let utilisation = await Utilisation.read(req.params.id);

        // We check if the Utilisation is finished
        if (await Utilisation.is_finished(req.params.id)){
            sendResponse(res, 'Utilisation is already finished', 409);
            return;
        }

        
        // We close the utilisation if the endTime is provided
        if (req.body.usageEndDate){
            // We check that the usageEndDate is greater than the usageStartDate
            if (new Date(req.body.usageEndDate) < new Date(utilisation.result.usageStartDate)){
                sendResponse(res, 'endTime must be greater than startTime', 400);
                return;
            }
            else{
                await Ressource.free(utilisation.result.ressourceId);
            }
        }
        let result = await Utilisation.update(req.params.id, req.body);
        // If the Utilisation was updated, we send a success response, otherwise we send an error response
        // can't test this line because can't find a way to make the database fail
        /* istanbul ignore next */
        if (result.status === 'error'){
            sendResponse(res, result.result, 400);
        }
        else{
            // We get the Utilisation from the database to send it in the response
            let p = await Utilisation.read(req.params.id);
            sendResponse(res, p.result, 200);
        }
        }
    );
    // DELETE /utilisations/:id - Delete a Utilisation
    app.delete('/utilisations/:id', async (req, res) => {
        // If the Utilisation does not exist, we send an error response
        if (!await checkDependencies(res,req.params.id,null)){
            return;
        }

        let result = await Utilisation.delete(req.params.id);
        // If the Utilisation was deleted, we send a success response, otherwise we send an error response
        // can't test this line because can't find a way to make the database fail
        /* istanbul ignore next */
        if (result.status === 'error'){
            sendResponse(res, result.result, 400);
        }
        else{
            sendResponse(res, {id: Number(req.params.id)}, 200);
        }
        }
    );




    async function checkDependencies(res,utilisationId=null,ressourceId=null,sessionId=null){
        // We check if the Utilisation exists
        if (utilisationId !== null){
            if (!await Utilisation.exists(utilisationId)){
                sendResponse(res, 'Utilisation not found', 404);
                return false;
            }
        }
        // We check if the Session exists
        if (sessionId !== null){
            if (!await Session.exists(sessionId)){
                sendResponse(res, 'Session not found', 404);
                return false;
            }
        }
        // We check if the Ressource exists
        if (ressourceId !== null){
            if (!await Ressource.exists(ressourceId)){
                sendResponse(res, 'Ressource not found', 404);
                return false;
            }
        }
        return true;
    }

}


