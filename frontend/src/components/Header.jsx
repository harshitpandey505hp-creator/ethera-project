import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/projects/new': 'Create Project',
  '/tasks': 'Tasks',
  '/tasks/new': 'Create Task',
};

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const location = useLocation();

  const title =
    pageTitles[location.pathname] ||
    (location.pathname.includes('/edit') ? 'Edit Project' : 'Project Details');

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between">
      {/* Mobile menu button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">{user?.name}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
