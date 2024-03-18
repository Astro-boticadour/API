const sequelize = require('sequelize');
const {formatSequelizeResponse,show_check,executeAndFormat} = require('../utils');


module.exports = async (app) => {
    class Project {
        // We create the model for the project table in the database
        static model = app.get("db").define('project', {
            id : {
                type: sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: sequelize.STRING,
                allowNull: false
            },
            dateDebut: {
                type: sequelize.DATE,
                // Format to use: YYYY/MM/DD
                allowNull: false
            },
            dateFin: {
                type: sequelize.DATE,
                allowNull: false
            },
            isClosed: {
                type: sequelize.BOOLEAN,
                defaultValue: false
            },
            description: {
                type: sequelize.STRING,
                allowNull: true
            },
        },
        {
            timestamps: false
          });


        static async create(name, dateDebut, dateFin, description) {
            // We create a new project in the database
            return await executeAndFormat(this.model,"create", { name, dateDebut, dateFin, description });
            // let result = null;
            // try{
            //     result = await this.model.create({ name, dateDebut, dateFin, description });
            // }
            // catch(error){
            //     result = error;
            // }
            // return formatSequelizeResponse(result);
        }

        static async read(id) {
            // We read a project from the database
            return await executeAndFormat(this.model,"findByPk", id);
            // let result = null
            // try{
            //     result = await this.model.findByPk(id);
            // }
            // catch(e){
            //     result = e;
            // }
            // return formatSequelizeResponse(result);
        }

        static async readAll() {
            // We read all projects from the database
            return await executeAndFormat(this.model,"findAll", {});
            // let result = null;
            // try{
            //     result = await this.model.findAll();
            // }
            // catch(e){
            //     result = e;
            // }
            // return formatSequelizeResponse(result);
        }

        static async update(id, data) {
            // We update a project in the database
            return await executeAndFormat(this.model,"update", data, {where: {id: id}});
            // let result = null;
            // try{
            //     result = await this.model.update(data, {where: {id: id}});
            // }
            // catch(e){
            //     result = e;
            // }

            // return formatSequelizeResponse(result);
        }

        static async delete(id) {
            // // We delete a project from the database
            return await executeAndFormat(this.model,"destroy", {where: {id: id}});
            // let result = null;
            // try{
            //     result = await this.model.destroy({where: {id: id}});
            // }
            // catch(e){
            //     result = e;
            // }
            // return formatSequelizeResponse(result);
        }

        static async exists(id) {
            let project = await this.read(id);
            if (project.result !== null) {
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
        await Project.model.sync({alter: true});
        show_check('Table creation/update [project]','OK');
    } catch (error) {
        /* istanbul ignore next */
        show_check('Table creation/update [project]','KO',error);
        /* istanbul ignore next */
        process.exit(1);
    }


    app.set('Project',Project);
};
