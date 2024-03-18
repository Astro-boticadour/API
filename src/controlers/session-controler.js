const {handleWS,show_log,sendResponse} = require('../utils');
const JoiDate = require('@hapi/joi-date');
const Joi = require('@hapi/joi').extend(JoiDate);


module.exports = async (app) => {
    const Session = app.get('Session');
    const Admin = app.get('Admin');
    app.ws('/sessions', async function(ws, req) {await handleWS('sessions',app, ws, req)});
    

    // We use a middleware to require authentication for the /sessions endpoint
    app.use('/sessions', async (req, res, next) => {
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



      
    // GET /sessions - Read all sessions
    app.get('/sessions', async (req, res) => {
        let result = await Session.readAll();
        sendResponse(res, result.result, 200);
        }
    );

    // GET /sessions/:id - Read a Session
    app.get('/sessions/:id', async (req, res) => {
        let result = await Session.read(req.params.id);
        if (result.result===null){
            sendResponse(res, 'Session not found', 404);

        }
        else{
            sendResponse(res, result.result, 200);
        }
        }
    );


    // POST /sessions - Create a Session
    app.post('/sessions', async (req, res) => {
        // We use JOI to validate the request body
        const schema = Joi.object({
            startTime: Joi.date().format(['YYYY-MM-DD HH:mm:ss']).required(),
            endTime: Joi.date().format(['YYYY-MM-DD HH:mm:ss']),
            idProject: Joi.number().required(),
            loginUser: Joi.string().max(127).required(),
        });
        const { error } = schema.validate(req.body);
        // If the request body is not valid, we send an error response
        if (error) {
            sendResponse(res, error.details[0].message, 400);
            return;
        }
        // We check if the Project and the User exist
        if (!await checkDependencies(res,null,req.body.idProject,req.body.loginUser)){
            return;
        }

        // We check if the User already has a session
        const userSession = await Session.get_user_active_sessions(req.body.loginUser); 
        if (userSession.result && userSession.result.length > 0){
            sendResponse(res, 'User already has a session', 409);
            return;
        }

        // We close the session if the endTime is provided
        if (req.body.endTime){
            req.body.isClosed = true;
            if (new Date(req.body.endTime) < new Date(req.body.startTime)){
                sendResponse(res, 'endTime must be greater than startTime', 400);
                return;
            }
        }


        let result = await Session.create(req.body.startTime, req.body.endTime, req.body.idProject, req.body.loginUser);
        // If the Session was created, we send a success response, otherwise we send an error response
        // can't test this line because can't find a way to make the database fail
        /* istanbul ignore next */
        if (result.status === 'error'){
            sendResponse(res, result.result, 400);
        }
        else{
            sendResponse(res, result.result, 201);
            app.emit('sessions',"created",result.result,req);
        }
        }
    );

    // patch /sessions/:id - Update a Session
    app.patch('/sessions/:id', async (req, res) => {
        // We use JOI to validate the request body
        const schema = Joi.object({
            endTime: Joi.date().format(['YYYY-MM-DD HH:mm:ss']),
        });

        const { error } = schema.validate(req.body);
        // If the request body is not valid, we send an error response
        if (error) {
            sendResponse(res, error.details[0].message, 400);
            return;
        }

        // We check if the Session, Project and the User exist
        if (!await checkDependencies(res,req.params.id,req.body.idProject,req.body.loginUser)){
            return;
        }

        let session = await Session.read(req.params.id);
        // We check if the Session is closed
        if (await Session.is_closed(req.params.id)){
            sendResponse(res, 'Session is already closed', 409);
            return;
        }

        
        // We close the session if the endTime is provided
        if (req.body.endTime){
            req.body.isClosed = true;
            // We check if the endTime is greater than the startTime
            if (new Date(req.body.endTime) < new Date(session.result.startTime)){
                sendResponse(res, 'endTime must be greater than startTime', 400);
                return;
            }
        }
        let result = await Session.update(req.params.id, req.body);
        // If the Session was updated, we send a success response, otherwise we send an error response
        // can't test this line because can't find a way to make the database fail
        /* istanbul ignore next */
        if (result.status === 'error'){
            sendResponse(res, result.result, 400);
        }
        else{
            // We get the Session from the database to send it in the response
            let p = await Session.read(req.params.id);
            sendResponse(res, p.result, 200);
            app.emit('sessions',"updated",p.result,req);
        }
        }
    );

    app.get('/sessions/activeSession/:login', async (req, res)=>{

        if(!await checkDependencies(res, null, null, req.params.login))
        {
            return;
        }

        // We check if the User already has a session
        const userSessions = await Session.get_user_active_sessions(req.params.login);
        if (userSessions.status === "success"){
            // If we have a session, it will be formatted as an array, but since we can only have one active session, we can just return the first element of the array
            if (Array.isArray(userSessions.result) && userSessions.result.length > 0){
                sendResponse(res, userSessions.result[0], 200);
                return;
            }
            else{
                sendResponse(res, null, 200);
                return;
            }
        }
        else
        {
            // if the database fails, we send a 500 error
            /* istanbul ignore next */
            sendResponse(res, userSessions.result, 500);
        }



    });

    // DELETE /sessions/:id - Delete a Session
    app.delete('/sessions/:id', async (req, res) => {
        // If the Session does not exist, we send an error response
        if (!await checkDependencies(res,req.params.id,null,null)){
            return;
        }

        let result = await Session.delete(req.params.id);
        // If the Session was deleted, we send a success response, otherwise we send an error response
        // can't test this line because can't find a way to make the database fail
        /* istanbul ignore next */
        if (result.status === 'error'){
            sendResponse(res, result.result, 400);
        }
        else{
            sendResponse(res, {id: Number(req.params.id)}, 200);
            app.emit('sessions',"deleted",{id: Number(req.params.id)},req);
        }
        }
    );




    async function checkDependencies(res,sessionsId=null,projectsId=null,usersLogin=null){
        // We check if the Session exists
        if (sessionsId !== null){
            if (!await Session.exists(sessionsId)){
                sendResponse(res, 'Session not found', 404);
                return false;
            }
        }
        // We check if the Project exists
        if (projectsId !== null){
            const Project = app.get('Project');
            if (!await Project.exists(projectsId)){
                sendResponse(res, 'Project not found', 404);
                return false;
            }
        }
        // We check if the User exists
        if (usersLogin !== null){
            const User = app.get('User');
            if (!await User.exists(usersLogin)){
                sendResponse(res, 'User not found', 404);
                return false;
            }
        }
        return true;
    }

}


