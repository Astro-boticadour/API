module.exports = async (app) => {
  app.set('config',
  {
    app : {
      port: 3000
    },

    
    database : {
      db_name: 'astro',
      username: 'root',
      password: 'notSecureChangeMe',
      options: {
        host: '192.168.0.202',
        dialect: 'mysql',
        logging: false
      }
    },
    jwt :{
      iss : 'Astro',
      secret : 'notSecureChangeMe',
      duration : 3600
    },

    admin : {
      login: 'admin',
      password: 'admin'
    }

})  
}
  