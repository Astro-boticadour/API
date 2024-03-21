const {handleWS,show_log,sendResponse} = require('../utils');
const JoiDate = require('@hapi/joi-date');
const Joi = require('@hapi/joi').extend(JoiDate);


module.exports = async (app) => {
    const Project = app.get('Project');
    const Admin = app.get('Admin');
    app.ws('/projects', async function(ws, req) {await handleWS('projects',app, ws, req)});
    

    // We use a middleware to require authentication for the /projects endpoint
    app.use('/projects', async (req, res, next) => {
        // for the /projects endpoint, we want to require authentication for the following methods
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



      
    // GET /projects - Read all projects
    app.get('/projects', async (req, res) => {
        let result = await Project.readAll();
        sendResponse(res, result.result, 200);
        }
    );

    // GET /projects/:id - Read a Project
    app.get('/projects/:id', async (req, res) => {
        let result = await Project.read(req.params.id);
        if (result.result===null){
            sendResponse(res, 'Project not found', 404);

        }
        else{
            sendResponse(res, result.result, 200);
        }
        }
    );


    // POST /projects - Create a Project
    app.post('/projects', async (req, res) => {
        // We use JOI to validate the request body
        const schema = Joi.object({
            name: Joi.string().max(127).required(),
            startDate: Joi.date().format(['YYYY-MM-DD']),
            endDate: Joi.date().format(['YYYY-MM-DD']),
            isClosed: Joi.boolean(),
            description: Joi.string().max(255)    
        });
        const { error } = schema.validate(req.body);
        // If the request body is not valid, we send an error response
        if (error) {
            sendResponse(res, error.details[0].message, 400);
            return;
        }

        if (req.body.endDate && req.body.startDate) {
            req.body.endDate += "T23:59:59.999Z";
            // We check if the endDate is after the startDate
            if (new Date(req.body.startDate) > new Date(req.body.endDate)) {
            sendResponse(res, 'endDate must be after startDate', 400);
            return;
            }
        }




        let result = await Project.create(req.body.name, req.body.startDate, req.body.endDate, req.body.description)
        // If the Project was created, we send a success response, otherwise we send an error response
        // can't test this line because can't find a way to make the database fail
        /* istanbul ignore next */
        if (result.status === 'error'){
            sendResponse(res, result.result, 400);
        }
        else{
            sendResponse(res, result.result, 201);
            app.emit('projects',"created",result.result,req);
        }
        }
    );

    // patch /projects/:id - Update a Project
    app.patch('/projects/:id', async (req, res) => {
        // We use JOI to validate the request body
        const schema = Joi.object({
            name: Joi.string().max(127),
            startDate: Joi.date().format(['YYYY-MM-DD']),
            endDate: Joi.date().format(['YYYY-MM-DD']),
            isClosed: Joi.boolean(),
            description: Joi.string().max(255)    
        });

        const { error } = schema.validate(req.body);
        // If the request body is not valid, we send an error response
        // can't test this line because can't find a way to make the database fail
        /* istanbul ignore next */
        if (error) {
            sendResponse(res, error.details[0].message, 400);
            return;
        }

        if (req.body.endDate){
            req.body.endDate+= "T23:59:59.999Z";
            // We check if the endDate is after the startDate
            if (new Date(req.body.startDate) > new Date(req.body.endDate)){
                sendResponse(res, 'endDate must be after startDate', 400);
                return;
            }
        }
        

        // If the Project does not exist, we send an error response
        if (!await Project.exists(req.params.id)){
            sendResponse(res, 'Project not found', 404);
            return;
        }

        let result = await Project.update(req.params.id, req.body);
        // If the Project was updated, we send a success response, otherwise we send an error response
        if (result.status === 'error'){
            // can't test this line because can't find a way to make the database fail
            /* istanbul ignore next */
            sendResponse(res, result.result, 400);
        }
        else{
            // We get the Project from the database to send it in the response
            let p = await Project.read(req.params.id);
            sendResponse(res, p.result, 200);
            app.emit('projects',"updated",p.result,req);
        }
        }
    );

    // DELETE /projects/:id - Delete a Project
    app.delete('/projects/:id', async (req, res) => {
        // If the Project does not exist, we send an error response
        if (!await Project.exists(req.params.id)){
            sendResponse(res, 'Project not found', 404);
            return;
        }

        let result = await Project.delete(req.params.id);
        // If the Project was deleted, we send a success response, otherwise we send an error response
        // can't test this line because can't find a way to make the database fail
        /* istanbul ignore next */
        if (result.status === 'error'){
            sendResponse(res, result.result, 400);
        }
        else{
            sendResponse(res, {id: Number(req.params.id)}, 200);
            app.emit('projects',"deleted",{id: Number(req.params.id)},req);
        }
        }
    );


}


