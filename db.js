const { Sequelize } = require('sequelize'); 


const sequelize = new Sequelize('better_campus_db', 'root', '', {  
  host: 'localhost', 
  dialect: 'mysql',   
  logging: false,     
});

module.exports = sequelize;  
