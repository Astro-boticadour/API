const sequelize = require('sequelize');
const {show_check, show_log} = require('./utils');


// On export une fonction qui prend en parametre l'app express et y defini une classe User
module.exports = async (app) => {
    const config = app.get('config');
    // We create a new instance of sequelize without the database name to test the connection to the database
    // And create the database if it does not exist
    const dbTest = new sequelize("",config.database.username,config.database.password,config.database.options);
    try {
        await dbTest.authenticate();
        show_check('Connection to the database ['+config.database.options.host+']','OK');
    } catch (error) {
        show_check('Connection to the database ['+config.database.options.host+']','KO',error);
        process.exit(1);
    }

    // We create the database if it does not exist
    try {
        await dbTest.query('CREATE DATABASE IF NOT EXISTS '+config.database.db_name);
        show_check('Database check/creation ['+config.database.db_name+']','OK');
    } catch (error) {
        show_check('Database check/creation ['+config.database.db_name+']','KO',error);
        process.exit(1);
    }

    delete dbTest;
    const db = new sequelize(
        config.database.db_name,
        config.database.username,
        config.database.password,
        config.database.options);
    app.set('db',db);
};
