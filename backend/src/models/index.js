const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');
const ProjectMember = require('./ProjectMember');
const ProjectInvite = require('./ProjectInvite');

// Definir relacionamentos
User.hasMany(Project, { foreignKey: 'ownerId', as: 'ownedProjects' });
Project.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// Relacionamento muitos-para-muitos entre User e Project
User.belongsToMany(Project, { 
  through: ProjectMember, 
  foreignKey: 'userId', 
  as: 'projects' 
});
Project.belongsToMany(User, { 
  through: ProjectMember, 
  foreignKey: 'projectId', 
  as: 'members' 
});

Project.hasMany(ProjectMember, { foreignKey: 'projectId', as: 'projectMembers' });
ProjectMember.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
ProjectMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

User.hasMany(Task, { foreignKey: 'assignedToId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignedTo' });

// Relacionamentos para ProjectInvite
Project.hasMany(ProjectInvite, { foreignKey: 'projectId', as: 'invites' });
ProjectInvite.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

User.hasMany(ProjectInvite, { foreignKey: 'userId', as: 'receivedInvites' });
ProjectInvite.belongsTo(User, { foreignKey: 'userId', as: 'invitedUser' });

User.hasMany(ProjectInvite, { foreignKey: 'inviterId', as: 'sentInvites' });
ProjectInvite.belongsTo(User, { foreignKey: 'inviterId', as: 'inviter' });

module.exports = {
  User,
  Project,
  Task,
  ProjectMember,
  ProjectInvite
};


