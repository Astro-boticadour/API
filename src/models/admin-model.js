const sequelize = require('sequelize');
const {formatSequelizeResponse,show_check, show_log,executeAndFormat} = require('../utils');
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
            // We create an admin in the database
            return await executeAndFormat(this.model,"create", {login: login, password: password});
        }


        static async read(login) {
            // We read a admins from the database
            return await executeAndFormat(this.model,"findByPk", login);
        }

        static async readAll(args={}) {
            // We read all admins from the database
            return await executeAndFormat(this.model,"findAll", args);
        }

        static async update(login, data) {
            // We update an admin in the database
            return await executeAndFormat(this.model,"update", data, {where: {login: login}});
        }

        static async delete(login) {
            // We delete an admin from the database
            // We need to make sure that the admin is not the last one
            let admin = await this.read(login);
            admin = admin.result;
            let allAdmins = await this.readAll();
            allAdmins = allAdmins.result;
            if (admin!=null && allAdmins.length > 1) {
                return await executeAndFormat(this.model,"destroy", {where: {login: login}});
            }
            else{
                return formatSequelizeResponse(new Error('You cannot delete the last admin'));
            }
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
                // Impossible to test
                /* istanbul ignore next */
                show_log('ERROR','Error on payload generation: ', errorOnPayload);

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
    
        static async isAuthentified(AuthorizationHeader) {
            // We check if the Authorization header is a Bearer token and if its valid
            if (AuthorizationHeader && AuthorizationHeader.startsWith('Bearer ')) {
                try {
                    let token = AuthorizationHeader.slice(7);
                    const secret = app.get('config')['jwt']['secret'];
                    jwt.verify(token, secret);
                    return true;
                }
                catch (error) {
                    /* istanbul ignore next */
                    return false;
                }
            }
            else if (AuthorizationHeader && AuthorizationHeader.startsWith('Basic ')) {
                // We check if the Authorization header is a Basic auth and if its valid
                let credentials = Buffer.from(AuthorizationHeader.slice(6), 'base64').toString();
                let [login, password] = credentials.split(':');
                return await this.isPasswordValid(login, password);
            }

            else {
                return false;
            }
        }
    }

    // We create or update the table in the database
    try {
        // force true will drop the table if it already exists and create a new one
        // alter true will update the table if it already exists 
        // await Admin.model.sync({ force: true });
        await Admin.model.sync({alter: true});
        // If there is no admin, we create a default one
        let admin = await Admin.readAll();
        if (admin.result.length === 0) {
            let result = await Admin.create(app.get('config').admin.login, bcrypt.hashSync(app.get('config')['admin']['password'], 10));
            if (result.status == "success") {
                show_check('Default admin creation','OK');
            }
            else{
                /* istanbul ignore next */
                show_check('Default admin creation','KO');
                /* istanbul ignore next */
                process.exit(1);
            }
        }
        show_check('table creation/update [admin]','OK');
    } catch (error) {
        /* istanbul ignore next */
        show_check('table creation/update [admin]','KO',error);
        /* istanbul ignore next */
        process.exit(1);
    }


    app.set('Admin',Admin);
};
