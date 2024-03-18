
const Utils = require('./utils');

module.exports = async (app) => {
    Utils.show_check('TESTING show_check', 'OK');
    Utils.show_check('TESTING show_check', 'KO', new Error('error message'));
    Utils.show_log('log','TESTING show_log',"test");
    Utils.show_log('info','TESTING show_log',"test");
    Utils.show_log('warn','TESTING show_log',"test");
    Utils.show_log('error','TESTING show_log',"test", "error message");
    

    // We test the admin model here because we cannot test it in the admin route
    const Admin = app.get('Admin');
    await Admin.create({});
    await Admin.read('NoAdmin');
    await Admin.readAll();
    await Admin.update('admin',{});
    await Admin.delete('admin');
    await Admin.create('admin2','password');
    await Admin.delete('admin2');
    await Admin.exists('admin');
    await Admin.exists('admin2');
    await Admin.isPasswordValid('admin2','password');



};
