const statusConfig = {
  todo: { label: 'Todo', className: 'badge-todo' },
  'in-progress': { label: 'In Progress', className: 'badge-in-progress' },
  completed: { label: 'Completed', className: 'badge-completed' },
  active: { label: 'Active', className: 'badge-in-progress' },
  'on-hold': { label: 'On Hold', className: 'badge-todo' },
  cancelled: { label: 'Cancelled', className: 'badge-high' },
};

const priorityConfig = {
  low: { label: 'Low', className: 'badge-low' },
  medium: { label: 'Medium', className: 'badge-medium' },
  high: { label: 'High', className: 'badge-high' },
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || { label: status, className: 'badge-todo' };
  return <span className={config.className}>{config.label}</span>;
};

export const PriorityBadge = ({ priority }) => {
  const config = priorityConfig[priority] || { label: priority, className: 'badge-low' };
  return <span className={config.className}>{config.label}</span>;
};

export const OverdueBadge = () => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
    Overdue
  </span>
);
