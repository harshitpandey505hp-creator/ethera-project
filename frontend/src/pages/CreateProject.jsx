import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: '',
    status: 'active',
    members: [],
  });

  useEffect(() => {
    // Fetch all users for member selection
    api.get('/auth/users').then((res) => setUsers(res.data.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleMember = (userId) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter((id) => id !== userId)
        : [...prev.members, userId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.deadline) {
      toast.error('Title and deadline are required');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/projects', form);
      toast.success('Project created successfully!');
      navigate(`/projects/${res.data.data._id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const members = users.filter((u) => u.role === 'member');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Create New Project</h2>
        <p className="text-sm text-gray-500 mt-1">Fill in the details to create a new project</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g. E-Commerce Redesign"
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
            placeholder="Brief description of the project..."
            maxLength={500}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="input-field">
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Team members */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Members ({form.members.length} selected)
          </label>
          {members.length === 0 ? (
            <p className="text-sm text-gray-400">No members available</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {members.map((u) => (
                <label key={u._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-md">
                  <input
                    type="checkbox"
                    checked={form.members.includes(u._id)}
                    onChange={() => toggleMember(u._id)}
                    className="rounded text-blue-600"
                  />
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-700 truncate">{u.name}</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Creating...' : 'Create Project'}
          </button>
          <button type="button" onClick={() => navigate('/projects')} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
