const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/projects
// @desc    Listar projetos do usuário
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user._id })
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    res.status(500).json({ message: 'Erro ao listar projetos' });
  }
});

// @route   GET /api/projects/:id
// @desc    Obter projeto específico
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

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
  body('name').trim().notEmpty().withMessage('Nome do projeto é obrigatório'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, color } = req.body;

    const project = new Project({
      name,
      description,
      color: color || '#6366f1',
      owner: req.user._id,
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ message: 'Erro ao criar projeto' });
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

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
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
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
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

// @route   DELETE /api/projects/:id
// @desc    Deletar projeto
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Deletar todas as tarefas do projeto
    await Task.deleteMany({ project: project._id });

    // Deletar projeto
    await Project.deleteOne({ _id: project._id });

    res.json({ message: 'Projeto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    res.status(500).json({ message: 'Erro ao deletar projeto' });
  }
});

module.exports = router;

