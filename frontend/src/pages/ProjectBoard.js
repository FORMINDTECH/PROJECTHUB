import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../services/api';
import QuickTaskForm from '../components/QuickTaskForm';
import ProjectMembersModal from '../components/ProjectMembersModal';
import ConfirmModal from '../components/ConfirmModal';
import AssignMemberModal from '../components/AssignMemberModal';
import EditProjectModal from '../components/EditProjectModal';
import ErrorModal from '../components/ErrorModal';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import './ProjectBoard.css';

// Componente PostIt para tarefas sem status
const PostIt = ({ task, onDelete, onEdit }) => {
  const taskId = String(task.id || task._id);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: taskId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`postit-card ${isDragging ? 'dragging' : ''}`}
    >
      <div className="postit-header">
        <div style={{ flex: 1 }}>
          <h3>{task.title}</h3>
        </div>
        <div className="task-actions">
          <button
            className="btn btn-secondary btn-icon btn-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(task);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(task);
            }}
            title="Editar tarefa"
            style={{ cursor: 'pointer', flexShrink: 0, zIndex: 10, position: 'relative' }}
          >
            ✏️
          </button>
          <button
            className="btn btn-danger btn-icon btn-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(task.id || task._id);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(task.id || task._id);
            }}
            title="Deletar tarefa"
            style={{ cursor: 'pointer', flexShrink: 0, zIndex: 10, position: 'relative' }}
          >
            ×
          </button>
        </div>
      </div>
      {task.description && (
        <p className="postit-description">
          {task.description}
        </p>
      )}
    </div>
  );
};

// Componente Sortable para cada tarefa
const SortableTask = ({ task, column, onDelete, onEdit }) => {
  const taskId = String(task.id || task._id);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: taskId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`task-card task-card-${column.id} ${isDragging ? 'dragging' : ''}`}
    >
      <div className="task-header">
        <div style={{ flex: 1 }}>
          <h3>{task.title}</h3>
        </div>
        <div className="task-actions">
          <button
            className="btn btn-secondary btn-icon btn-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(task);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(task);
            }}
            title="Editar tarefa"
            style={{ cursor: 'pointer', flexShrink: 0, zIndex: 10, position: 'relative' }}
          >
            ✏️
          </button>
          <button
            className="btn btn-danger btn-icon btn-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(task.id || task._id);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(task.id || task._id);
            }}
            title="Deletar tarefa"
            style={{ cursor: 'pointer', flexShrink: 0, zIndex: 10, position: 'relative' }}
          >
            ×
          </button>
        </div>
      </div>
      {task.description && (
        <p className="task-description">
          {task.description}
        </p>
      )}
      {task.assignedTo && (
        <div className="task-assigned">
          {task.assignedTo.avatar ? (
            <img 
              src={`http://localhost:5000${task.assignedTo.avatar}`} 
              alt={task.assignedTo.nickname || task.assignedTo.name}
              className="task-assigned-avatar"
            />
          ) : (
            <div className="task-assigned-initial">
              {(task.assignedTo.nickname || task.assignedTo.name)?.charAt(0).toUpperCase()}
            </div>
          )}
          <span>{task.assignedTo.nickname || task.assignedTo.name}</span>
        </div>
      )}
    </div>
  );
};

