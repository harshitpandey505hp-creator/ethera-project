const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getTasks)              // Admin: all tasks | Member: assigned tasks
  .post(adminOnly, createTask); // Admin only

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)            // Admin: all fields | Member: status only
  .delete(adminOnly, deleteTask);

router.post('/:id/comments', addComment);

module.exports = router;
