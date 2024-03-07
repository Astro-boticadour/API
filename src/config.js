module.exports = async (app) => {
  console.log('config')
  app.set('config',
  {
    database : {
      db_name: 'astro',
      username: 'root',
      password: 'notSecureChangeMe',
      options: {
        host: '192.168.0.202',
        dialect: 'mysql' 
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
  