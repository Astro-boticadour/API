const sequelize = require('sequelize');

// On export une fonction qui prend en parametre l'app express et y defini une classe User
module.exports = async (app) => {
    const config = app.get('config');
    // We create a new instance of sequelize without the database name to test the connection to the database
    // And create the database if it does not exist
    const dbTest = new sequelize("",config.database.username,config.database.password,config.database.options);
    try {
        await dbTest.authenticate();
        console.log('Connection to the database ['+config.database.options.host+'] : \x1b[32m%s\x1b[0m', 'OK')
    } catch (error) {
        console.error('Connection to the database ['+config.database.options.host+'] : \x1b[31m%s\x1b[0m', 'KO\n> '+error);
        process.exit(1);
    }

    // We create the database if it does not exist
    try {
        await dbTest.query('CREATE DATABASE IF NOT EXISTS '+config.database.db_name);
        console.log('Database check/creation ['+config.database.db_name+'] : \x1b[32m%s\x1b[0m', 'OK')
    } catch (error) {
        console.error('Database check/creation : \x1b[31m%s\x1b[0m', 'KO\n> '+error);
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
