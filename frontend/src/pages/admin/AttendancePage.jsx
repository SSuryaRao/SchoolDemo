import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { useData } from '../../contexts/DataContext';
import { formatDate } from '../../utils/formatters';

const classes = ['10A', '10B', '9A', '9B', '8A', '8B'];

export default function AttendancePage() {
  const { students, attendanceSummary, recentAbsences, saveAttendance, getAttendanceForDay } = useData();

  const [selectedClass, setSelectedClass] = useState('10A');
  const [selectedDate, setSelectedDate]   = useState('2026-03-17');
  const [attendance, setAttendance]       = useState({});
  const [saved, setSaved]                 = useState(false);

  const classStudents = students.filter(s => `${s.class}${s.section}` === selectedClass);

  // Load previously saved attendance when class or date changes
  useEffect(() => {
    const prev = getAttendanceForDay(selectedDate, selectedClass);
    if (prev) {
      setAttendance(prev);
      setSaved(true);
    } else {
      // Default all to present
      const defaults = {};
      classStudents.forEach(s => { defaults[s.id] = 'present'; });
      setAttendance(defaults);
      setSaved(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, selectedDate]);

  function setStatus(id, status) {
    setAttendance(prev => ({ ...prev, [id]: status }));
    setSaved(false);
  }

  function markAll(status) {
    const all = {};
    classStudents.forEach(s => { all[s.id] = status; });
    setAttendance(all);
    setSaved(false);
  }

  function handleSave() {
    saveAttendance(selectedDate, selectedClass, attendance);
    toast.success(`Attendance saved for ${selectedClass} — ${formatDate(selectedDate)}`);
    setSaved(true);
  }

  const classSummary = classes.map(cls => {
    const clsStudents = students.filter(s => `${s.class}${s.section}` === cls);
    const stats = clsStudents.map(s => attendanceSummary[s.id] || {});
    const avgPct = stats.reduce((s, v) => s + (v.percentage || 0), 0) / Math.max(stats.length, 1);
    return { cls, count: clsStudents.length, avgPct: avgPct.toFixed(1) };
  });

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Mark and track student attendance" />

      <Tab.Group>
        <Tab.List className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 w-fit">
          {['Mark Attendance', 'Overview'].map(tab => (
            <Tab key={tab} className={({ selected }) =>
              `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${selected ? 'bg-primary-600 text-white' : 'text-gray-500 hover:text-gray-700'}`
            }>{tab}</Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          {/* Mark Attendance */}
          <Tab.Panel>
            <div className="page-card p-4 sm:p-6">
              <div className="flex flex-wrap gap-3 mb-6">
                <select className="select w-32" value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}>
                  {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
                <input type="date" className="input w-44" value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)} />
                <button onClick={() => markAll('present')} className="btn-secondary text-sm">Mark All Present</button>
                <button onClick={() => markAll('absent')} className="btn-secondary text-sm text-red-600">Mark All Absent</button>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                <p className="text-sm text-blue-700 font-medium">{selectedClass} — {classStudents.length} students</p>
                {saved && <p className="text-xs text-emerald-600 font-medium">✓ Attendance saved</p>}
              </div>

              <div className="space-y-2">
                {classStudents.map(s => {
                  const status = attendance[s.id] || 'present';
                  return (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={s.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                          <p className="text-xs text-gray-400">Roll #{s.rollNumber}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                        {(['present', 'late', 'absent']).map(st => (
                          <button
                            key={st}
                            onClick={() => setStatus(s.id, st)}
                            className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                              status === st
                                ? st === 'present' ? 'bg-emerald-500 text-white border-emerald-500'
                                  : st === 'late'    ? 'bg-amber-500 text-white border-amber-500'
                                  :                   'bg-red-500 text-white border-red-500'
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <span className="hidden sm:inline">{st.charAt(0).toUpperCase() + st.slice(1)}</span>
                            <span className="sm:hidden">{st === 'present' ? 'P' : st === 'late' ? 'L' : 'A'}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center gap-3 flex-wrap">
                <button onClick={handleSave} className="btn-primary">
                  {saved ? '✓ Saved' : 'Save Attendance'}
                </button>
                {saved && <p className="text-sm text-emerald-600">Parent notifications sent for absences.</p>}
              </div>
            </div>
          </Tab.Panel>

          {/* Overview */}
          <Tab.Panel>
            <div className="grid gap-4">
              <div className="page-card p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Class-wise Attendance Summary</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="table-th">Class</th>
                        <th className="table-th">Students</th>
                        <th className="table-th">Avg. Attendance</th>
                        <th className="table-th">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {classSummary.map(({ cls, count, avgPct }) => (
                        <tr key={cls}>
                          <td className="table-td font-semibold">Class {cls}</td>
                          <td className="table-td">{count}</td>
                          <td className="table-td">
                            <div className="flex items-center gap-2">
                              <div className="w-20 sm:w-24 bg-gray-100 rounded-full h-1.5">
                                <div className={`h-1.5 rounded-full ${parseFloat(avgPct) >= 90 ? 'bg-emerald-500' : parseFloat(avgPct) >= 75 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${avgPct}%` }} />
                              </div>
                              <span className="text-sm font-medium">{avgPct}%</span>
                            </div>
                          </td>
                          <td className="table-td">
                            <Badge color={parseFloat(avgPct) >= 90 ? 'green' : parseFloat(avgPct) >= 75 ? 'yellow' : 'red'}>
                              {parseFloat(avgPct) >= 90 ? 'Excellent' : parseFloat(avgPct) >= 75 ? 'Good' : 'Needs Attention'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="page-card p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Absences</h3>
                {recentAbsences.length === 0 ? (
                  <p className="text-sm text-gray-400">No recent absences.</p>
                ) : (
                  <div className="space-y-3">
                    {recentAbsences.map((a, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-xl gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar name={a.studentName} size="sm" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{a.studentName}</p>
                            <p className="text-xs text-gray-500">Class {a.class} · {formatDate(a.date)}</p>
                          </div>
                        </div>
                        <Badge color={a.parentNotified ? 'green' : 'yellow'}>
                          {a.parentNotified ? '✓ Notified' : 'Pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
