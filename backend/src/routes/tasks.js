const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// @route   GET /api/tasks/project/:projectId
// @desc    Listar tarefas de um projeto
// @access  Private
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    // Verificar se o projeto pertence ao usuário
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .sort({ order: 1, createdAt: -1 });

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
      _id: req.body.project,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Contar tarefas no mesmo status para definir ordem
    const count = await Task.countDocuments({
      project: req.body.project,
      status: req.body.status || 'todo',
    });

    const task = new Task({
      title: req.body.title,
      description: req.body.description,
      status: req.body.status || 'todo',
      project: req.body.project,
      order: count,
      assignedTo: req.body.assignedTo,
    });

    await task.save();
    await task.populate('assignedTo', 'name email');

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

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    // Verificar se o projeto pertence ao usuário
    const project = await Project.findOne({
      _id: task.project,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const { title, description, status, order, assignedTo } = req.body;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (order !== undefined) task.order = order;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    await task.save();
    await task.populate('assignedTo', 'name email');

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

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    // Verificar se o projeto pertence ao usuário
    const project = await Project.findOne({
      _id: task.project,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const { status, order } = req.body;

    // Se mudou de coluna, atualizar ordens das outras tarefas
    if (task.status !== status) {
      // Aumentar ordem das tarefas na nova coluna que estão na posição ou depois
      await Task.updateMany(
        {
          project: task.project,
          status: status,
          order: { $gte: order },
        },
        { $inc: { order: 1 } }
      );

      // Diminuir ordem das tarefas na coluna antiga que estavam depois
      await Task.updateMany(
        {
          project: task.project,
          status: task.status,
          order: { $gt: task.order },
        },
        { $inc: { order: -1 } }
      );
    } else {
      // Mesma coluna, apenas reordenar
      const oldOrder = task.order;
      const newOrder = order;

      if (oldOrder < newOrder) {
        await Task.updateMany(
          {
            project: task.project,
            status: status,
            order: { $gt: oldOrder, $lte: newOrder },
          },
          { $inc: { order: -1 } }
        );
      } else if (oldOrder > newOrder) {
        await Task.updateMany(
          {
            project: task.project,
            status: status,
            order: { $gte: newOrder, $lt: oldOrder },
          },
          { $inc: { order: 1 } }
        );
      }
    }

    task.status = status;
    task.order = order;
    await task.save();
    await task.populate('assignedTo', 'name email');

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
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    // Verificar se o projeto pertence ao usuário
    const project = await Project.findOne({
      _id: task.project,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Ajustar ordem das tarefas restantes
    await Task.updateMany(
      {
        project: task.project,
        status: task.status,
        order: { $gt: task.order },
      },
      { $inc: { order: -1 } }
    );

    await Task.deleteOne({ _id: task._id });

    res.json({ message: 'Tarefa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    res.status(500).json({ message: 'Erro ao deletar tarefa' });
  }
});

module.exports = router;

