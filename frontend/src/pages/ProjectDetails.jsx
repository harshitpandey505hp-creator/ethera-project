import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setProject((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t._id !== taskId),
      }));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete task');
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      setProject((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t._id === taskId ? { ...t, status } : t)),
      }));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!project) return null;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const isOverdue = project.status !== 'completed' && new Date() > new Date(project.deadline);

  const filteredTasks = project.tasks?.filter((t) =>
    statusFilter ? t.status === statusFilter : true
  ) || [];

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Projects
      </Link>

      {/* Project header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-gray-800">{project.title}</h2>
              <StatusBadge status={project.status} />
              {isOverdue && <OverdueBadge />}
            </div>
            {project.description && (
              <p className="text-gray-500 mt-2">{project.description}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              <span>Created by <strong>{project.createdBy?.name}</strong></span>
              <span>Deadline: <strong>{formatDate(project.deadline)}</strong></span>
              <span>{project.tasks?.length || 0} tasks</span>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Link to={`/projects/${id}/edit`} className="btn-secondary text-sm">Edit</Link>
            </div>
          )}
        </div>

        {/* Members */}
        {project.members?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-medium mb-2">Team Members</p>
            <div className="flex flex-wrap gap-2">
              {project.members.map((m) => (
                <div key={m._id} className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {m.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-gray-700">{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tasks section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-semibold text-gray-800">Tasks ({filteredTasks.length})</h3>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field text-sm py-1.5 max-w-[160px]"
            >
              <option value="">All Statuses</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            {isAdmin && (
              <Link to={`/tasks/new?projectId=${id}`} className="btn-primary text-sm py-1.5 inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Task
              </Link>
            )}
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-gray-400">No tasks found</p>
            {isAdmin && (
              <Link to={`/tasks/new?projectId=${id}`} className="btn-primary inline-flex mt-3 text-sm">
                Create first task
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const taskOverdue = task.status !== 'completed' && new Date() > new Date(task.deadline);
              const canUpdateStatus =
                isAdmin || task.assignedTo?._id === user?._id || task.assignedTo === user?._id;

              return (
                <div key={task._id} className="card hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-800">{task.title}</span>
                        <PriorityBadge priority={task.priority} />
                        {taskOverdue && <OverdueBadge />}
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{task.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                        <span>Assigned: {task.assignedTo?.name || 'Unassigned'}</span>
                        <span>Due: {formatDate(task.deadline)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canUpdateStatus ? (
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="todo">Todo</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (
                        <StatusBadge status={task.status} />
                      )}

                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
