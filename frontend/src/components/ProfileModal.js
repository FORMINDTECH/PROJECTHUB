import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import SuccessModal from './SuccessModal';
import ErrorModal from './ErrorModal';
import ConfirmModal from './ConfirmModal';
import './ProfileModal.css';

const ProfileModal = ({ onClose }) => {
  const { user, setUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'email', 'password'
  
  // Perfil
  const [name, setName] = useState(user?.name || '');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [errorProfile, setErrorProfile] = useState('');
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: null });

  // Atualizar preview do avatar quando o usuário mudar
  useEffect(() => {
    if (user?.avatar) {
      setAvatarPreview(`http://localhost:5000${user.avatar}`);
    } else {
      setAvatarPreview(null);
    }
  }, [user?.avatar]);

  // Email
  const [email, setEmail] = useState(user?.email || '');
  const [passwordForEmail, setPasswordForEmail] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [errorEmail, setErrorEmail] = useState('');

  // Senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState('');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setConfirmModal({
      isOpen: true,
      onConfirm: async () => {
        setLoadingAvatar(true);
        try {
          const response = await api.delete('/auth/avatar');
          setUser(response.data.user);
          setAvatarPreview(null);
          setAvatarFile(null);
          setSuccessModal({ isOpen: true, message: 'Foto de perfil removida com sucesso!' });
        } catch (error) {
          setErrorModal({ isOpen: true, message: error.response?.data?.message || 'Erro ao remover foto' });
        } finally {
          setLoadingAvatar(false);
        }
      }
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setErrorProfile('');
    setLoadingProfile(true);

    try {
      // Se houver avatarFile, fazer upload primeiro
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const avatarResponse = await api.post('/auth/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setUser(avatarResponse.data.user);
        setAvatarFile(null);
      }

      // Atualizar perfil
      const response = await api.put('/auth/profile', { name, nickname: nickname || null });
      setUser(response.data.user);
      setSuccessModal({ isOpen: true, message: 'Perfil atualizado com sucesso!' });
    } catch (error) {
      setErrorProfile(error.response?.data?.message || 'Erro ao atualizar perfil');
      setErrorModal({ isOpen: true, message: error.response?.data?.message || 'Erro ao atualizar perfil' });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setErrorEmail('');
    setLoadingEmail(true);

    try {
      const response = await api.put('/auth/change-email', { 
        email, 
        password: passwordForEmail 
      });
      setUser(response.data.user);
      setPasswordForEmail('');
      setSuccessModal({ isOpen: true, message: 'Email alterado com sucesso!' });
    } catch (error) {
      setErrorEmail(error.response?.data?.message || 'Erro ao alterar email');
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrorPassword('');

    if (newPassword !== confirmPassword) {
      setErrorPassword('As senhas não coincidem');
      return;
    }

    setLoadingPassword(true);

    try {
      await api.put('/auth/change-password', { 
        currentPassword, 
        newPassword 
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessModal({ isOpen: true, message: 'Senha alterada com sucesso!' });
    } catch (error) {
      setErrorPassword(error.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Meu Perfil</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} title="Fechar">×</button>
        </div>

        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Perfil
          </button>
          <button
            className={`profile-tab ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
          >
            Trocar Email
          </button>
          <button
            className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Trocar Senha
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile}>
              {errorProfile && <div className="error-message">{errorProfile}</div>}
              
              <div className="form-group avatar-section">
                <label>Foto de Perfil</label>
                <div className="avatar-upload">
                  <div className="avatar-preview">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" />
                    ) : (
                      <div className="avatar-placeholder">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="avatar-actions">
                    <label htmlFor="avatar-input" className="btn btn-secondary btn-sm">
                      {avatarFile ? 'Trocar Foto' : 'Escolher Foto'}
                    </label>
                    <input
                      type="file"
                      id="avatar-input"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ display: 'none' }}
                    />
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={loadingAvatar}
                        className="btn btn-danger btn-sm"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="name">Nome Completo *</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="nickname">Apelido</label>
                <input
                  type="text"
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Como você quer aparecer nas tarefas"
                />
                <small>Este será o nome que aparecerá ao atribuir tarefas</small>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={loadingProfile} className="btn btn-primary">
                  {loadingProfile ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'email' && (
            <form onSubmit={handleChangeEmail}>
              {errorEmail && <div className="error-message">{errorEmail}</div>}
              
              <div className="form-group">
                <label htmlFor="email">Novo Email *</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="novo@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="passwordForEmail">Senha Atual *</label>
                <input
                  type="password"
                  id="passwordForEmail"
                  value={passwordForEmail}
                  onChange={(e) => setPasswordForEmail(e.target.value)}
                  required
                  placeholder="Confirme sua senha atual"
                />
                <small>É necessário confirmar sua senha para alterar o email</small>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={loadingEmail} className="btn btn-primary">
                  {loadingEmail ? 'Alterando...' : 'Alterar Email'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword}>
              {errorPassword && <div className="error-message">{errorPassword}</div>}
              
              <div className="form-group">
                <label htmlFor="currentPassword">Senha Atual *</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Sua senha atual"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Nova Senha *</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Nova Senha *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Digite a nova senha novamente"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={loadingPassword} className="btn btn-primary">
                  {loadingPassword ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </div>
            </form>
          )}
        </div>

        <SuccessModal
          isOpen={successModal.isOpen}
          onClose={() => setSuccessModal({ isOpen: false, message: '' })}
          title="Sucesso!"
          message={successModal.message}
        />

        <ErrorModal
          isOpen={errorModal.isOpen}
          onClose={() => setErrorModal({ isOpen: false, message: '' })}
          title="Erro"
          message={errorModal.message}
        />

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, onConfirm: null })}
          onConfirm={() => {
            if (confirmModal.onConfirm) {
              confirmModal.onConfirm();
            }
            setConfirmModal({ isOpen: false, onConfirm: null });
          }}
          title="Confirmar Remoção"
          message="Tem certeza que deseja remover sua foto de perfil?"
        />
      </div>
    </div>
  );
};

export default ProfileModal;

