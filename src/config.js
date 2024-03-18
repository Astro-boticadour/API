module.exports = async (app) => {
  app.set('config',
  {
    app : {
      port: process.env.PORT || 3000,
      env: process.env.NODE_ENV || 'development',
    },

    
    database : {
      db_name: 'db',
      username: 'root',
      password: 'notSecureChangeMe',
      options: {
        host: 'localhost',
        dialect: 'mysql' ,
        logging : process.env.DB_LOGGING || false
      }
    },
    jwt :{
      iss : 'Astro',
      secret : process.env.JWT_SECRET || 'secret',
      duration : Number(process.env.JWT_DURATION) || 3600
    },

    admin : {
      login: process.env.ADMIN_LOGIN || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin',
    }

})  
}
  