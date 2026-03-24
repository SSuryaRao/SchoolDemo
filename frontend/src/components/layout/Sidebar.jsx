import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon, UsersIcon, CalendarDaysIcon, AcademicCapIcon,
  CurrencyDollarIcon, CalendarIcon, UserIcon, UserGroupIcon,
} from '@heroicons/react/24/outline';

const adminNav = [
  { to: '/admin/dashboard',  label: 'Dashboard',  Icon: HomeIcon },
  { to: '/admin/students',   label: 'Students',   Icon: UsersIcon },
  { to: '/admin/teachers',   label: 'Teachers',   Icon: UserGroupIcon },
  { to: '/admin/attendance', label: 'Attendance', Icon: CalendarDaysIcon },
  { to: '/admin/grades',     label: 'Grades',     Icon: AcademicCapIcon },
  { to: '/admin/fees',       label: 'Fees',       Icon: CurrencyDollarIcon },
  { to: '/admin/calendar',   label: 'Calendar',   Icon: CalendarIcon },
];

const studentNav = [
  { to: '/student/portal', label: 'My Dashboard', Icon: HomeIcon },
];

const parentNav = [
  { to: '/parent/portal', label: "My Child", Icon: UserIcon },
];

export default function Sidebar({ onClose }) {
  const { user } = useAuth();
  const nav = user?.role === 'admin' ? adminNav : user?.role === 'student' ? studentNav : parentNav;

  return (
    <div className="w-60 bg-white border-r border-gray-100 flex flex-col h-full">
      <div className="h-16 flex items-center gap-2 px-4 border-b border-gray-100 flex-shrink-0">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">SA</span>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Springfield</p>
          <p className="text-xs text-gray-400">Academy</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto p-1 rounded hover:bg-gray-100 lg:hidden">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
          {user?.role === 'admin' ? 'Administration' : user?.role === 'student' ? 'Student' : 'Parent'}
        </p>
        {nav.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <div className="bg-primary-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-primary-700">EduManage Pro</p>
          <p className="text-xs text-primary-500 mt-0.5">Demo Version 1.0</p>
        </div>
      </div>
    </div>
  );
}
