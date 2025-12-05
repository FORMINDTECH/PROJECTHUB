const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const auth = require('../middleware/auth');
const uploadAvatar = require('../middleware/uploadAvatar');
const fs = require('fs');
const path = require('path');

// Gerar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d',
  });
};

// @route   POST /api/auth/register
// @desc    Registrar novo usuário
// @access  Public
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Criar usuário
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    // Gerar token
    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        nickname: user.nickname,
      },
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
});

// @route   POST /api/auth/login
// @desc    Login de usuário
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Buscar usuário
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        nickname: user.nickname,
      },
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
});

// @route   GET /api/auth/me
// @desc    Obter usuário atual
// @access  Private
router.get('/me', auth, async (req, res) => {
    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        nickname: req.user.nickname,
        avatar: req.user.avatar,
      },
    });
});

// @route   PUT /api/auth/profile
// @desc    Atualizar perfil do usuário
// @access  Private
router.put('/profile', auth, [
  body('name').optional().trim().notEmpty().withMessage('Nome não pode ser vazio'),
  body('nickname').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, nickname } = req.body;
    const user = await User.findByPk(req.user.id);

    if (name) user.name = name;
    if (nickname !== undefined) user.nickname = nickname || null;

    await user.save();

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro ao atualizar perfil' });
  }
});

// @route   PUT /api/auth/change-email
// @desc    Trocar email do usuário
// @access  Private
router.put('/change-email', auth, [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória para confirmar'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findByPk(req.user.id);

    // Verificar senha atual
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }

    // Verificar se o novo email já está em uso
    const existingUser = await User.findOne({ 
      where: { 
        email: email.toLowerCase(),
        id: { [require('sequelize').Op.ne]: user.id }
      } 
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    user.email = email.toLowerCase();
    await user.save();

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Erro ao trocar email:', error);
    res.status(500).json({ message: 'Erro ao trocar email' });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Trocar senha do usuário
// @access  Private
router.put('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    // Verificar senha atual
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Senha atual incorreta' });
    }

    // Atualizar senha (o hook beforeUpdate vai fazer o hash)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao trocar senha:', error);
    res.status(500).json({ message: 'Erro ao trocar senha' });
  }
});

// @route   POST /api/auth/avatar
// @desc    Upload de foto de perfil
// @access  Private
router.post('/avatar', auth, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma imagem enviada' });
    }

    const user = await User.findByPk(req.user.id);

    // Deletar avatar antigo se existir
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../../uploads', user.avatar.replace('/uploads/', ''));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error);
    res.status(500).json({ message: 'Erro ao fazer upload do avatar' });
  }
});

// @route   DELETE /api/auth/avatar
// @desc    Remover foto de perfil
// @access  Private
router.delete('/avatar', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (user.avatar) {
      const avatarPath = path.join(__dirname, '../../uploads', user.avatar.replace('/uploads/', ''));
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    user.avatar = null;
    await user.save();

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Erro ao remover avatar:', error);
    res.status(500).json({ message: 'Erro ao remover avatar' });
  }
});

module.exports = router;
