import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const CreateTask = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProject = searchParams.get('projectId');

  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: '',
    projectId: preselectedProject || '',
    assignedTo: '',
  });

  useEffect(() => {
    api.get('/projects').then((res) => setProjects(res.data.data)).catch(() => {});
  }, []);

  // When project changes, load its members
  useEffect(() => {
    if (form.projectId) {
      const project = projects.find((p) => p._id === form.projectId);
      setProjectMembers(project?.members || []);
      setForm((prev) => ({ ...prev, assignedTo: '' }));
    }
  }, [form.projectId, projects]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.deadline || !form.projectId) {
      toast.error('Title, deadline, and project are required');
      return;
    }
    setLoading(true);
    try {
      await api.post('/tasks', {
        ...form,
        assignedTo: form.assignedTo || undefined,
      });
      toast.success('Task created successfully!');
      navigate(preselectedProject ? `/projects/${preselectedProject}` : '/tasks');
    } catch (err) {
      toast.error(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Create New Task</h2>
        <p className="text-sm text-gray-500 mt-1">Add a task to a project</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g. Design homepage mockup"
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="input-field resize-none"
            rows={3}
            placeholder="Task details..."
            maxLength={1000}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project <span className="text-red-500">*</span>
          </label>
          <select name="projectId" value={form.projectId} onChange={handleChange} className="input-field">
            <option value="">Select a project</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange} className="input-field">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              className="input-field"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
          <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className="input-field"
            disabled={!form.projectId}>
            <option value="">Unassigned</option>
            {projectMembers.map((m) => (
              <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
            ))}
          </select>
          {!form.projectId && (
            <p className="text-xs text-gray-400 mt-1">Select a project first to assign a member</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Creating...' : 'Create Task'}
          </button>
          <button
            type="button"
            onClick={() => navigate(preselectedProject ? `/projects/${preselectedProject}` : '/tasks')}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;
