import express from 'express';
import {
  getTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
  getAllTodosAdmin,
} from '../controllers/todoController.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

// User routes
router.get('/', auth, getTodos);
router.get('/:id', auth, getTodo);
router.post('/', auth, createTodo);
router.put('/:id', auth, updateTodo);
router.delete('/:id', auth, deleteTodo);

// Admin routes
router.get('/admin/all', auth, authorize('admin'), getAllTodosAdmin);

export default router;
