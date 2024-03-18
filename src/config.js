module.exports = async (app) => {
  app.set('config',
  {
    app : {
      port: process.env.PORT || 3000,
      env: process.env.NODE_ENV || 'development',
    },

    
    database : {
      db_name: process.env.DB_NAME || 'astro',
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'notSecureChangeMe',
      options: {
        host: process.env.DB_HOST || '192.168.0.202',
        dialect: 'mysql',
        logging: process.env.DB_LOGGING || false,
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
  