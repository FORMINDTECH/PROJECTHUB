const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProjectInvite = sequelize.define('ProjectInvite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'user_id'
  },
  inviterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'inviter_id'
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined'),
    defaultValue: 'pending',
    allowNull: false
  }
}, {
  tableName: 'project_invites',
  timestamps: true,
  underscored: true,
  indexes: []
});

module.exports = ProjectInvite;

