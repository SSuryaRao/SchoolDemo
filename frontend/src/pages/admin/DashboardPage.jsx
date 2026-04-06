import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsersIcon, AcademicCapIcon, CalendarDaysIcon, CurrencyDollarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import StatCard from '../../components/ui/StatCard';
import ConfirmModal from '../../components/ui/ConfirmModal';
import AttendanceBarChart from '../../components/charts/AttendanceBarChart';
import GradeDistributionPie from '../../components/charts/GradeDistributionPie';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { feeStructure } from '../../data/fees';

const recentActivity = [
  { time: '9:15 AM',   text: 'Attendance marked for Class 10A', type: 'attendance' },
  { time: '9:02 AM',   text: 'Fee received: Alex Johnson — Term 2', type: 'fee' },
  { time: 'Yesterday', text: 'Exam results uploaded for Midterm', type: 'grade' },
  { time: 'Yesterday', text: 'Leave approved: Liam Thompson (2 days)', type: 'leave' },
  { time: 'Mar 14',    text: 'New student enrolled: Zara Ahmed — Class 9A', type: 'student' },
  { time: 'Mar 13',    text: 'Parent-Teacher meeting scheduled for Feb 7', type: 'event' },
];

const activityColors = {
  attendance: 'bg-blue-100 text-blue-600',
  fee:        'bg-green-100 text-green-600',
  grade:      'bg-purple-100 text-purple-600',
  leave:      'bg-amber-100 text-amber-600',
  student:    'bg-cyan-100 text-cyan-600',
  event:      'bg-pink-100 text-pink-600',
};

const activityIcons = { attendance: '📋', fee: '💳', grade: '📊', leave: '📝', student: '👤', event: '📅' };

const eventTypeStyle = { holiday: 'badge-red', exam: 'badge-orange', event: 'badge-blue', meeting: 'badge-green' };

function getFeeSummary(fees, students) {
  let totalCollected = 0, totalPending = 0, totalOverdue = 0;
  students.forEach(s => {
    const sf = fees[s.id];
    if (!sf) return;
    sf.terms.forEach(t => {
      totalCollected += t.paid;
      if (t.status === 'pending' || t.status === 'partial') totalPending += t.balance;
      if (t.status === 'overdue') totalOverdue += t.balance;
    });
  });
  const totalExpected = students.length * feeStructure.total * 3;
  return {
    totalCollected,
    totalPending,
    totalOverdue,
    collectionRate: totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 1000) / 10 : 0,
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { students, teachers, fees, events, attendanceSummary, resetData } = useData();

  const [resetOpen, setResetOpen] = useState(false);

  const feeSummary = getFeeSummary(fees, students);

  const avgAttendance = Object.values(attendanceSummary).length > 0
    ? Object.values(attendanceSummary).reduce((s, v) => s + v.percentage, 0) / Object.keys(attendanceSummary).length
    : 0;

  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = events
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{greeting}, {user?.name?.split(' ')[0]}. 👋</h1>
          <p className="text-sm text-gray-500 mt-0.5">Here's what's happening at Springfield Academy today.</p>
        </div>
        <button
          onClick={() => setResetOpen(true)}
          className="btn-secondary text-xs text-gray-500 hover:text-red-600"
          title="Reset to demo data"
        >
          <ArrowPathIcon className="w-4 h-4" /> Reset Demo Data
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={students.length} icon={UsersIcon} iconColor="blue" trend={2} />
        <StatCard title="Total Teachers" value={teachers.length} icon={AcademicCapIcon} iconColor="purple" />
        <StatCard
          title="Avg. Attendance"
          value={`${avgAttendance.toFixed(1)}%`}
          icon={CalendarDaysIcon}
          iconColor={avgAttendance >= 85 ? 'green' : 'amber'}
        />
        <StatCard
          title="Fees Collected"
          value={formatCurrency(feeSummary.totalCollected)}
          subtitle={`${feeSummary.collectionRate}% collection rate`}
          icon={CurrencyDollarIcon}
          iconColor="green"
        >
          <div className="mt-3">
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${feeSummary.collectionRate}%` }} />
            </div>
          </div>
        </StatCard>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="page-card p-4 lg:p-6 lg:col-span-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Attendance This Week</h3>
          <AttendanceBarChart />
        </div>
        <div className="page-card p-4 lg:p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Grade Distribution</h3>
          <GradeDistributionPie />
        </div>
      </div>

      {/* Activity + Events */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="page-card p-4 lg:p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${activityColors[item.type]}`}>
                  {activityIcons[item.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">{item.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="page-card p-4 lg:p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Upcoming Events</h3>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-gray-400">No upcoming events.</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map(ev => (
                <div key={ev.id} className="flex items-start gap-3">
                  <div className="w-10 text-center flex-shrink-0">
                    <p className="text-xs font-semibold text-gray-500 uppercase">{new Date(ev.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}</p>
                    <p className="text-lg font-bold text-gray-900 leading-tight">{new Date(ev.date + 'T00:00:00').getDate()}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                    <span className={`badge text-xs mt-0.5 ${eventTypeStyle[ev.type]}`}>{ev.type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Mark Attendance', icon: '📋', desc: "Today's class attendance",      path: '/admin/attendance', color: 'blue' },
          { label: 'View Fee Dues',   icon: '💳', desc: `${formatCurrency(feeSummary.totalOverdue)} overdue`, path: '/admin/fees', color: 'green' },
          { label: 'View Gradebook',  icon: '📊', desc: 'Latest exam results',           path: '/admin/grades', color: 'purple' },
        ].map(({ label, icon, desc, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="page-card p-4 text-left hover:shadow-md transition-shadow"
          >
            <span className="text-2xl">{icon}</span>
            <p className="text-sm font-semibold text-gray-800 mt-2">{label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
          </button>
        ))}
      </div>

      {/* Reset confirm */}
      <ConfirmModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={resetData}
        title="Reset Demo Data"
        message="This will clear all manual changes and restore the original demo data. This cannot be undone."
        confirmLabel="Reset Everything"
      />
    </div>
  );
}
