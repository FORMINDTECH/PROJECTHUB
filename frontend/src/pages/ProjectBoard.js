import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import api from '../services/api';
import TaskModal from '../components/TaskModal';
import QuickTaskForm from '../components/QuickTaskForm';
import ProjectMembersModal from '../components/ProjectMembersModal';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import './ProjectBoard.css';

const ProjectBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState(null);
  const [pendingTaskStatus, setPendingTaskStatus] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [projectMembers, setProjectMembers] = useState([]);

  const { theme, toggleTheme } = useTheme();
  const { user } = useContext(AuthContext);

  const columns = [
    { id: 'todo', title: 'A Fazer', status: 'todo', color: '#ef4444' },
    { id: 'in-progress', title: 'Em Progresso', status: 'in-progress', color: '#f59e0b' },
    { id: 'done', title: 'Concluído', status: 'done', color: '#10b981' },
  ];

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
      setTasks(response.data);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    setDraggedOverColumn(null);

    if (!destination) return;


    // Se é uma tarefa existente sendo movida
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const task = tasks.find((t) => t.id === draggableId || t._id === draggableId);
    if (!task) return;

    const newStatus = destination.droppableId;
    const newOrder = destination.index;

    // Atualização otimista
    const newTasks = Array.from(tasks);
    const sourceTasks = newTasks.filter((t) => t.status === source.droppableId);
    const destTasks = newTasks.filter((t) => t.status === newStatus);

    sourceTasks.splice(source.index, 1);
    destTasks.splice(destination.index, 0, { ...task, status: newStatus, order: newOrder });

    const updatedTasks = [
      ...newTasks.filter((t) => t.status !== source.droppableId && t.status !== newStatus),
      ...sourceTasks.map((t, i) => ({ ...t, order: i })),
      ...destTasks.map((t, i) => ({ ...t, order: i })),
    ];

    setTasks(updatedTasks);

    // Atualizar no backend
    try {
      await api.put(`/tasks/${task.id || task._id}/move`, {
        status: newStatus,
        order: newOrder,
      });
      await loadTasks(); // Recarregar para garantir sincronização
    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
      await loadTasks(); // Reverter em caso de erro
    }
  };

  const handleDragUpdate = (update) => {
    const { destination } = update;
    if (destination && destination.droppableId !== 'postit-sidebar') {
      setDraggedOverColumn(destination.droppableId);
    } else {
      setDraggedOverColumn(null);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      console.log('Criando tarefa com dados:', { ...taskData, project: id });
      const response = await api.post('/tasks', { 
        ...taskData, 
        project: id,
        assignedTo: taskData.assignedTo || null
      });
      console.log('Tarefa criada:', response.data);
      await loadTasks();
      setShowTaskModal(false);
      setSelectedTask(null);
      setPendingTaskStatus(null);
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

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      await api.put(`/tasks/${taskId}`, {
        ...taskData,
        assignedTo: taskData.assignedTo || null
      });
      await loadTasks();
      setShowTaskModal(false);
      setSelectedTask(null);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar tarefa',
      };
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Tem certeza que deseja deletar esta tarefa?')) {
      return;
    }

    try {
      await api.delete(`/tasks/${taskId}`);
      await loadTasks();
    } catch (error) {
      alert('Erro ao deletar tarefa');
    }
  };

  const getTasksByStatus = (status) => {
    const filtered = tasks.filter((task) => {
      // Garantir que estamos comparando o status correto
      const taskStatus = task.status || task._status;
      return taskStatus === status;
    });
    return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
  };

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

      <DragDropContext onDragEnd={handleDragEnd} onDragUpdate={handleDragUpdate}>
        <div className="board-container">
          <div className="postit-sidebar">
            <QuickTaskForm 
              onCreateTask={handleQuickCreateTask}
              columns={columns}
            />
          </div>

          <div className="board-columns">
            {columns.map((column) => {
              const columnTasks = getTasksByStatus(column.status);
              return (
                <div 
                  key={column.id} 
                  className="board-column"
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
                      {columnTasks.length}
                    </span>
                  </div>
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`column-content ${
                          snapshot.isDraggingOver ? 'dragging-over' : ''
                        }`}
                        style={{
                          backgroundColor: snapshot.isDraggingOver
                            ? `${column.color}15`
                            : 'transparent',
                        }}
                      >
                        {columnTasks.map((task, index) => (
                          <Draggable
                            key={task.id || task._id}
                            draggableId={String(task.id || task._id)}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`task-card task-card-${column.id} ${
                                  snapshot.isDragging ? 'dragging' : ''
                                }`}
                                onClick={() => {
                                  setSelectedTask(task);
                                  setShowTaskModal(true);
                                }}
                              >
                                <div className="task-header">
                                  <h3>{task.title}</h3>
                                  <button
                                    className="btn btn-danger btn-icon btn-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTask(task.id || task._id);
                                    }}
                                    title="Deletar tarefa"
                                  >
                                    ×
                                  </button>
                                </div>
                                {task.description && (
                                  <p className="task-description">
                                    {task.description}
                                  </p>
                                )}
                                {task.assignedTo && (
                                  <div className="task-assigned">
                                    👤 {task.assignedTo.nickname || task.assignedTo.name}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {columnTasks.length === 0 && (
                          <div className="empty-column">
                            Arraste tarefas aqui
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>

          {showTaskModal && (
            <TaskModal
              onClose={() => {
                setShowTaskModal(false);
                setSelectedTask(null);
                setPendingTaskStatus(null);
              }}
              onSave={selectedTask ? handleUpdateTask : handleCreateTask}
              task={selectedTask}
              initialStatus={pendingTaskStatus}
              members={projectMembers}
            />
          )}

          {showMembersModal && (
            <ProjectMembersModal
              projectId={id}
              onClose={() => setShowMembersModal(false)}
              isOwner={project?.ownerId === user?.id}
            />
          )}
        </div>
      );
    };

export default ProjectBoard;

