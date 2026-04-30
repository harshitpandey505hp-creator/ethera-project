import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, OverdueBadge } from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter((p) => p._id !== id));
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete project');
    }
  };

  const filtered = projects.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? p.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Projects</h2>
          <p className="text-sm text-gray-500">{filtered.length} project{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <Link to="/projects/new" className="btn-primary inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Projects grid */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-500 font-medium">No projects found</p>
          {isAdmin && (
            <Link to="/projects/new" className="btn-primary inline-flex mt-4">Create your first project</Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const isOverdue = project.status !== 'completed' && new Date() > new Date(project.deadline);
            const progress = project.taskCount > 0
              ? Math.round((project.completedTaskCount / project.taskCount) * 100)
              : 0;

            return (
              <div key={project._id} className="card hover:shadow-md transition-shadow">
                {/* Card header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <Link to={`/projects/${project._id}`}
                      className="font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-1">
                      {project.title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">By {project.createdBy?.name}</p>
                  </div>
                  <StatusBadge status={project.status} />
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{project.description}</p>
                )}

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{project.completedTaskCount}/{project.taskCount} tasks</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    {isOverdue && <OverdueBadge />}
                    <span className="text-xs text-gray-400">
                      Due {formatDate(project.deadline)}
                    </span>
                  </div>

                  {/* Members avatars */}
                  <div className="flex -space-x-1.5">
                    {project.members?.slice(0, 3).map((m) => (
                      <div key={m._id}
                        title={m.name}
                        className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                        {m.name?.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {project.members?.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-bold">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin actions */}
                {isAdmin && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <Link to={`/projects/${project._id}`} className="flex-1 text-center text-xs py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">
                      View
                    </Link>
                    <Link to={`/projects/${project._id}/edit`} className="flex-1 text-center text-xs py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="flex-1 text-xs py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Projects;
