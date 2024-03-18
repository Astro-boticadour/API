const sequelize = require('sequelize');
const {formatSequelizeResponse,show_check,executeAndFormat} = require('../utils');


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
            return await executeAndFormat(this.model,"create", { login, firstName, lastName, pole });
        }

        static async read(login) {
            // We read a user from the database
            return await executeAndFormat(this.model,"findByPk", login);

        }

        static async readAll() {
            // We read all users from the database
            return await executeAndFormat(this.model,"findAll", {});
        }

        static async update(login, data) {
            // We update a user in the database
            return await executeAndFormat(this.model,"update", data, {where: {login: login}});
        }

        static async delete(login) {
            // We delete a user from the database
            return await executeAndFormat(this.model,"destroy", {where: {login: login}});
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
        /* istanbul ignore next */
        show_check('Table creation/update [user]','KO',error);
        /* istanbul ignore next */
        process.exit(1);
    }


    app.set('User',User);
};
