import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: '',
    status: 'active',
    members: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, usersRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get('/auth/users'),
        ]);
        const p = projectRes.data.data;
        setForm({
          title: p.title,
          description: p.description || '',
          deadline: new Date(p.deadline).toISOString().split('T')[0],
          status: p.status,
          members: p.members?.map((m) => m._id) || [],
        });
        setUsers(usersRes.data.data);
      } catch (err) {
        toast.error('Failed to load project');
        navigate('/projects');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleMember = (userId) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter((mid) => mid !== userId)
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
      await api.put(`/projects/${id}`, form);
      toast.success('Project updated successfully!');
      navigate(`/projects/${id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" /></div>;

  const members = users.filter((u) => u.role === 'member');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Edit Project</h2>
        <p className="text-sm text-gray-500 mt-1">Update project details</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Title <span className="text-red-500">*</span>
          </label>
          <input type="text" name="title" value={form.title} onChange={handleChange}
            className="input-field" maxLength={100} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange}
            className="input-field resize-none" rows={3} maxLength={500} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline <span className="text-red-500">*</span></label>
            <input type="date" name="deadline" value={form.deadline} onChange={handleChange} className="input-field" />
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Members ({form.members.length} selected)
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {members.map((u) => (
              <label key={u._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-md">
                <input type="checkbox" checked={form.members.includes(u._id)}
                  onChange={() => toggleMember(u._id)} className="rounded text-blue-600" />
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700 truncate">{u.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => navigate(`/projects/${id}`)} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProject;
