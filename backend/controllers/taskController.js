const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const Project = require('../models/Project');

/**
 * @desc    Create a new task inside a project
 * @route   POST /api/tasks
 * @access  Private/Admin
 */
const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, deadline, projectId, assignedTo } = req.body;

  if (!title || !deadline || !projectId) {
    res.status(400);
    throw new Error('Title, deadline, and projectId are required');
  }

  // Verify project exists
  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Only admin (project creator) can create tasks
  if (project.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Access denied: Only the project creator can create tasks');
  }

  // If assigning to a member, verify they are in the project
  if (assignedTo) {
    const isMember = project.members.some(
      (m) => m.toString() === assignedTo.toString()
    );
    if (!isMember && assignedTo.toString() !== req.user._id.toString()) {
      res.status(400);
      throw new Error('Assigned user is not a member of this project');
    }
  }

  const task = await Task.create({
    title,
    description,
    priority: priority || 'medium',
    deadline,
    project: projectId,
    assignedTo: assignedTo || null,
    createdBy: req.user._id,
  });

  await task.populate('assignedTo', 'name email');
  await task.populate('createdBy', 'name email');
  await task.populate('project', 'title');

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task,
  });
});

/**
 * @desc    Get tasks
 *          Admin: all tasks or filter by project
 *          Member: only tasks assigned to them
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = asyncHandler(async (req, res) => {
  const { projectId, status, priority, search } = req.query;

  let filter = {};

  if (req.user.role === 'admin') {
    // Admin can filter by project
    if (projectId) filter.project = projectId;
  } else {
    // Member only sees their assigned tasks
    filter.assignedTo = req.user._id;
    if (projectId) filter.project = projectId;
  }

  // Optional filters
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  // Text search on title
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .populate('project', 'title deadline')
    .sort({ createdAt: -1 });

  // Add isOverdue flag
  const tasksWithOverdue = tasks.map((task) => {
    const obj = task.toObject();
    obj.isOverdue = task.status !== 'completed' && new Date() > task.deadline;
    return obj;
  });

  res.json({
    success: true,
    count: tasksWithOverdue.length,
    data: tasksWithOverdue,
  });
});

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role')
    .populate('project', 'title deadline status')
    .populate('comments.author', 'name email');

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Members can only view tasks assigned to them
  if (
    req.user.role === 'member' &&
    task.assignedTo?._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Access denied: This task is not assigned to you');
  }

  res.json({
    success: true,
    data: task,
  });
});

/**
 * @desc    Update a task
 *          Admin: can update all fields
 *          Member: can only update status
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (req.user.role === 'member') {
    // Members can only update status of their assigned tasks
    if (task.assignedTo?.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Access denied: This task is not assigned to you');
    }

    const { status } = req.body;
    if (!status) {
      res.status(400);
      throw new Error('Members can only update task status');
    }

    task.status = status;
  } else {
    // Admin can update all fields
    const { title, description, priority, deadline, assignedTo, status } = req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (deadline) task.deadline = deadline;
    if (status) task.status = status;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
  }

  const updatedTask = await task.save();
  await updatedTask.populate('assignedTo', 'name email');
  await updatedTask.populate('createdBy', 'name email');
  await updatedTask.populate('project', 'title');

  res.json({
    success: true,
    message: 'Task updated successfully',
    data: updatedTask,
  });
});

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private/Admin
 */
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Verify admin is the project creator
  const project = await Project.findById(task.project);
  if (!project || project.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Access denied: Only the project creator can delete tasks');
  }

  await task.deleteOne();

  res.json({
    success: true,
    message: 'Task deleted successfully',
  });
});

/**
 * @desc    Add a comment to a task
 * @route   POST /api/tasks/:id/comments
 * @access  Private
 */
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text) {
    res.status(400);
    throw new Error('Comment text is required');
  }

  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Members can only comment on their assigned tasks
  if (
    req.user.role === 'member' &&
    task.assignedTo?.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Access denied: This task is not assigned to you');
  }

  task.comments.push({ text, author: req.user._id });
  await task.save();

  await task.populate('comments.author', 'name email');

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: task.comments,
  });
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
};
