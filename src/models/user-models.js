const sequelize = require('sequelize');
const {formatSequelizeResponse,show_check} = require('../utils');


module.exports = async (app) => {
    class User {
        // We create the model for the user table in the database
        static model = app.get("db").define('user', {
            login: {
                type: sequelize.STRING,
                primaryKey: true,
            },
            firstName: {
                type: sequelize.STRING,
                allowNull: false
            },
            lastName: {
                type: sequelize.STRING,
                allowNull: false
            },
            pole: {
                type: sequelize.STRING,
                allowNull: false
            },
            
        },
        {
            timestamps: false
          });


        static async create(login, firstName, lastName, pole) {
            // We create a new user in the database
            let result = null;
            try{
                result = await this.model.create({ login, firstName, lastName, pole });
            }
            catch(error){
                result = error;
            }
            return formatSequelizeResponse(result);
        }

        static async read(login) {
            // We read a user from the database
            let result = null
            try{
                result = await this.model.findByPk(login);
            }
            catch(e){
                result = e;
            }
            return formatSequelizeResponse(result);
        }

        static async readAll() {
            // We read all users from the database
            let result = null;
            try{
                result = await this.model.findAll();
            }
            catch(e){
                result = e;
            }
            return formatSequelizeResponse(result);
        }

        static async update(login, data) {
            // We update a user in the database
            let result = null;
            try{
                result = await this.model.update(data, {where: {login: login}});
            }
            catch(e){
                result = e;
            }

            return formatSequelizeResponse(result);
        }

        static async delete(login) {
            // We delete a user from the database
            let result = null;
            try{
                result = await this.model.destroy({where: {login: login}});
            }
            catch(e){
                result = e;
            }
            return formatSequelizeResponse(result);
        }


        static async exists(login) {
            let user = await this.read(login);
            if (user.result !== null) {
                return true;
            }
            return false;

        }



    }

    // We create or update the table in the database
    try {
        // force true will drop the table if it already exists and create a new one
        // alter true will update the table if it already exists 
        // await User.model.sync({ force: true });
        await User.model.sync({alter: true});
        show_check('Table creation/update [user]','OK');
    } catch (error) {
        show_check('Table creation/update [user]','KO',error);
        process.exit(1);
    }


    app.set('User',User);
};
