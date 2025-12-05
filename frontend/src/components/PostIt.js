import React, { useState, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import './PostIt.css';

const PostIt = forwardRef(({ id, color = '#ffeb3b', onDataChange }, ref) => {
  const [isEditing, setIsEditing] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const savedDataRef = useRef({ title: '', description: '', isSaved: false });

  // Expor método para obter dados salvos através da ref
  useImperativeHandle(ref, () => ({
    getSavedData: () => savedDataRef.current,
  }));

  const handleSave = useCallback(() => {
    if (title.trim()) {
      const savedData = { 
        title: title.trim(), 
        description: description.trim(), 
        isSaved: true 
      };
      savedDataRef.current = savedData;
      setIsSaved(true);
      setIsEditing(false);
      // Notificar o componente pai SEM causar re-renderização
      if (onDataChange) {
        onDataChange(savedData);
      }
    }
  }, [title, description, onDataChange]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleReset = useCallback(() => {
    setIsEditing(true);
    setIsSaved(false);
    setTitle('');
    setDescription('');
    savedDataRef.current = { title: '', description: '', isSaved: false };
  }, []);

  // Expor método de reset também
  React.useImperativeHandle(ref, () => ({
    getSavedData: () => savedDataRef.current,
    reset: handleReset,
  }));

  const canDrag = isSaved && !isEditing;
  
  return (
    <Draggable draggableId={id} index={0} isDragDisabled={!canDrag} type="POSTIT">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...(canDrag ? provided.dragHandleProps : {})}
          className={`post-it ${snapshot.isDragging ? 'dragging' : ''} ${isSaved ? 'post-it-saved' : ''} ${isEditing ? 'post-it-editing' : ''}`}
          style={{ 
            backgroundColor: color,
            cursor: (!isSaved || isEditing) ? 'default' : 'grab'
          }}
        >
          <div className="post-it-content">
            {isEditing ? (
              <>
                <div className="post-it-header">
                  <span className="post-it-icon">📝</span>
                  <button 
                    className="post-it-save-btn" 
                    onClick={handleSave} 
                    title="Salvar"
                    type="button"
                  >
                    ✓
                  </button>
                </div>
                <input
                  type="text"
                  className="post-it-title-input"
                  placeholder="Título da tarefa"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSave();
                    }
                  }}
                  autoFocus
                />
                <textarea
                  className="post-it-description-input"
                  placeholder="Descrição..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                />
              </>
            ) : (
              <>
                <div className="post-it-header">
                  <span className="post-it-icon">📝</span>
                  <button 
                    className="post-it-edit-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleEdit();
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    title="Editar"
                    type="button"
                  >
                    ✎
                  </button>
                </div>
                {title ? (
                  <>
                    <div className="post-it-text post-it-title">{title}</div>
                    {description && (
                      <div className="post-it-text post-it-description">{description}</div>
                    )}
                  </>
                ) : (
                  <div className="post-it-text">Nova Tarefa</div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
});

PostIt.displayName = 'PostIt';

export default PostIt;
