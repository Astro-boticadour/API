const sequelize = require('sequelize');
const {formatSequelizeResponse,show_check,executeAndFormat} = require('../utils');


module.exports = async (app) => {
    class Ressource {
        // We create the model for the ressource table in the database
        static model = app.get("db").define('ressources', {
            id : {
                type: sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: sequelize.STRING,
                allowNull: false
            },
            type: {
                type: sequelize.STRING,
                allowNull: false
            },
            model: {
                type: sequelize.STRING,
                allowNull: false
            },
            isUsed: {
                type: sequelize.BOOLEAN,
                defaultValue: false
            },
        },
        {
            timestamps: false
          });


        static async create(name, type, model) {
            // We create a new ressource in the database
            let result = await executeAndFormat(this.model,"create", { name, type, model });
            if (result.status === 'success') {
                result =  await this.read(result.result.id);
                app.emit('ressources',"created", result.result);
            }
            return result;
        }

        static async read(id) {
            // We read a ressource from the database
            return await executeAndFormat(this.model,"findByPk", id);
        }

        static async readAll() {
            // We read all projects from the database
            return await executeAndFormat(this.model,"findAll", {});
        }

        static async update(id, data) {
            // We update a ressource in the database
            let result = await executeAndFormat(this.model,"update", data, {where: {id: id}});
            if (result.status === 'success') {
                result =  await this.read(id);
                app.emit('ressources',"updated", result.result);
            }
            return result;

        }

        static async delete(id) {
            // We delete a ressource from the database
            let result = await executeAndFormat(this.model,"destroy", {where: {id: id}});
            if (result.status === 'success') {
                app.emit('ressources',"deleted", id);
            }
            return result;
            
        }

        static async exists(id) {
            let ressource = await this.read(id);
            if (ressource.result !== null) {
                return true;
            }
            return false;

        }
        
        static async isUsed(id) {
            let ressource = await this.read(id);
            if (ressource.result.isUsed) {
                return true;
            }
            return false;
        }
        static async use(id) {
             await this.update(id,{isUsed: true});
        }

        static async free(id) {
            return await this.update(id,{isUsed: false});
        }


    }



    // We create or update the table in the database
    try {
        // force true will drop the table if it already exists and create a new one
        // alter true will update the table if it already exists 
        // await User.model.sync({ force: true });
        await Ressource.model.sync({alter: true});
        // await Ressource.use(1);
        await Ressource.free(1);
        await Ressource.free(1);
        show_check('Table creation/update [ressource]','OK');
    } catch (error) {
        /* istanbul ignore next */
        show_check('Table creation/update [ressource]','KO',error);
        /* istanbul ignore next */
        process.exit(1);
    }


    app.set('Ressource',Ressource);
};
