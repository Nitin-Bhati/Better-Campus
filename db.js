const { Sequelize } = require('sequelize');  // Import Sequelize library

// Create a new Sequelize instance without a password
const sequelize = new Sequelize('better_campus_db', 'root', '', {  // Empty string for no password
  host: 'localhost',  // For local MySQL instance
  dialect: 'mysql',   // Specify MySQL
  logging: false,     // Optional: Disable logs for cleaner output
});

module.exports = sequelize;  // Export for use in other files