// Componente para cada coluna
const Column = ({ column, tasks, onDelete, onEdit }) => {
  const taskIds = tasks.map(task => String(task.id || task._id));
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`board-column ${isOver ? 'drag-over' : ''}`}
      style={{
        borderLeft: `4px solid ${column.color}`,
      }}
    >
      <div 
        className="column-header"
        style={{
          borderBottomColor: `${column.color}40`,
        }}
      >
        <h2 style={{ color: column.color }}>{column.title}</h2>
        <span 
          className="task-count"
          style={{
            backgroundColor: `${column.color}20`,
            color: column.color,
          }}
        >
          {tasks.length}
        </span>
      </div>
      <div className="column-content-wrapper" style={{ position: 'relative' }}>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="column-content" style={{ minHeight: '400px' }}>
            {tasks.map((task) => {
              const taskId = String(task.id || task._id);
              if (!taskId || taskId === 'undefined' || taskId === 'null' || taskId === '') {
                return null;
              }
              return (
                <SortableTask
                  key={taskId}
                  task={task}
                  column={column}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              );
            })}
            {tasks.length === 0 && !isOver && (
              <div className="empty-column">
                Arraste tarefas aqui
              </div>
            )}
          </div>
        </SortableContext>
        {isOver && (
          <div className="drop-indicator">
            <div className="drop-indicator-line"></div>
            <span className="drop-indicator-text">Solte aqui</span>
            <div className="drop-indicator-line"></div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [projectMembers, setProjectMembers] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [taskCreated, setTaskCreated] = useState(0);
  const [draftData, setDraftData] = useState({ title: '', description: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, taskId: null });
  const [assignModal, setAssignModal] = useState({ isOpen: false, task: null });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  const { theme, toggleTheme } = useTheme();
  const { user } = useContext(AuthContext);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // Requer movimento de 10px antes de ativar o drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = useMemo(() => [
    { id: 'todo', title: 'A Fazer', status: 'todo', color: '#ef4444' },
    { id: 'in-progress', title: 'Em Progresso', status: 'in-progress', color: '#f59e0b' },
    { id: 'done', title: 'Concluído', status: 'done', color: '#10b981' },
  ], []);

  useEffect(() => {
    loadProject();
    loadTasks();
  }, [id]);

  const loadProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
      if (response.data.members) {
        setProjectMembers(response.data.members);
      }
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
      navigate('/dashboard');
    }
  };

  const loadTasks = async () => {
    try {
      const response = await api.get(`/tasks/project/${id}`);
      const validTasks = (response.data || []).filter(task => {
        const taskId = task.id || task._id;
        return taskId !== null && taskId !== undefined && taskId !== '';
      });
      setTasks(validTasks);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      return;
    }

    const activeId = String(active.id);
    let overId = String(over.id);

    // Se soltou na mesma posição, não faz nada
    if (activeId === overId) {
      return;
    }

    // Se soltou sobre uma tarefa, encontrar a coluna dessa tarefa
    const overTask = tasks.find((t) => {
      const tId = String(t.id || t._id);
      return tId === overId;
    });
    
    // Se soltou sobre uma tarefa, usar a coluna dessa tarefa
    if (overTask) {
      const taskStatus = overTask.status || overTask._status;
      const taskColumn = columns.find(col => col.status === taskStatus);
      if (taskColumn) {
        overId = taskColumn.id;
      }
    }

    // Verificar se é o post-it de rascunho sendo arrastado
    if (activeId === 'draft-postit') {
      // Verificar se está sendo soltado em uma coluna
      const targetColumn = columns.find(col => col.id === overId);
      
      if (targetColumn) {
        const draftDataFromActive = active.data?.current?.draftData;
        const currentDraftData = draftDataFromActive || draftData;
        if (currentDraftData && currentDraftData.title && currentDraftData.title.trim()) {
          try {
            await api.post('/tasks', {
              title: currentDraftData.title.trim(),
              description: (currentDraftData.description || '').trim(),
              status: targetColumn.status,
              project: id,
            });
            await loadTasks();
            setTaskCreated(prev => prev + 1); // Trigger para limpar o formulário
          } catch (error) {
            console.error('Erro ao criar tarefa:', error);
            setErrorModal({ isOpen: true, message: error.response?.data?.message || 'Erro ao criar tarefa' });
          }
        }
      }
      return;
    }

    // Encontrar a tarefa sendo arrastada
    const activeTask = tasks.find((t) => {
      const tId = String(t.id || t._id);
      return tId === activeId;
    });

    if (!activeTask) {
      console.error('Tarefa não encontrada:', activeId);
      return;
    }

    // Verificar se está sendo soltado em uma coluna
    const targetColumn = columns.find(col => col.id === overId);
    
    if (targetColumn) {
      // Soltou em uma coluna
      const newStatus = targetColumn.status;
      const sourceStatus = activeTask.status || activeTask._status || null;

      // Se é um post-it (sem status) ou está mudando de coluna
      if (sourceStatus === null || newStatus !== sourceStatus) {
        // Mover para outra coluna
        const sourceTasks = tasks.filter(t => {
          const tStatus = t.status || t._status;
          return tStatus === sourceStatus;
        });
        const destTasks = tasks.filter(t => {
          const tStatus = t.status || t._status;
          return tStatus === newStatus;
        });

        // Remover da origem (se não for um post-it)
        const newSourceTasks = sourceStatus === null ? [] : sourceTasks.filter(t => {
          const tId = String(t.id || t._id);
          return tId !== activeId;
        });

        // Adicionar ao destino
        const newDestTasks = [...destTasks, { ...activeTask, status: newStatus }];

        // Atualizar estado
        const updatedTasks = [
          ...tasks.filter(t => {
            const tStatus = t.status || t._status || null;
            // Se sourceStatus é null (post-it), não filtrar por ele
            if (sourceStatus === null) {
              return tStatus !== newStatus;
            }
            return tStatus !== sourceStatus && tStatus !== newStatus;
          }),
          ...newSourceTasks,
          ...newDestTasks,
        ];

        setTasks(updatedTasks);

        // Atualizar no backend
        try {
          await api.put(`/tasks/${activeTask.id || activeTask._id}/move`, {
            status: newStatus,
            order: newDestTasks.length - 1,
          });
          setTimeout(() => {
            loadTasks();
          }, 100);
        } catch (error) {
          console.error('Erro ao mover tarefa:', error);
          await loadTasks();
        }
      }
    } else {
      // Reordenar dentro da mesma coluna
      const activeTaskStatus = activeTask.status || activeTask._status;
      const activeColumnTasks = tasks.filter(t => {
        const tStatus = t.status || t._status;
        return tStatus === activeTaskStatus;
      });

      const oldIndex = activeColumnTasks.findIndex(t => {
        const tId = String(t.id || t._id);
        return tId === activeId;
      });

      // Encontrar a tarefa sobre a qual foi soltado
      const overTask = tasks.find((t) => {
        const tId = String(t.id || t._id);
        return tId === overId;
      });

      if (!overTask) {
        return;
      }

      const overTaskStatus = overTask.status || overTask._status;
      
      if (overTaskStatus === activeTaskStatus) {
        // Mesma coluna - reordenar
        const overIndex = activeColumnTasks.findIndex(t => {
          const tId = String(t.id || t._id);
          return tId === overId;
        });

        const newColumnTasks = arrayMove(activeColumnTasks, oldIndex, overIndex);

    const updatedTasks = [
          ...tasks.filter(t => {
            const tStatus = t.status || t._status;
            return tStatus !== activeTaskStatus;
          }),
          ...newColumnTasks.map((t, i) => ({ ...t, order: i })),
    ];

    setTasks(updatedTasks);

    // Atualizar no backend
    try {
          await api.put(`/tasks/${activeTask.id || activeTask._id}/move`, {
            status: activeTaskStatus,
            order: overIndex,
      });
          setTimeout(() => {
            loadTasks();
          }, 100);
    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
          await loadTasks();
        }
      }
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const response = await api.post('/tasks', { 
        ...taskData, 
        project: id,
        assignedTo: taskData.assignedTo || null
      });
      await loadTasks();
      return { success: true };
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar tarefa',
      };
    }
  };

  const handleQuickCreateTask = async (taskData) => {
    return await handleCreateTask(taskData);
  };

  const handleDeleteTask = (taskId) => {
    setConfirmModal({
      isOpen: true,
      taskId: taskId,
    });
  };

  const confirmDeleteTask = async () => {
    if (!confirmModal.taskId) return;

      try {
        await api.delete(`/tasks/${confirmModal.taskId}`);
        await loadTasks();
      } catch (error) {
        setErrorModal({ isOpen: true, message: 'Erro ao deletar tarefa' });
      } finally {
        setConfirmModal({ isOpen: false, taskId: null });
      }
  };

  const handleEditTask = (task) => {
    setAssignModal({ isOpen: true, task });
  };

  const handleAssignMember = async () => {
    await loadTasks();
  };

  // Organizar tarefas por status
  const tasksByStatus = useMemo(() => {
    const result = {
      'todo': [],
      'in-progress': [],
      'done': [],
      'postit': [] // Post-its sem status
    };
    
    tasks.forEach((task) => {
      const taskId = task.id || task._id;
      if (!taskId || taskId === null || taskId === undefined || taskId === '') {
        return;
      }
      const taskStatus = task.status || task._status || null;
      if (taskStatus === null) {
        result['postit'].push(task);
      } else if (result[taskStatus]) {
        result[taskStatus].push(task);
      }
    });
    
    Object.keys(result).forEach(status => {
      result[status].sort((a, b) => (a.order || 0) - (b.order || 0));
    });
    
    return result;
  }, [tasks]);

  const getTasksByStatus = useCallback((status) => {
    return tasksByStatus[status] || [];
  }, [tasksByStatus]);

  const postIts = getTasksByStatus('postit');

  const activeTask = activeId && activeId !== 'draft-postit' 
    ? tasks.find(t => String(t.id || t._id) === String(activeId)) 
    : null;
  
  const isDraggingDraft = activeId === 'draft-postit';

  if (loading) {
    return (
      <div className="loading-container">
        <div>Carregando...</div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="project-board">
      <header
        className="board-header"
        style={{ borderBottomColor: project.color }}
      >
        <div className="header-content">
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            ← Voltar
          </button>
          <div className="project-info">
            {project.logo && (
              <img
                src={`http://localhost:5000${project.logo}`}
                alt={project.name}
                className="project-logo-header"
              />
            )}
            <div>
              <h1>{project.name}</h1>
              {project.description && <p>{project.description}</p>}
            </div>
          </div>
            <div className="header-actions">
              {project?.ownerId === user?.id && (
                <button 
                  onClick={() => setShowEditProjectModal(true)} 
                  className="btn btn-secondary btn-sm"
                  title="Editar Projeto"
                >
                  ✏️ Editar Projeto
                </button>
              )}
          <button
                onClick={() => setShowMembersModal(true)} 
                className="btn btn-secondary btn-sm"
                title="Membros do Projeto"
          >
                👥 Membros
              </button>
              <button onClick={toggleTheme} className="btn btn-secondary btn-icon" title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}>
                {theme === 'dark' ? '☀️' : '🌙'}
          </button>
            </div>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[]}
      >
        <div className="board-container">
          <div className="postit-sidebar">
            <QuickTaskForm 
              onTaskCreated={taskCreated} 
              onDraftChange={setDraftData}
            />
            {postIts.length > 0 && (
              <div className="postits-container">
                <h3 className="postits-title">📋 Post-its</h3>
                <SortableContext items={postIts.map(t => String(t.id || t._id))} strategy={verticalListSortingStrategy}>
                  <div className="postits-list">
                    {postIts.map((task) => {
                      const taskId = String(task.id || task._id);
                      if (!taskId || taskId === 'undefined' || taskId === 'null' || taskId === '') {
                        return null;
                      }
                      return (
                        <PostIt
                          key={taskId}
                          task={task}
                          onDelete={handleDeleteTask}
                          onEdit={handleEditTask}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </div>
            )}
          </div>

        <div className="board-columns">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.status);
            return (
                <Column
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                />
              );
            })}
          </div>
                </div>
        <DragOverlay 
          dropAnimation={null}
          style={{ cursor: 'grabbing' }}
                    >
          {isDraggingDraft && draftData.title ? (
            <div className="postit-form-card dragging-overlay">
              <div className="postit-form-header">
                <div className="postit-form-icon">📝</div>
              </div>
              <div className="postit-form-content">
                <div className="postit-writing-area">
                  <div className="postit-lines">
                    <div style={{ 
                      fontWeight: 600, 
                      color: '#1a1a1a',
                      fontSize: '0.9rem',
                      lineHeight: '24px',
                      fontFamily: "'Segoe UI', 'Comic Sans MS', 'Kalam', cursive, sans-serif"
                    }}>
                      {draftData.title}
                              </div>
                    {draftData.description && (
                      <>
                        <div className="postit-line"></div>
                        <div style={{ 
                          color: '#1a1a1a',
                          fontSize: '0.8rem',
                          lineHeight: '24px',
                          fontFamily: "'Segoe UI', 'Comic Sans MS', 'Kalam', cursive, sans-serif",
                          whiteSpace: 'pre-wrap'
                        }}>
                          {draftData.description}
                                </div>
                      </>
                              )}
                            </div>
                </div>
              </div>
            </div>
          ) : activeTask ? (
            <div className="task-card task-card-dragging" style={{ opacity: 0.9 }}>
              <div className="task-header">
                <h3>{activeTask.title}</h3>
                        </div>
              {activeTask.description && (
                <p className="task-description">{activeTask.description}</p>
                      )}
                    </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showMembersModal && (
        <ProjectMembersModal
          projectId={id}
          onClose={() => setShowMembersModal(false)}
          isOwner={project?.ownerId === user?.id}
          projectOwner={project?.owner}
          projectCreatedAt={project?.createdAt}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, taskId: null })}
        onConfirm={confirmDeleteTask}
        title="Deletar Tarefa"
        message="Tem certeza que deseja deletar esta tarefa? Esta ação não pode ser desfeita."
      />

      <AssignMemberModal
        isOpen={assignModal.isOpen}
        onClose={() => setAssignModal({ isOpen: false, task: null })}
        task={assignModal.task}
        projectId={id}
        onAssign={handleAssignMember}
        />

      <EditProjectModal
        isOpen={showEditProjectModal}
        onClose={() => setShowEditProjectModal(false)}
        project={project}
        onUpdate={loadProject}
      />

      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        title="Erro"
        message={errorModal.message}
      />
    </div>
  );
};

export default ProjectBoard;
