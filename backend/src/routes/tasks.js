const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Task, Project, User } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// @route   GET /api/tasks/project/:projectId
// @desc    Listar tarefas de um projeto
// @access  Private
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    // Verificar se o projeto pertence ao usuário
    const project = await Project.findOne({
      where: {
        id: req.params.projectId,
        ownerId: req.user.id,
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    const tasks = await Task.findAll({
      where: { projectId: req.params.projectId },
      include: [{
        model: User,
        as: 'assignedTo',
        attributes: ['id', 'name', 'email'],
        required: false
      }],
      order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json(tasks);
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    res.status(500).json({ message: 'Erro ao listar tarefas' });
  }
});

// @route   POST /api/tasks
// @desc    Criar nova tarefa
// @access  Private
router.post('/', [
  auth,
  body('title').trim().notEmpty().withMessage('Título da tarefa é obrigatório'),
  body('project').notEmpty().withMessage('Projeto é obrigatório'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verificar se o projeto pertence ao usuário
    const project = await Project.findOne({
      where: {
        id: req.body.project,
        ownerId: req.user.id,
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Contar tarefas no mesmo status para definir ordem
    const count = await Task.count({
      where: {
        projectId: req.body.project,
        status: req.body.status || 'todo',
      }
    });

    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      status: req.body.status || 'todo',
      projectId: req.body.project,
      order: count,
      assignedToId: req.body.assignedTo || null,
    });

    await task.reload({
      include: [{
        model: User,
        as: 'assignedTo',
        attributes: ['id', 'name', 'email'],
        required: false
      }]
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ message: 'Erro ao criar tarefa' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Atualizar tarefa
// @access  Private
router.put('/:id', [
  auth,
  body('title').optional().trim().notEmpty().withMessage('Título não pode ser vazio'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    // Verificar se o projeto pertence ao usuário
    const project = await Project.findOne({
      where: {
        id: task.projectId,
        ownerId: req.user.id,
      }
    });

    if (!project) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const { title, description, status, order, assignedTo } = req.body;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (order !== undefined) task.order = order;
    if (assignedTo !== undefined) task.assignedToId = assignedTo;

    await task.save();
    await task.reload({
      include: [{
        model: User,
        as: 'assignedTo',
        attributes: ['id', 'name', 'email'],
        required: false
      }]
    });

    res.json(task);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ message: 'Erro ao atualizar tarefa' });
  }
});

// @route   PUT /api/tasks/:id/move
// @desc    Mover tarefa entre colunas (drag and drop)
// @access  Private
router.put('/:id/move', [
  auth,
  body('status').isIn(['todo', 'in-progress', 'done']).withMessage('Status inválido'),
  body('order').isInt().withMessage('Ordem deve ser um número'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    // Verificar se o projeto pertence ao usuário
    const project = await Project.findOne({
      where: {
        id: task.projectId,
        ownerId: req.user.id,
      }
    });

    if (!project) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const { status, order } = req.body;
    const oldStatus = task.status;
    const oldOrder = task.order;

    // Se mudou de coluna, atualizar ordens das outras tarefas
    if (task.status !== status) {
      // Aumentar ordem das tarefas na nova coluna que estão na posição ou depois
      await Task.increment('order', {
        by: 1,
        where: {
          projectId: task.projectId,
          status: status,
          order: { [Op.gte]: order }
        }
      });

      // Diminuir ordem das tarefas na coluna antiga que estavam depois
      await Task.decrement('order', {
        by: 1,
        where: {
          projectId: task.projectId,
          status: oldStatus,
          order: { [Op.gt]: oldOrder }
        }
      });
    } else {
      // Mesma coluna, apenas reordenar
      if (oldOrder < order) {
        await Task.decrement('order', {
          by: 1,
          where: {
            projectId: task.projectId,
            status: status,
            order: { [Op.gt]: oldOrder, [Op.lte]: order }
          }
        });
      } else if (oldOrder > order) {
        await Task.increment('order', {
          by: 1,
          where: {
            projectId: task.projectId,
            status: status,
            order: { [Op.gte]: order, [Op.lt]: oldOrder }
          }
        });
      }
    }

    task.status = status;
    task.order = order;
    await task.save();
    await task.reload({
      include: [{
        model: User,
        as: 'assignedTo',
        attributes: ['id', 'name', 'email'],
        required: false
      }]
    });

    res.json(task);
  } catch (error) {
    console.error('Erro ao mover tarefa:', error);
    res.status(500).json({ message: 'Erro ao mover tarefa' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Deletar tarefa
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    // Verificar se o projeto pertence ao usuário
    const project = await Project.findOne({
      where: {
        id: task.projectId,
        ownerId: req.user.id,
      }
    });

    if (!project) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Ajustar ordem das tarefas restantes
    await Task.decrement('order', {
      by: 1,
      where: {
        projectId: task.projectId,
        status: task.status,
        order: { [Op.gt]: task.order }
      }
    });

    await task.destroy();

    res.json({ message: 'Tarefa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    res.status(500).json({ message: 'Erro ao deletar tarefa' });
  }
});

module.exports = router;
