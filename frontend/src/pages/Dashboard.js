import React, { useState, useContext, useEffect, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import TodoForm from '../components/TodoForm';
import TodoList from '../components/TodoList';
import { useNavigate } from 'react-router-dom';
import { todoAPI } from '../services/api';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editError, setEditError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editFormData, setEditFormData] = useState({
    _id: '',
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    completed: false,
  });
  const navigate = useNavigate();

  const fetchTodos = useCallback(async () => {
    try {
      setError('');
      const response = await todoAPI.getTodos();
      setTodos(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load todos');
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTodoDeleted = async (deletedId) => {
    try {
      setError('');
      await todoAPI.deleteTodo(deletedId);
      setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== deletedId));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete todo');
    }
  };

  const handleTodoAdded = async (newTodoData) => {
    try {
      setError('');
      const response = await todoAPI.createTodo(newTodoData);
      const createdTodo = response.data?.todo;

      if (createdTodo) {
        setTodos((prevTodos) => [createdTodo, ...prevTodos]);
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to create todo');
    }
  };

  const handleTodoUpdated = async (updatedTodo) => {
    try {
      setError('');
      const response = await todoAPI.updateTodo(updatedTodo._id, updatedTodo);
      const savedTodo = response.data?.todo;

      if (savedTodo) {
        setTodos((prevTodos) =>
          prevTodos.map((todo) => (todo._id === savedTodo._id ? savedTodo : todo))
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update todo');
      throw err;
    }
  };

  const handleTodoToggled = async (todoId, completed) => {
    const currentTodo = todos.find((todo) => todo._id === todoId);
    if (!currentTodo) {
      return;
    }

    try {
      await handleTodoUpdated({ ...currentTodo, completed });
    } catch {}
  };

  const handleTodoEditOpen = (todoId) => {
    const todo = todos.find((item) => item._id === todoId);

    if (!todo) {
      return;
    }

    setEditError('');
    setEditFormData({
      _id: todo._id,
      title: todo.title || '',
      description: todo.description || '',
      priority: todo.priority || 'medium',
      dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '',
      completed: Boolean(todo.completed),
    });
    setShowEditModal(true);
  };

  const handleEditFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditTodoSubmit = async (event) => {
    event.preventDefault();

    if (!editFormData.title.trim()) {
      setEditError('Title is required');
      return;
    }

    try {
      setIsSavingEdit(true);
      setEditError('');
      await handleTodoUpdated({
        ...editFormData,
        title: editFormData.title.trim(),
        dueDate: editFormData.dueDate || null,
      });
      setShowEditModal(false);
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || 'Failed to update todo');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCreateTodoFromModal = async (todoData) => {
    await handleTodoAdded(todoData);
    setShowCreateModal(false);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Todo Dashboard</h1>
          <p>Welcome, {user?.name}!</p>
        </div>
        <div className="header-actions">
          <button
            onClick={() => setShowCreateModal(true)}
            className="new-task-icon-btn"
            title="Create new task"
            aria-label="Create new task"
          >
            +
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {error && <div className="error-message">{error}</div>}
        <TodoList
          todos={todos}
          onEditTodo={handleTodoEditOpen}
          onDeleteTodo={handleTodoDeleted}
          onToggleTodo={handleTodoToggled}
        />
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>New Task</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <TodoForm onAddTodo={handleCreateTodoFromModal} />
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Task</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowEditModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {editError && <div className="error-message">{editError}</div>}

            <form onSubmit={handleEditTodoSubmit} className="todo-form">
              <div className="form-group">
                <label htmlFor="edit-title">Title *</label>
                <input
                  id="edit-title"
                  name="title"
                  type="text"
                  value={editFormData.title}
                  onChange={handleEditFieldChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  name="description"
                  rows="3"
                  value={editFormData.description}
                  onChange={handleEditFieldChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-priority">Priority</label>
                  <select
                    id="edit-priority"
                    name="priority"
                    value={editFormData.priority}
                    onChange={handleEditFieldChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-dueDate">Due Date</label>
                  <input
                    id="edit-dueDate"
                    name="dueDate"
                    type="date"
                    value={editFormData.dueDate}
                    onChange={handleEditFieldChange}
                  />
                </div>
              </div>

              <div className="form-group checkbox-row">
                <label htmlFor="edit-completed">Completed</label>
                <input
                  id="edit-completed"
                  name="completed"
                  type="checkbox"
                  checked={editFormData.completed}
                  onChange={handleEditFieldChange}
                />
              </div>

              <div className="edit-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={isSavingEdit}>
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
