const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

/**
 * @desc    Get dashboard stats
 *          Admin: full analytics
 *          Member: personal task stats
 * @route   GET /api/dashboard
 * @access  Private
 */
const getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();

  if (req.user.role === 'admin') {
    // ── Admin Dashboard ──────────────────────────────────────────────

    // Project stats
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'active' });
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const overdueProjects = await Project.countDocuments({
      status: { $ne: 'completed' },
      deadline: { $lt: now },
    });

    // Task stats
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const inProgressTasks = await Task.countDocuments({ status: 'in-progress' });
    const todoTasks = await Task.countDocuments({ status: 'todo' });
    const overdueTasks = await Task.countDocuments({
      status: { $ne: 'completed' },
      deadline: { $lt: now },
    });

    // Team stats
    const totalMembers = await User.countDocuments({ role: 'member', isActive: true });

    // Recent projects (last 5)
    const recentProjects = await Project.find()
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent tasks (last 5)
    const recentTasks = await Task.find()
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // Team productivity: tasks completed per member
    const memberProductivity = await Task.aggregate([
      { $match: { status: 'completed', assignedTo: { $ne: null } } },
      { $group: { _id: '$assignedTo', completedTasks: { $sum: 1 } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          name: '$user.name',
          email: '$user.email',
          completedTasks: 1,
        },
      },
      { $sort: { completedTasks: -1 } },
      { $limit: 10 },
    ]);

    // Tasks by priority
    const tasksByPriority = await Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Tasks by status
    const tasksByStatus = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        role: 'admin',
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          overdue: overdueProjects,
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          inProgress: inProgressTasks,
          todo: todoTasks,
          overdue: overdueTasks,
        },
        team: {
          totalMembers,
          productivity: memberProductivity,
        },
        charts: {
          tasksByPriority,
          tasksByStatus,
        },
        recentProjects,
        recentTasks,
      },
    });
  } else {
    // ── Member Dashboard ─────────────────────────────────────────────

    const userId = req.user._id;

    // Task stats for this member
    const totalAssigned = await Task.countDocuments({ assignedTo: userId });
    const completedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: 'completed',
    });
    const inProgressTasks = await Task.countDocuments({
      assignedTo: userId,
      status: 'in-progress',
    });
    const todoTasks = await Task.countDocuments({
      assignedTo: userId,
      status: 'todo',
    });
    const overdueTasks = await Task.countDocuments({
      assignedTo: userId,
      status: { $ne: 'completed' },
      deadline: { $lt: now },
    });

    // Projects this member belongs to
    const myProjects = await Project.find({ members: userId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Upcoming tasks (next 7 days, not completed)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingTasks = await Task.find({
      assignedTo: userId,
      status: { $ne: 'completed' },
      deadline: { $gte: now, $lte: nextWeek },
    })
      .populate('project', 'title')
      .sort({ deadline: 1 })
      .limit(5);

    // Recent tasks
    const recentTasks = await Task.find({ assignedTo: userId })
      .populate('project', 'title')
      .sort({ updatedAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        role: 'member',
        tasks: {
          total: totalAssigned,
          completed: completedTasks,
          inProgress: inProgressTasks,
          todo: todoTasks,
          overdue: overdueTasks,
        },
        myProjects,
        upcomingTasks,
        recentTasks,
      },
    });
  }
});

module.exports = { getDashboard };
