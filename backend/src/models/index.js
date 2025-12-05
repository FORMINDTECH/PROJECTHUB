const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');
const ProjectMember = require('./ProjectMember');

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

module.exports = {
  User,
  Project,
  Task,
  ProjectMember
};


