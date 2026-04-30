const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const Task = require('../models/Task');

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private/Admin
 */
const createProject = asyncHandler(async (req, res) => {
  const { title, description, deadline, members, status } = req.body;

  if (!title || !deadline) {
    res.status(400);
    throw new Error('Title and deadline are required');
  }

  const project = await Project.create({
    title,
    description,
    deadline,
    status: status || 'active',
    createdBy: req.user._id,
    members: members || [],
  });

  // Populate creator and members info
  await project.populate('createdBy', 'name email role');
  await project.populate('members', 'name email role');

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project,
  });
});

/**
 * @desc    Get all projects
 *          Admin: all projects
 *          Member: only projects they are a member of
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = asyncHandler(async (req, res) => {
  let query;

  if (req.user.role === 'admin') {
    // Admin sees all projects
    query = Project.find();
  } else {
    // Member sees only their projects
    query = Project.find({ members: req.user._id });
  }

  const projects = await query
    .populate('createdBy', 'name email')
    .populate('members', 'name email role')
    .sort({ createdAt: -1 });

  // Attach task counts to each project
  const projectsWithStats = await Promise.all(
    projects.map(async (project) => {
      const taskCount = await Task.countDocuments({ project: project._id });
      const completedCount = await Task.countDocuments({
        project: project._id,
        status: 'completed',
      });
      const obj = project.toObject();
      obj.taskCount = taskCount;
      obj.completedTaskCount = completedCount;
      return obj;
    })
  );

  res.json({
    success: true,
    count: projectsWithStats.length,
    data: projectsWithStats,
  });
});

/**
 * @desc    Get single project by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('createdBy', 'name email role')
    .populate('members', 'name email role');

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Members can only view projects they belong to
  if (
    req.user.role === 'member' &&
    !project.members.some((m) => m._id.toString() === req.user._id.toString())
  ) {
    res.status(403);
    throw new Error('Access denied: You are not a member of this project');
  }

  // Get tasks for this project
  const tasks = await Task.find({ project: project._id })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: {
      ...project.toObject(),
      tasks,
    },
  });
});

/**
 * @desc    Update a project
 * @route   PUT /api/projects/:id
 * @access  Private/Admin
 */
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Only the creator (admin) can update
  if (project.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Access denied: Only the project creator can update it');
  }

  const { title, description, deadline, members, status } = req.body;

  project.title = title || project.title;
  project.description = description !== undefined ? description : project.description;
  project.deadline = deadline || project.deadline;
  project.status = status || project.status;
  project.members = members !== undefined ? members : project.members;

  const updatedProject = await project.save();
  await updatedProject.populate('createdBy', 'name email role');
  await updatedProject.populate('members', 'name email role');

  res.json({
    success: true,
    message: 'Project updated successfully',
    data: updatedProject,
  });
});

/**
 * @desc    Delete a project (also deletes all tasks)
 * @route   DELETE /api/projects/:id
 * @access  Private/Admin
 */
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Only the creator (admin) can delete
  if (project.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Access denied: Only the project creator can delete it');
  }

  // Delete all tasks associated with this project
  await Task.deleteMany({ project: project._id });

  await project.deleteOne();

  res.json({
    success: true,
    message: 'Project and all associated tasks deleted successfully',
  });
});

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
