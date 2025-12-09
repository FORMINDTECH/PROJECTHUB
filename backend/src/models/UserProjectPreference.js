const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserProjectPreference = sequelize.define('UserProjectPreference', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'user_id'
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    },
    field: 'project_id'
  },
  isFavorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'is_favorite'
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  tableName: 'user_project_preferences',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'project_id']
    }
  ]
});

module.exports = UserProjectPreference;


