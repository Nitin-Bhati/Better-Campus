const { DataTypes } = require('sequelize');
const sequelize = require('../db');  // Import the Sequelize instance from db.js

const Post = sequelize.define('Post', {
  userId: {
    type: DataTypes.STRING,
    allowNull: false  // Assuming a user ID; replace as needed
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Post;  // Export the model for use in other files

