const sequelize = require('sequelize');
const {formatSequelizeResponse,show_check} = require('../utils');


module.exports = async (app) => {
    class Session {
        // We create the model for the session table in the database
        static model = app.get("db").define('session', {
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
            let result = null;
            try{
                result = await this.model.create({startTime: startTime, endTime: endTime, projectId: projectId, userLogin: userLogin});
            }
            catch(error){
                result = error;
            }
            return formatSequelizeResponse(result);
        }

        static async read(id) {
            // We read a session from the database
            let result = null
            try{
                result = await this.model.findByPk(id);
            }
            catch(e){
                result = e;
            }
            return formatSequelizeResponse(result);
        }

        static async readAll() {
            // We read all projects from the database
            let result = null;
            try{
                result = await this.model.findAll();
            }
            catch(e){
                result = e;
            }
            return formatSequelizeResponse(result);
        }

        static async update(id, data) {
            // We update a session in the database
            let result = null;
            try{
                result = await this.model.update(data, {where: {id: id}});
            }
            catch(e){
                result = e;
            }

            return formatSequelizeResponse(result);
        }

        static async delete(id) {
            // We delete a session from the database
            let result = null;
            try{
                result = await this.model.destroy({where: {id: id}});
            }
            catch(e){
                result = e;
            }
            return formatSequelizeResponse(result);
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
                result = e;
            }
            return formatSequelizeResponse(result);
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


        await Session.model.sync({force: true});





        show_check('Table creation/update [session]','OK');
    } catch (error) {
        show_check('Table creation/update [session]','KO',error);
        process.exit(1);
    }


    app.set('Session',Session);
};
