import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ConfirmModal from './ConfirmModal';
import './Calendar.css';

const Calendar = ({ projects = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      }
    }
  };

  const saveEvents = (newEvents) => {
    localStorage.setItem('calendarEvents', JSON.stringify(newEvents));
    setEvents(newEvents);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias vazios no início
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatDateKey = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDateEvents = (date) => {
    const dateKey = formatDateKey(date);
    return events[dateKey] || [];
  };

  const handleDateClick = (date) => {
    if (!date) return;
    setSelectedDate(date);
    const dateEvents = getDateEvents(date);
    if (dateEvents.length > 0) {
      setEditingEvent({ date, events: dateEvents });
    } else {
      setEditingEvent({ date, events: [] });
    }
    setShowEventModal(true);
  };

  const handleAddEvent = (eventData) => {
    const dateKey = formatDateKey(eventData.date);
    const newEvents = { ...events };
    
    if (!newEvents[dateKey]) {
      newEvents[dateKey] = [];
    }
    
    if (eventData.id) {
      // Editar evento existente
      const eventIndex = newEvents[dateKey].findIndex(e => e.id === eventData.id);
      if (eventIndex !== -1) {
        newEvents[dateKey][eventIndex] = eventData;
      }
    } else {
      // Adicionar novo evento
      const newEvent = {
        ...eventData,
        id: Date.now().toString()
      };
      newEvents[dateKey].push(newEvent);
    }
    
    saveEvents(newEvents);
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (date, eventId) => {
    const dateKey = formatDateKey(date);
    const newEvents = { ...events };
    
    if (newEvents[dateKey]) {
      newEvents[dateKey] = newEvents[dateKey].filter(e => e.id !== eventId);
      if (newEvents[dateKey].length === 0) {
        delete newEvents[dateKey];
      }
    }
    
    saveEvents(newEvents);
    
    // Atualizar a lista de eventos no modal sem fechá-lo
    const updatedDateEvents = newEvents[dateKey] || [];
    setEditingEvent({ date, events: updatedDateEvents });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const days = getDaysInMonth(currentDate);

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={previousMonth} className="calendar-nav-btn">‹</button>
        <h3 className="calendar-month-year">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button onClick={nextMonth} className="calendar-nav-btn">›</button>
      </div>

      <div className="calendar-weekdays">
        {weekDays.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-days">
        {days.map((date, index) => {
          const dateEvents = date ? getDateEvents(date) : [];
          const isToday = date && formatDateKey(date) === formatDateKey(new Date());
          
          const handleMouseEnter = (e) => {
            if (date && dateEvents.length > 0) {
              const rect = e.currentTarget.getBoundingClientRect();
              const tooltipWidth = 250; // largura aproximada do tooltip
              const tooltipHeight = 150; // altura aproximada do tooltip
              
              // Calcular posição X (centralizado no dia, mas ajustado se sair da tela)
              let x = rect.left + rect.width / 2;
              if (x - tooltipWidth / 2 < 10) {
                x = tooltipWidth / 2 + 10;
              } else if (x + tooltipWidth / 2 > window.innerWidth - 10) {
                x = window.innerWidth - tooltipWidth / 2 - 10;
              }
              
              // Calcular posição Y (acima do dia, mas ajustado se não couber)
              let y = rect.top - 10;
              if (y - tooltipHeight < 10) {
                y = rect.bottom + 10; // Mostrar abaixo se não couber acima
              }
              
              setTooltipPosition({ x, y });
              setHoveredDate(date);
            }
          };

          const handleMouseLeave = () => {
            setHoveredDate(null);
          };
          
          return (
            <div
              key={index}
              className={`calendar-day ${!date ? 'empty' : ''} ${isToday ? 'today' : ''}`}
              onClick={() => handleDateClick(date)}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {date && (
                <>
                  <span className="calendar-day-number">{date.getDate()}</span>
                  {dateEvents.length > 0 && (
                    <div className="calendar-day-events">
                      {dateEvents.map((event) => (
                        <div
                          key={event.id}
                          className="calendar-event-dot"
                          style={{ backgroundColor: event.color }}
                          title={event.title}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {hoveredDate && createPortal(
        <CalendarTooltip
          date={hoveredDate}
          events={getDateEvents(hoveredDate)}
          projects={projects}
          position={tooltipPosition}
        />,
        document.body
      )}

      {showEventModal && editingEvent && createPortal(
        <CalendarEventModal
          date={editingEvent.date}
          events={editingEvent.events}
          projects={projects}
          onClose={() => {
            setShowEventModal(false);
            setEditingEvent(null);
          }}
          onSave={handleAddEvent}
          onDelete={handleDeleteEvent}
        />,
        document.body
      )}
    </div>
  );
};

// Componente Modal para eventos (será criado separadamente)
const CalendarEventModal = ({ date, events, projects = [], onClose, onSave, onDelete }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '#3b82f6',
    projectId: null
  });
  const [editingEventId, setEditingEventId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, eventId: null });

  // Função para atualizar projeto e cor automaticamente
  const handleProjectChange = (projectId) => {
    const projectIdNum = projectId ? parseInt(projectId) : null;
    let newColor = formData.color;
    
    // Se um projeto foi selecionado, usar a cor do projeto
    if (projectIdNum) {
      const selectedProject = projects.find(p => p.id === projectIdNum);
      if (selectedProject && selectedProject.color) {
        newColor = selectedProject.color;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      projectId: projectIdNum,
      color: newColor
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSave({
      ...formData,
      date,
      id: editingEventId
    });

    setFormData({
      title: '',
      description: '',
      color: '#3b82f6',
      projectId: null
    });
    setEditingEventId(null);
    setShowAddForm(false);
  };

  const handleEdit = (event) => {
    // Se o evento tem um projeto associado, usar a cor do projeto
    let eventColor = event.color;
    if (event.projectId) {
      const associatedProject = projects.find(p => p.id === event.projectId);
      if (associatedProject && associatedProject.color) {
        eventColor = associatedProject.color;
      }
    }
    
    setFormData({
      title: event.title,
      description: event.description,
      color: eventColor,
      projectId: event.projectId || null
    });
    setEditingEventId(event.id);
    setShowAddForm(true);
  };

  const handleDelete = (eventId) => {
    setConfirmDelete({ isOpen: true, eventId });
  };

  const confirmDeleteEvent = () => {
    if (confirmDelete.eventId) {
      onDelete(date, confirmDelete.eventId);
      setConfirmDelete({ isOpen: false, eventId: null });
    }
  };

  const colorOptions = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  return (
    <div className="calendar-modal-overlay" onClick={onClose}>
      <div className="calendar-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="calendar-modal-header">
          <h3>
            {date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()}
          </h3>
          <button onClick={onClose} className="calendar-modal-close">×</button>
        </div>

        <div className="calendar-modal-body">
          {events.length > 0 && (
            <div className="calendar-events-list">
              {events.map((event) => (
                <div key={event.id} className="calendar-event-item">
                  <div className="calendar-event-color" style={{ backgroundColor: event.color }}></div>
                  <div className="calendar-event-info">
                    <h4>{event.title}</h4>
                    {event.description && <p>{event.description}</p>}
                    {event.projectId && (
                      <div className="calendar-event-project">
                        <span className="calendar-event-project-label">Projeto:</span>
                        <span className="calendar-event-project-name">
                          {projects.find(p => p.id === event.projectId)?.name || 'Projeto não encontrado'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="calendar-event-actions">
                    <button onClick={() => handleEdit(event)} className="calendar-event-btn edit">✏️</button>
                    <button onClick={() => handleDelete(event.id)} className="calendar-event-btn delete">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showAddForm ? (
            <form onSubmit={handleSubmit} className="calendar-event-form">
              <input
                type="text"
                placeholder="Título do evento"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="calendar-form-input"
                required
              />
              <textarea
                placeholder="Descrição (opcional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="calendar-form-textarea"
                rows="3"
              />
              <div className="calendar-form-group">
                <label htmlFor="project-select">Associar a projeto (opcional):</label>
                <select
                  id="project-select"
                  value={formData.projectId || ''}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="calendar-form-select"
                >
                  <option value="">Nenhum projeto</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="calendar-color-picker">
                <label>Cor:</label>
                <div className="calendar-color-options">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`calendar-color-option ${formData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
              <div className="calendar-form-actions">
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingEventId ? 'Salvar Alterações' : 'Adicionar Evento'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ title: '', description: '', color: '#3b82f6', projectId: null });
                    setEditingEventId(null);
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary btn-sm calendar-add-event-btn"
            >
              + Adicionar Evento
            </button>
          )}
        </div>
      </div>

      {confirmDelete.isOpen && createPortal(
        <ConfirmModal
          isOpen={confirmDelete.isOpen}
          onClose={() => setConfirmDelete({ isOpen: false, eventId: null })}
          onConfirm={confirmDeleteEvent}
          title="Deletar Evento"
          message="Tem certeza que deseja deletar este evento? Esta ação não pode ser desfeita."
        />,
        document.body
      )}
    </div>
  );
};

// Componente Tooltip para mostrar eventos ao passar o mouse
const CalendarTooltip = ({ date, events, projects = [], position }) => {
  if (!events || events.length === 0) return null;

  // Determinar se o tooltip deve aparecer acima ou abaixo
  const tooltipHeight = 150;
  const showAbove = position.y - tooltipHeight > 10;

  return (
    <div
      className="calendar-tooltip"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: showAbove 
          ? 'translateX(-50%) translateY(-100%)' 
          : 'translateX(-50%) translateY(0)',
        marginTop: showAbove ? '-8px' : '8px'
      }}
    >
      <div className="calendar-tooltip-header">
        {date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()}
      </div>
      <div className="calendar-tooltip-body">
        {events.map((event) => (
          <div key={event.id} className="calendar-tooltip-event">
            <div
              className="calendar-tooltip-event-dot"
              style={{ backgroundColor: event.color }}
            />
            <div className="calendar-tooltip-event-info">
              <div className="calendar-tooltip-event-title">{event.title}</div>
              {event.projectId && (
                <div className="calendar-tooltip-event-project">
                  {projects.find(p => p.id === event.projectId)?.name || 'Projeto não encontrado'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;

