import React from 'react';

const TodoList = ({ todos, onEditTodo, onDeleteTodo, onToggleTodo }) => {

  if (todos.length === 0) {
    return <div className="empty-state">No todos yet. Create your first task!</div>;
  }

  return (
    <div className="todo-list">
      <h3>Your Todos</h3>
      {todos.map((todo) => (
        <div key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
          <div className="todo-checkbox">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => onToggleTodo?.(todo._id, !todo.completed)}
            />
          </div>

          <div className="todo-content">
            <h4 className="todo-title">{todo.title}</h4>
            {todo.description && <p className="todo-description">{todo.description}</p>}
            <div className="todo-meta">
              <span className={`priority priority-${todo.priority}`}>{todo.priority}</span>
              {todo.dueDate && (
                <span className="due-date">{new Date(todo.dueDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          <div className="todo-actions">
            <button className="btn btn-edit" onClick={() => onEditTodo?.(todo._id)} title="Edit">
              Edit
            </button>
            <button
              className="btn btn-delete"
              onClick={() => onDeleteTodo?.(todo._id)}
              title="Delete"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TodoList;
