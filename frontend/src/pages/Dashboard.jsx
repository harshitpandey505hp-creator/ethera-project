import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin, user } = useAuth();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data.data);
      } catch (err) {
        toast.error(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h2>
        <p className="text-gray-500 mt-1">
          {isAdmin ? "Here's your team's overview" : "Here's your personal task overview"}
        </p>
      </div>

      {isAdmin ? <AdminDashboard data={data} formatDate={formatDate} /> : <MemberDashboard data={data} formatDate={formatDate} />}
    </div>
  );
};

// ── Admin Dashboard ────────────────────────────────────────────────────────────
const AdminDashboard = ({ data, formatDate }) => (
  <>
    {/* Project stats */}
    <div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Projects</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Projects" value={data.projects.total} color="blue"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
        />
        <StatCard title="Active" value={data.projects.active} color="green"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard title="Completed" value={data.projects.completed} color="purple"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
        />
        <StatCard title="Overdue" value={data.projects.overdue} color="red"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>
    </div>

    {/* Task stats */}
    <div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Tasks</h3>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Tasks" value={data.tasks.total} color="blue"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <StatCard title="Completed" value={data.tasks.completed} color="green"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
        />
        <StatCard title="In Progress" value={data.tasks.inProgress} color="yellow"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        />
        <StatCard title="Todo" value={data.tasks.todo} color="gray"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard title="Overdue" value={data.tasks.overdue} color="red"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Projects */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Recent Projects</h3>
          <Link to="/projects" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        <div className="space-y-3">
          {data.recentProjects.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No projects yet</p>
          ) : (
            data.recentProjects.map((p) => (
              <Link key={p._id} to={`/projects/${p._id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.title}</p>
                  <p className="text-xs text-gray-400">Due {formatDate(p.deadline)}</p>
                </div>
                <StatusBadge status={p.status} />
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Team Productivity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Team Productivity</h3>
          <span className="text-xs text-gray-400">{data.team.totalMembers} members</span>
        </div>
        <div className="space-y-3">
          {data.team.productivity.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No completed tasks yet</p>
          ) : (
            data.team.productivity.map((m) => (
              <div key={m._id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                  {m.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{m.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min((m.completedTasks / (data.tasks.completed || 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">{m.completedTasks} done</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>

    {/* Recent Tasks */}
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Recent Tasks</h3>
        <Link to="/tasks" className="text-sm text-blue-600 hover:underline">View all</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <th className="pb-3 pr-4">Task</th>
              <th className="pb-3 pr-4">Project</th>
              <th className="pb-3 pr-4">Assigned To</th>
              <th className="pb-3 pr-4">Priority</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.recentTasks.map((t) => (
              <tr key={t._id} className="hover:bg-gray-50">
                <td className="py-3 pr-4 font-medium text-gray-800">{t.title}</td>
                <td className="py-3 pr-4 text-gray-500">{t.project?.title || '—'}</td>
                <td className="py-3 pr-4 text-gray-500">{t.assignedTo?.name || 'Unassigned'}</td>
                <td className="py-3 pr-4"><PriorityBadge priority={t.priority} /></td>
                <td className="py-3"><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.recentTasks.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">No tasks yet</p>
        )}
      </div>
    </div>
  </>
);

// ── Member Dashboard ───────────────────────────────────────────────────────────
const MemberDashboard = ({ data, formatDate }) => (
  <>
    {/* Task stats */}
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard title="Total Assigned" value={data.tasks.total} color="blue"
        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
      />
      <StatCard title="Completed" value={data.tasks.completed} color="green"
        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
      />
      <StatCard title="In Progress" value={data.tasks.inProgress} color="yellow"
        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
      />
      <StatCard title="Todo" value={data.tasks.todo} color="gray"
        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      />
      <StatCard title="Overdue" value={data.tasks.overdue} color="red"
        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upcoming tasks */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Upcoming Deadlines</h3>
        <div className="space-y-3">
          {data.upcomingTasks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No upcoming tasks this week</p>
          ) : (
            data.upcomingTasks.map((t) => (
              <div key={t._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.project?.title} · Due {formatDate(t.deadline)}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* My projects */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">My Projects</h3>
          <Link to="/projects" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        <div className="space-y-3">
          {data.myProjects.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Not assigned to any projects</p>
          ) : (
            data.myProjects.map((p) => (
              <Link key={p._id} to={`/projects/${p._id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.title}</p>
                  <p className="text-xs text-gray-400">By {p.createdBy?.name} · Due {formatDate(p.deadline)}</p>
                </div>
                <StatusBadge status={p.status} />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>

    {/* Recent tasks table */}
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Recent Tasks</h3>
        <Link to="/tasks" className="text-sm text-blue-600 hover:underline">View all</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <th className="pb-3 pr-4">Task</th>
              <th className="pb-3 pr-4">Project</th>
              <th className="pb-3 pr-4">Priority</th>
              <th className="pb-3 pr-4">Deadline</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.recentTasks.map((t) => (
              <tr key={t._id} className="hover:bg-gray-50">
                <td className="py-3 pr-4 font-medium text-gray-800">{t.title}</td>
                <td className="py-3 pr-4 text-gray-500">{t.project?.title || '—'}</td>
                <td className="py-3 pr-4"><PriorityBadge priority={t.priority} /></td>
                <td className="py-3 pr-4 text-gray-500">{new Date(t.deadline).toLocaleDateString()}</td>
                <td className="py-3"><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.recentTasks.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">No tasks assigned yet</p>
        )}
      </div>
    </div>
  </>
);

export default Dashboard;
