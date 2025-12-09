const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Project, Task, ProjectMember, User, ProjectInvite } = require('../models');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { Op } = require('sequelize');

// @route   GET /api/projects
// @desc    Listar projetos do usuário (como owner ou member)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Buscar projetos onde o usuário é owner ou member
    const ownedProjects = await Project.findAll({
      where: { ownerId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    const memberProjects = await Project.findAll({
      include: [{
        model: ProjectMember,
        as: 'projectMembers',
        where: { userId: req.user.id },
        required: true
      }],
      order: [['createdAt', 'DESC']]
    });

    // Combinar e remover duplicatas
    const allProjects = [...ownedProjects];
    memberProjects.forEach(mp => {
      if (!allProjects.find(p => p.id === mp.id)) {
        allProjects.push(mp);
      }
    });

    res.json(allProjects);
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    res.status(500).json({ message: 'Erro ao listar projetos' });
  }
});

// Helper function para verificar se usuário tem acesso ao projeto
const hasProjectAccess = async (projectId, userId) => {
  const project = await Project.findByPk(projectId, {
    include: [{
      model: ProjectMember,
      as: 'projectMembers',
      where: { userId },
      required: false
    }]
  });

  if (!project) return false;
  if (project.ownerId === userId) return true;
  if (project.projectMembers && project.projectMembers.length > 0) return true;
  return false;
};

// @route   GET /api/projects/:id
// @desc    Obter projeto específico
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const hasAccess = await hasProjectAccess(req.params.id, req.user.id);
    if (!hasAccess) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    const project = await Project.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'members',
        attributes: ['id', 'name', 'email', 'nickname', 'avatar'],
        through: { attributes: [] }
      }, {
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email', 'nickname']
      }]
    });

    res.json(project);
  } catch (error) {
    console.error('Erro ao obter projeto:', error);
    res.status(500).json({ message: 'Erro ao obter projeto' });
  }
});

// @route   POST /api/projects
// @desc    Criar novo projeto
// @access  Private
router.post('/', [
  auth,
  upload.single('logo'),
], async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    // Validação manual (funciona tanto para FormData quanto JSON)
    if (!name || (typeof name === 'string' && name.trim() === '')) {
      return res.status(400).json({ message: 'Nome do projeto é obrigatório' });
    }

    const logoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const project = await Project.create({
      name: typeof name === 'string' ? name.trim() : name,
      description: description || null,
      color: color || '#6366f1',
      logo: logoPath,
      ownerId: req.user.id,
    });

    // Adicionar o owner como membro também
    await ProjectMember.create({
      projectId: project.id,
      userId: req.user.id
    });

    await project.reload({
      include: [{
        model: User,
        as: 'members',
        attributes: ['id', 'name', 'email', 'nickname', 'avatar'],
        through: { attributes: [] }
      }]
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ message: error.message || 'Erro ao criar projeto' });
  }
});

// @route   PUT /api/projects/:id
// @desc    Atualizar projeto
// @access  Private
router.put('/:id', [
  auth,
  body('name').optional().trim().notEmpty().withMessage('Nome não pode ser vazio'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Apenas o owner pode atualizar
    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Apenas o dono do projeto pode atualizá-lo' });
    }

    const { name, description, color } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (color) project.color = color;

    await project.save();
    res.json(project);
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({ message: 'Erro ao atualizar projeto' });
  }
});

// @route   POST /api/projects/:id/logo
// @desc    Upload de logo do projeto
// @access  Private
router.post('/:id/logo', auth, upload.single('logo'), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Apenas o owner pode fazer upload
    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Apenas o dono do projeto pode fazer upload' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma imagem enviada' });
    }

    project.logo = `/uploads/${req.file.filename}`;
    await project.save();

    res.json(project);
  } catch (error) {
    console.error('Erro ao fazer upload do logo:', error);
    res.status(500).json({ message: 'Erro ao fazer upload do logo' });
  }
});

// @route   DELETE /api/projects/:id/logo
// @desc    Remover logo do projeto
// @access  Private
router.delete('/:id/logo', auth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Apenas o owner pode remover logo
    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Apenas o dono do projeto pode remover o logo' });
    }

    project.logo = null;
    await project.save();

    res.json(project);
  } catch (error) {
    console.error('Erro ao remover logo:', error);
    res.status(500).json({ message: 'Erro ao remover logo' });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Deletar projeto
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Apenas o owner pode deletar
    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Apenas o dono do projeto pode deletá-lo' });
    }

    // Deletar todas as tarefas do projeto
    await Task.destroy({ where: { projectId: project.id } });

    // Deletar todos os membros
    await ProjectMember.destroy({ where: { projectId: project.id } });

    // Deletar projeto
    await project.destroy();

    res.json({ message: 'Projeto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    res.status(500).json({ message: 'Erro ao deletar projeto' });
  }
});

