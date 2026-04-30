const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getProjects)           // Admin: all projects | Member: their projects
  .post(adminOnly, createProject); // Admin only

router.route('/:id')
  .get(getProjectById)
  .put(adminOnly, updateProject)
  .delete(adminOnly, deleteProject);

module.exports = router;
