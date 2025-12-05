import React, { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useTheme } from '../context/ThemeContext';
import './QuickTaskForm.css';

const QuickTaskForm = ({ onTaskCreated, onDraftChange }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Limpar campos quando uma tarefa for criada
  useEffect(() => {
    if (onTaskCreated > 0) {
      setTitle('');
      setDescription('');
      if (onDraftChange) {
        onDraftChange({ title: '', description: '' });
      }
    }
  }, [onTaskCreated, onDraftChange]);

  // Notificar mudanças no draft para o componente pai
  useEffect(() => {
    if (onDraftChange) {
      onDraftChange({ title, description });
    }
  }, [title, description, onDraftChange]);

  // ID temporário para o post-it em edição
  const draftId = 'draft-postit';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ 
    id: draftId,
    disabled: !title.trim() || isEditing, // Só pode arrastar se tiver título e não estiver editando
    data: {
      type: 'draft',
      draftData: {
        title,
        description,
      },
    },
  });

  const style = {
    opacity: isDragging ? 0 : 1,
    visibility: isDragging ? 'hidden' : 'visible',
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleClear = () => {
    setTitle('');
    setDescription('');
  };

  const hasContent = title.trim().length > 0;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`postit-form-card ${isDragging ? 'dragging' : ''} ${hasContent ? 'has-content' : ''}`}
      {...(!isEditing && hasContent ? { ...listeners, ...attributes } : {})}
    >
      <div className="postit-form-header">
        <div className="postit-form-icon">📝</div>
        {hasContent && (
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-ghost btn-icon btn-sm postit-clear-btn"
            title="Limpar"
          >
            ×
          </button>
        )}
      </div>

      <div className="postit-form-content">
        <div className="postit-writing-area">
          <div className="postit-lines">
            <input
              type="text"
              placeholder="Escreva aqui..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="postit-line-input"
              maxLength={50}
            />
            {title && (
              <>
                <div className="postit-line"></div>
                <textarea
                  placeholder="Mais detalhes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="postit-line-textarea"
                  rows="4"
                  maxLength={200}
                />
              </>
            )}
          </div>
        </div>

        {hasContent && !isEditing && (
          <div className="postit-form-hint">
            <small>💡 Arraste para uma coluna</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickTaskForm;