// @route   POST /api/projects/:id/members
// @desc    Adicionar membro ao projeto (DEPRECATED - usar invites)
// @access  Private (apenas owner)
router.post('/:id/members', [
  auth,
  body('email').isEmail().withMessage('Email inválido'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Apenas o owner pode adicionar membros
    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Apenas o dono do projeto pode adicionar membros' });
    }

    // Buscar usuário por email
    const user = await User.findOne({ where: { email: req.body.email.toLowerCase() } });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Não pode adicionar o próprio owner
    if (user.id === project.ownerId) {
      return res.status(400).json({ message: 'O dono do projeto já é membro' });
    }

    // Verificar se já é membro
    const existingMember = await ProjectMember.findOne({
      where: { projectId: project.id, userId: user.id }
    });
    if (existingMember) {
      return res.status(400).json({ message: 'Usuário já é membro do projeto' });
    }

    await ProjectMember.create({
      projectId: project.id,
      userId: user.id
    });

    const member = await User.findByPk(user.id, {
      attributes: ['id', 'name', 'email', 'nickname']
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Erro ao adicionar membro:', error);
    res.status(500).json({ message: 'Erro ao adicionar membro' });
  }
});

// @route   POST /api/projects/:id/invites
// @desc    Enviar convite para o projeto
// @access  Private (apenas owner)
router.post('/:id/invites', [
  auth,
  body('email').isEmail().withMessage('Email inválido'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Apenas o owner pode enviar convites
    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Apenas o dono do projeto pode enviar convites' });
    }

    // Buscar usuário por email
    const user = await User.findOne({ where: { email: req.body.email.toLowerCase() } });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Não pode convidar o próprio owner
    if (user.id === project.ownerId) {
      return res.status(400).json({ message: 'O dono do projeto já é membro' });
    }

    // Verificar se já é membro
    const existingMember = await ProjectMember.findOne({
      where: { projectId: project.id, userId: user.id }
    });
    if (existingMember) {
      return res.status(400).json({ message: 'Usuário já é membro do projeto' });
    }

    // Verificar se já existe convite pendente
    const existingInvite = await ProjectInvite.findOne({
      where: {
        projectId: project.id,
        userId: user.id,
        status: 'pending'
      }
    });

    if (existingInvite) {
      return res.status(400).json({ message: 'Já existe um convite pendente para este usuário' });
    }

    // Criar convite
    const invite = await ProjectInvite.create({
      projectId: project.id,
      userId: user.id,
      inviterId: req.user.id,
      status: 'pending'
    });

    // Carregar dados completos do convite
    await invite.reload({
      include: [
        {
          model: User,
          as: 'invitedUser',
          attributes: ['id', 'name', 'email', 'nickname', 'avatar']
        },
        {
          model: User,
          as: 'inviter',
          attributes: ['id', 'name', 'nickname', 'avatar']
        }
      ]
    });

    res.status(201).json(invite);
  } catch (error) {
    console.error('Erro ao enviar convite:', error);
    res.status(500).json({ message: 'Erro ao enviar convite' });
  }
});

// @route   GET /api/projects/:id/invites
// @desc    Listar convites pendentes do projeto
// @access  Private (apenas owner)
router.get('/:id/invites', auth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Apenas o owner pode ver convites
    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Apenas o dono do projeto pode ver convites' });
    }

    const invites = await ProjectInvite.findAll({
      where: {
        projectId: project.id,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'invitedUser',
          attributes: ['id', 'name', 'email', 'nickname', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(invites);
  } catch (error) {
    console.error('Erro ao listar convites:', error);
    res.status(500).json({ message: 'Erro ao listar convites' });
  }
});

// @route   DELETE /api/projects/:id/members/:userId
// @desc    Remover membro do projeto
// @access  Private (apenas owner)
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Apenas o owner pode remover membros
    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Apenas o dono do projeto pode remover membros' });
    }

    const member = await ProjectMember.findOne({
      where: { projectId: project.id, userId: req.params.userId }
    });

    if (!member) {
      return res.status(404).json({ message: 'Membro não encontrado' });
    }

    await member.destroy();
    res.json({ message: 'Membro removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover membro:', error);
    res.status(500).json({ message: 'Erro ao remover membro' });
  }
});

// @route   GET /api/projects/:id/members
// @desc    Listar membros do projeto
// @access  Private
router.get('/:id/members', auth, async (req, res) => {
  try {
    const hasAccess = await hasProjectAccess(req.params.id, req.user.id);
    if (!hasAccess) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    const members = await ProjectMember.findAll({
      where: { projectId: req.params.id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'nickname', 'avatar']
      }]
    });

    res.json(members.map(m => m.user));
  } catch (error) {
    console.error('Erro ao listar membros:', error);
    res.status(500).json({ message: 'Erro ao listar membros' });
  }
});

module.exports = router;
