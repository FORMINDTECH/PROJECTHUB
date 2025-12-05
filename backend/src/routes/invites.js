const express = require('express');
const router = express.Router();
const { ProjectInvite, Project, User, ProjectMember } = require('../models');
const auth = require('../middleware/auth');

// @route   GET /api/invites
// @desc    Listar convites recebidos pelo usuário
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const invites = await ProjectInvite.findAll({
      where: {
        userId: req.user.id,
        status: 'pending'
      },
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'description', 'color', 'logo'],
          include: [{
            model: User,
            as: 'owner',
            attributes: ['id', 'name', 'nickname', 'avatar']
          }]
        },
        {
          model: User,
          as: 'inviter',
          attributes: ['id', 'name', 'nickname', 'avatar']
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

// @route   POST /api/invites/:id/accept
// @desc    Aceitar convite
// @access  Private
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const invite = await ProjectInvite.findByPk(req.params.id, {
      include: [{
        model: Project,
        as: 'project'
      }]
    });

    if (!invite) {
      return res.status(404).json({ message: 'Convite não encontrado' });
    }

    if (invite.userId !== req.user.id) {
      return res.status(403).json({ message: 'Você não tem permissão para aceitar este convite' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ message: 'Este convite já foi processado' });
    }

    // Verificar se já é membro
    const existingMember = await ProjectMember.findOne({
      where: {
        projectId: invite.projectId,
        userId: invite.userId
      }
    });

    if (existingMember) {
      // Se já é membro, apenas marcar o convite como aceito
      invite.status = 'accepted';
      await invite.save();
      return res.json({ message: 'Você já é membro deste projeto' });
    }

    // Adicionar como membro
    await ProjectMember.create({
      projectId: invite.projectId,
      userId: invite.userId
    });

    // Marcar convite como aceito
    invite.status = 'accepted';
    await invite.save();

    res.json({ message: 'Convite aceito com sucesso' });
  } catch (error) {
    console.error('Erro ao aceitar convite:', error);
    res.status(500).json({ message: 'Erro ao aceitar convite' });
  }
});

// @route   POST /api/invites/:id/decline
// @desc    Recusar convite
// @access  Private
router.post('/:id/decline', auth, async (req, res) => {
  try {
    const invite = await ProjectInvite.findByPk(req.params.id);

    if (!invite) {
      return res.status(404).json({ message: 'Convite não encontrado' });
    }

    if (invite.userId !== req.user.id) {
      return res.status(403).json({ message: 'Você não tem permissão para recusar este convite' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ message: 'Este convite já foi processado' });
    }

    invite.status = 'declined';
    await invite.save();

    res.json({ message: 'Convite recusado' });
  } catch (error) {
    console.error('Erro ao recusar convite:', error);
    res.status(500).json({ message: 'Erro ao recusar convite' });
  }
});

module.exports = router;

