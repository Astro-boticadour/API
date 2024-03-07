const sequelize = require('sequelize');
const formatSequelizeResponse = require('../utils');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


module.exports = async (app) => {
    class Admin {
        // We create the model for the user table in the database
        static model = app.get("db").define('admins', {
            login: {
                type: sequelize.STRING,
                primaryKey: true,
            },
            password: {
                type: sequelize.STRING,
                allowNull: false
            }
        },
        {
            timestamps: false
          });


        static async create(login,password) {
            // We create a new admin in the database
            let result = null;
            try{
                result = await this.model.create({ login,password });
            }
            catch(error){
                result = error;
            }
            return formatSequelizeResponse(result);
        }

        static async read(login) {
            // We read a admins from the database
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
            // We read all admins from the database
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
            // We update an admin in the database
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
            // We delete an admin from the database
            let result = null;
            try{
                // We delete the user only if its not the last one
                let count = await this.model.count();
                if (count > 1){
                    result = await this.model.destroy({where: {login: login}});
                }
                else{
                    result = new Error('You cannot delete the last admin');
                }
            }
            catch(e){
                result = e;
            }
            return formatSequelizeResponse(result);
        }


        static async exists(login) {
            let admin = await this.read(login);
            if (admin.result !== null) {
                return true;
            }
            return false;

        }


        static async generateJWTToken(login) {
            // let duration = 25 * 365.25 * 24 * 60 * 60;
            let duration = app.get('config')['jwt']['duration'];
            const secret = app.get('config')['jwt']['secret'];
    
            let token = "";
    
            try {
                // Generate payload
                token = jwt.sign({ 
                    iss:  app.get('config')['jwt']['iss'], // Issuer (who signed the token)
                    sub:  login, // Subject (who the token is about)
                    exp: Math.floor(Date.now() / 1000) + duration, // Token expiry date (seconds since Unix epoch)
                }, secret);
    
            } catch (errorOnPayload) {
                console.error('Error on payload generation: ', errorOnPayload);
            }
            return token;
        }
        
    
    
        static async isPasswordValid(login, password) {
            let admin = await this.read(login);
            admin = admin.result;
            if (admin!=null) {
                let isPasswordValid = bcrypt.compareSync(password, admin.password);
                return isPasswordValid;
            }
            return false;
        }
    
        static async isTokenValid(token) {
            // On verifie que le token est valide (c'est asynchrone)
            async function isTokenValid(token, app) {
                const secret = app.get('config')['jwt']['secret'];
                try {
                    // On verifie que le token est valide
                    jwt.verify(token, secret);
                    return true;
                }
                catch (error) {
                    return false;
                }

            }
            
            // On attend le résultat
            let result = await isTokenValid(token, app);
            return result;
    
        }




    }

    // We create or update the table in the database
    try {
        // force true will drop the table if it already exists and create a new one
        // alter true will update the table if it already exists 
        // await Admin.model.sync({ force: true });
        await Admin.model.sync({alter: true});
        console.log('table creation/update [admin] : \x1b[32m%s\x1b[0m', 'OK')
        // If there is no admin, we create a default one
        let admin = await Admin.readAll();
        if (admin.result.length === 0) {
            let result = await Admin.create(app.get('config')['admin']['login'], bcrypt.hashSync(app.get('config')['admin']['password'], 10));
            if (result.status == "success") {
                console.log('Default admin creation : \x1b[32m%s\x1b[0m', 'OK')
            }
            else{
                console.error('Default admin creation : \x1b[31m%s\x1b[0m', 'KO\n> '+result.result);
                process.exit(1);
            }
        }
    } catch (error) {
        console.error('table creation/update [admin] : \x1b[31m%s\x1b[0m', 'KO\n> '+error);
        process.exit(1);
    }


    app.set('Admin',Admin);
};
