const sequelize = require('sequelize');
const {formatSequelizeResponse,show_check,executeAndFormat} = require('../utils');


module.exports = async (app) => {
    class Utilisation {
        // We create the model for the utilisation table in the database
        static model = app.get("db").define('utilisations', {
            id: {
                type: sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            usageStartDate: {
                type: sequelize.DATE,
                allowNull: false
            },
            usageEndDate: {
                type: sequelize.STRING,
                allowNull: true
            },
            sessionId: {
                type: sequelize.INTEGER,
                allowNull: false
            },
            ressourceId: {
                type: sequelize.INTEGER,
                allowNull: false
            },
        },
        {
            timestamps: false
          });


        static async create(usageStartDate, usageEndDate, sessionId, ressourceId) {
            // We create a new utilisation in the database
            let result = await executeAndFormat(this.model,"create", { usageStartDate, usageEndDate, sessionId, ressourceId });
            if (result.status === 'success') {
                result =  await this.read(result.result.id);
                app.emit('utilisation',"created", result.result);
            }
            return result;
        }

        static async read(id) {
            // We read a utilisation from the database
            return await executeAndFormat(this.model,"findByPk", id);

        }

        static async readAll(args = {}) {
            // We read all utilisations from the database
            return await executeAndFormat(this.model,"findAll", args);
        }

        static async update(id, data) {
            // We update an utilisation in the database
            let result = await executeAndFormat(this.model,"update", data, {where: {id: id}});
            if (result.status === 'success') {
                result =  await this.read(id);
                app.emit('utilisation',"updated", result.result);
            }
            return result; 

        }

        static async delete(id) {
            // We delete a utilisation from the database
            let result =  await executeAndFormat(this.model,"destroy", {where: {id: id}});
            if (result.status === 'success') {
                id = parseInt(id);
                app.emit('utilisation',"deleted",  {id : Number(id) });
            }
            return result;

        }


        static async exists(id) {
            let utilisation = await this.read(id);
            if (utilisation.result !== null) {
                return true;
            }
            return false;
        }


        static async is_finished(id) {
            let utilisation = await this.read(id);
            if (utilisation.result.usageEndDate !== null) {
                return true;
            }
            return false;
        }
    }

    // We create or update the table in the database
    try {
        // force true will drop the table if it already exists and create a new one
        // alter true will update the table if it already exists 
        // await Utilisation.model.sync({ force: true });
        const Ressource = app.get('Ressource');
        const Session = app.get('Session');
        Utilisation.model.belongsTo(Ressource.model, {foreignKey: 'ressourceId', targetKey: 'id', onDelete: 'cascade'});
        Utilisation.model.belongsTo(Session.model, {foreignKey: 'sessionId', targetKey: 'id', onDelete: 'cascade'});
        await Utilisation.model.sync({alter: true});
        show_check('Table creation/update [utilisation]','OK');
    } catch (error) {
        /* istanbul ignore next */
        show_check('Table creation/update [utilisation]','KO',error);
        /* istanbul ignore next */
        process.exit(1);
    }


    app.set('Utilisation',Utilisation);
};
