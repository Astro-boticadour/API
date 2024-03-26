const sequelize = require('sequelize');
const {formatSequelizeResponse,show_check,executeAndFormat} = require('../utils');


module.exports = async (app) => {
    class Session {
        // We create the model for the session table in the database
        static model = app.get("db").define('sessions', {
            id : {
                type: sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            startTime : {
                type: sequelize.DATE,
                allowNull: false
            },
            endTime : {
                type: sequelize.DATE,
                allowNull: true
            },
            // We use a foreign key to link the session to a project 
            projectId : {
                type: sequelize.INTEGER,
                allowNull: false
            },
            // We use a foreign key to link the session to a user
            userLogin : {
                type: sequelize.STRING,
                allowNull: false
            },

        },
        {
            timestamps: false
        });



        static async create(startTime, endTime, projectId, userLogin) {
            // We create a new session in the database
            let result =  await executeAndFormat(this.model,"create", { startTime, endTime, projectId, userLogin });
            if (result.status === 'success') {
                result =  await this.read(result.result.id);
                app.emit('sessions',"created", result.result);
            }
            return result;
        }

        static async read(id) {
            // We read a session from the database
            return await executeAndFormat(this.model,"findByPk", id);
        }

        static async readAll(args={}) {
            // We read all projects from the database
            return await executeAndFormat(this.model,"findAll", args);
        }

        static async update(id, data) {
            // We update a session in the database
            let result = await executeAndFormat(this.model,"update", data, {where: {id: id}});
            if (result.status === 'success') {
                result =  await this.read(id);
                app.emit('sessions',"updated", result.result);
            }
            return result;
        }

        static async delete(id) {
            // We delete a session from the database
            let result = await executeAndFormat(this.model,"destroy", {where: {id: id}});
            if (result.status === 'success') {
                app.emit('sessions',"deleted",  {id : Number(id) });
            }
            return result;
        }

        static async exists(id) {
            let session = await this.read(id);
            if (session.result !== null) {
                return true;
            }
            return false;

        }

        static async is_closed(id) {
            let session = await this.read(id);
            if (session.result.endTime !== null) {
                return true;
            }
            return false;

        }

        static async get_user_active_sessions(login) {
            let result = null;
            try{
                result = await this.model.findAll({where: {userLogin: login, endTime: null}});
            }
            catch(e){
                /* istanbul ignore next */
                result = e;
            }
            return formatSequelizeResponse(result);
        }

        static async readAllFromUser(login) {
            // We read all sessions from the database
            return await executeAndFormat(this.model,"findAll", {where: {userLogin: login}});
        }

        static async get_session_usage(sessionId) {
            const Utilisation = app.get("Utilisation");
            let result = await Utilisation.readAll({where: {sessionId: sessionId, usageEndDate: null}});
            return result;
        }

        /*istanbul ignore next */
        static async close(id, endTime) {
            // We check if the session has usage that is not finished
            const Utilisation = app.get("Utilisation");
            let result = await Utilisation.readAll({where: {sessionId: id, usageEndDate: null}});
            if (result.status === 'success') {
                let usage = result.result;
                for (let i = 0; i < usage.length; i++) {
                    let utilisation = usage[i];
                    await Utilisation.update(utilisation.id, {usageEndDate: endTime});
                    // We also set the ressource as available
                    const Ressource = app.get("Ressource");
                    await Ressource.free(utilisation.ressourceId);
                }
            }
            result = await this.update(id, {endTime});
            result = await this.read(id);
            if (result.status === 'success') {
                app.emit('sessions',"updated", result.result);
            }
            return result;
            
        }


        /*istanbul ignore next */
        static async closeAllSessions() {
            const now = new Date(new Date() - new Date().getTimezoneOffset() * 60 * 1000).toISOString();

            // We get all the active sessions
            let active_sessions = await this.model.findAll({where: {endTime: null}});
            // We get the usage of all the active sessions
            // We close all the active sessions
            for (let i = 0; i < active_sessions.length; i++) {
                let session = active_sessions[i];
                await this.close(session.id, now);
            }
            return active_sessions;
        }

    }



    // We create or update the table in the database
    try {
        // force true will drop the table if it already exists and create a new one
        // alter true will update the table if it already exists 
        // await User.model.sync({ force: true });


        // We run the association method to link the session to the user and the project
        const User = app.get('User');
        const Project = app.get('Project');
        Session.model.belongsTo(User.model, {foreignKey: 'userLogin', targetKey: 'login', onDelete: 'CASCADE'});
        Session.model.belongsTo(Project.model, {foreignKey: 'projectId', targetKey: 'id', onDelete: 'CASCADE'});
        await Session.model.sync({alter: true});
        show_check('Table creation/update [session]','OK');
    } 
    catch (error) {
        /* istanbul ignore next */
        show_check('Table creation/update [session]','KO',error);
        /* istanbul ignore next */
        process.exit(1);
    }


    app.set('Session',Session);
};
