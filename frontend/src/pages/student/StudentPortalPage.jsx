import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { getTodayTimetable, periodTimes } from '../../data/timetable';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { formatDate, formatCurrency } from '../../utils/formatters';

const subjectColors = {
  Mathematics:       'bg-blue-100 text-blue-700',
  Science:           'bg-green-100 text-green-700',
  English:           'bg-purple-100 text-purple-700',
  History:           'bg-amber-100 text-amber-700',
  'Computer Science': 'bg-cyan-100 text-cyan-700',
  PE:                'bg-rose-100 text-rose-700',
};

export default function StudentPortalPage() {
  const { user } = useAuth();
  const { students, grades: gradesByStudent, attendanceSummary, fees, remarks, events } = useData();

  const student = students.find(s => s.id === user?.linkedStudentId);
  if (!student) return <div className="p-8 text-gray-400">Student not found.</div>;

  const att            = attendanceSummary[student.id] || {};
  const sgrades        = gradesByStudent[student.id] || [];
  const studentFees    = fees[student.id];
  const studentRemarks = remarks.filter(r => r.studentId === student.id).slice(0, 2);
  const gpa            = sgrades.length
    ? (Math.round(sgrades.reduce((s, g) => s + g.gpa, 0) / sgrades.length * 100) / 100)
    : 0;

  const classSection   = `${student.class}${student.section}`;
  const todaySchedule  = getTodayTimetable(classSection);
  const today          = new Date().toISOString().slice(0, 10);
  const upcomingExams  = events.filter(e => e.type === 'exam' && e.date >= today).slice(0, 3);
  const pendingFees    = studentFees?.terms.filter(t => t.status !== 'paid') || [];

  return (
    <div className="space-y-6">
      {/* Welcome card */}
      <div className="page-card p-6">
        <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
          <Avatar name={student.name} size="xl" />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Welcome back, {student.name.split(' ')[0]}! 👋</h1>
            <p className="text-sm text-gray-500">Class {classSection} · Roll #{student.rollNumber}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge color={att.percentage >= 85 ? 'green' : 'yellow'}>{att.percentage}% Attendance</Badge>
              <Badge color="blue">GPA: {gpa}</Badge>
              {pendingFees.length > 0 && <Badge color="yellow">{pendingFees.length} Fee(s) Pending</Badge>}
            </div>
          </div>
        </div>
      </div>

      {/* Today's timetable */}
      <div className="page-card p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Today's Timetable
          {todaySchedule ? <span className="text-gray-400 font-normal ml-2">— {todaySchedule.day}</span> : ''}
        </h3>
        {todaySchedule ? (
          <div className="flex gap-3 overflow-x-auto pb-2 -webkit-overflow-scrolling-touch">
            {todaySchedule.subjects.map((sub, i) => (
              <div key={i} className={`flex-shrink-0 rounded-xl p-3 min-w-[110px] ${subjectColors[sub] || 'bg-gray-100 text-gray-700'}`}>
                <p className="text-xs font-medium opacity-70">{periodTimes[i]?.time}</p>
                <p className="text-sm font-bold mt-1">{sub}</p>
                <p className="text-xs opacity-60 mt-0.5">Period {i + 1}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No school today. Enjoy your day! 🎉</p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Attendance', value: `${att.percentage}%`, sub: `${att.present}/${att.totalDays} days`, color: att.percentage >= 85 ? 'green' : 'yellow' },
          { label: 'Overall GPA', value: gpa, sub: `${sgrades.length} subjects`, color: 'blue' },
          { label: 'Fee Status', value: pendingFees.length === 0 ? 'Clear' : 'Pending', sub: pendingFees.length === 0 ? 'All paid' : `${pendingFees.length} term(s)`, color: pendingFees.length === 0 ? 'green' : 'yellow' },
          { label: 'Exams Ahead', value: upcomingExams.length, sub: 'in next 30 days', color: 'purple' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="stat-card">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Grades */}
        <div className="page-card p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">My Grades</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase pb-2">Subject</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase pb-2">Score</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase pb-2">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sgrades.map(g => (
                <tr key={g.subject}>
                  <td className="py-2 text-sm font-medium text-gray-800">{g.subject}</td>
                  <td className="py-2 text-sm text-right text-gray-600">{g.percentage}%</td>
                  <td className="py-2 text-right">
                    <Badge color={g.gpa >= 3.7 ? 'green' : g.gpa >= 3.0 ? 'blue' : g.gpa >= 2.0 ? 'yellow' : 'red'}>{g.grade}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Upcoming exams + Remarks */}
        <div className="space-y-4">
          <div className="page-card p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Upcoming Exams</h3>
            {upcomingExams.length ? (
              <div className="space-y-2">
                {upcomingExams.map(ev => (
                  <div key={ev.id} className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                    <div className="w-9 text-center">
                      <p className="text-xs text-gray-400">{new Date(ev.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}</p>
                      <p className="text-base font-bold text-gray-900">{new Date(ev.date + 'T00:00:00').getDate()}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{ev.title}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400">No upcoming exams.</p>}
          </div>

          <div className="page-card p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Teacher Remarks</h3>
            {studentRemarks.length ? (
              <div className="space-y-3">
                {studentRemarks.map(r => (
                  <div key={r.id} className="border-l-4 border-primary-200 pl-3">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium text-gray-600">{r.teacherName} · {r.subject}</span>
                      <Badge color={r.sentiment === 'positive' ? 'green' : 'yellow'} className="text-xs">
                        {r.sentiment === 'positive' ? '👍' : '⚠️'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 italic">"{r.text.slice(0, 100)}…"</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400">No remarks yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
