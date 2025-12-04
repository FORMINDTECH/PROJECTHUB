import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import api from '../services/api';
import TaskModal from '../components/TaskModal';
import './ProjectBoard.css';

const ProjectBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const columns = [
    { id: 'todo', title: 'A Fazer', status: 'todo' },
    { id: 'in-progress', title: 'Em Progresso', status: 'in-progress' },
    { id: 'done', title: 'Concluído', status: 'done' },
  ];

  useEffect(() => {
    loadProject();
    loadTasks();
  }, [id]);

  const loadProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
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

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const task = tasks.find((t) => t._id === draggableId);
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
      await api.put(`/tasks/${draggableId}/move`, {
        status: newStatus,
        order: newOrder,
      });
      await loadTasks(); // Recarregar para garantir sincronização
    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
      await loadTasks(); // Reverter em caso de erro
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await api.post('/tasks', { ...taskData, project: id });
      await loadTasks();
      setShowTaskModal(false);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar tarefa',
      };
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      await api.put(`/tasks/${taskId}`, taskData);
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
    return tasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.order - b.order);
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
          <button onClick={() => navigate('/dashboard')} className="btn-back">
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
          <button
            onClick={() => {
              setSelectedTask(null);
              setShowTaskModal(true);
            }}
            className="btn-add-task"
          >
            + Nova Tarefa
          </button>
        </div>
      </header>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="board-columns">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.status);
            return (
              <div key={column.id} className="board-column">
                <div className="column-header">
                  <h2>{column.title}</h2>
                  <span className="task-count">{columnTasks.length}</span>
                </div>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`column-content ${
                        snapshot.isDraggingOver ? 'dragging-over' : ''
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`task-card ${
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
                                  className="btn-delete-task"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTask(task._id);
                                  }}
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
                                  👤 {task.assignedTo.name}
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
      </DragDropContext>

      {showTaskModal && (
        <TaskModal
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onSave={selectedTask ? handleUpdateTask : handleCreateTask}
          task={selectedTask}
        />
      )}
    </div>
  );
};

export default ProjectBoard;

