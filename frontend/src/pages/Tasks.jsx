import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const res = await api.get('/tasks', { params });
      setTasks(res.data.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status } : t)));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete task');
    }
  };

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Tasks</h2>
          <p className="text-sm text-gray-500">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <Link to="/tasks/new" className="btn-primary inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-xs"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field max-w-[160px]">
          <option value="">All Statuses</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="input-field max-w-[160px]">
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Tasks table */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="text-gray-500 font-medium">No tasks found</p>
          {isAdmin && (
            <Link to="/tasks/new" className="btn-primary inline-flex mt-4">Create a task</Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-3 pr-4">Task</th>
                  <th className="pb-3 pr-4">Project</th>
                  <th className="pb-3 pr-4">Assigned To</th>
                  <th className="pb-3 pr-4">Priority</th>
                  <th className="pb-3 pr-4">Deadline</th>
                  <th className="pb-3 pr-4">Status</th>
                  {isAdmin && <th className="pb-3">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((task) => {
                  const isOverdue = task.status !== 'completed' && new Date() > new Date(task.deadline);
                  return (
                    <tr key={task._id} className="hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <div>
                          <span className="font-medium text-gray-800">{task.title}</span>
                          {isOverdue && <span className="ml-2"><OverdueBadge /></span>}
                        </div>
                        {task.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-gray-500">
                        {task.project ? (
                          <Link to={`/projects/${task.project._id}`} className="hover:text-blue-600">
                            {task.project.title}
                          </Link>
                        ) : '—'}
                      </td>
                      <td className="py-3 pr-4 text-gray-500">{task.assignedTo?.name || 'Unassigned'}</td>
                      <td className="py-3 pr-4"><PriorityBadge priority={task.priority} /></td>
                      <td className="py-3 pr-4 text-gray-500">{formatDate(task.deadline)}</td>
                      <td className="py-3 pr-4">
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="todo">Todo</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      {isAdmin && (
                        <td className="py-3">
                          <button
                            onClick={() => handleDelete(task._id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((task) => {
              const isOverdue = task.status !== 'completed' && new Date() > new Date(task.deadline);
              return (
                <div key={task._id} className="card">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-medium text-gray-800">{task.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{task.project?.title || '—'}</p>
                    </div>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {isOverdue && <OverdueBadge />}
                    <span className="text-xs text-gray-400">Due {formatDate(task.deadline)}</span>
                    <span className="text-xs text-gray-400">{task.assignedTo?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none"
                    >
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    {isAdmin && (
                      <button onClick={() => handleDelete(task._id)}
                        className="text-xs text-red-500 hover:text-red-700">Delete</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Tasks;
