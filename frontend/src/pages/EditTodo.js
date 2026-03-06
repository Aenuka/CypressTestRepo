import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { todoAPI } from '../services/api';

const EditTodo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    completed: false,
  });

  useEffect(() => {
    const fetchTodo = async () => {
      try {
        setError('');
        const response = await todoAPI.getTodo(id);
        const todo = response.data;

        setFormData({
          title: todo.title || '',
          description: todo.description || '',
          priority: todo.priority || 'medium',
          dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '',
          completed: Boolean(todo.completed),
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load todo');
      } finally {
        setLoading(false);
      }
    };

    fetchTodo();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await todoAPI.updateTodo(id, {
        ...formData,
        title: formData.title.trim(),
        dueDate: formData.dueDate || null,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update todo');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading todo...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Edit Todo</h1>
          <p>Update task details</p>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="todo-form-container">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="todo-form">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dueDate">Due Date</label>
                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group checkbox-row">
              <label htmlFor="completed">Completed</label>
              <input
                id="completed"
                name="completed"
                type="checkbox"
                checked={formData.completed}
                onChange={handleChange}
              />
            </div>

            <div className="edit-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate('/dashboard')}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTodo;
