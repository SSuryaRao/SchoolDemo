import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import PerformanceLine from '../../components/charts/PerformanceLine';
import SubjectBarChart from '../../components/charts/SubjectBarChart';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function ParentPortalPage() {
  const { user } = useAuth();
  const { students, grades: gradesByStudent, attendanceSummary, fees, remarks, events } = useData();

  const student = students.find(s => s.id === user?.linkedStudentId);
  if (!student) return <div className="p-8 text-gray-400">No student linked to this account.</div>;

  const att            = attendanceSummary[student.id] || {};
  const sgrades        = gradesByStudent[student.id] || [];
  const studentFees    = fees[student.id];
  const studentRemarks = remarks.filter(r => r.studentId === student.id);
  const gpa            = sgrades.length
    ? Math.round(sgrades.reduce((s, g) => s + g.gpa, 0) / sgrades.length * 100) / 100
    : 0;

  const today    = new Date().toISOString().slice(0, 10);
  const nextExam = events.find(e => e.type === 'exam' && e.date >= today);

  return (
    <div className="space-y-6">
      {/* Child profile */}
      <div className="page-card p-4 sm:p-6">
        <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
          <Avatar name={student.name} size="xl" />
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
                <p className="text-sm text-gray-500">Class {student.class}{student.section} · Academic Year 2025–26</p>
                <p className="text-xs text-gray-400 mt-0.5">Roll #{student.rollNumber} · Blood Group: {student.bloodGroup}</p>
              </div>
              <Badge color="green">Active Student</Badge>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {[
                { label: 'Attendance', value: `${att.percentage}%`, color: att.percentage >= 85 ? 'bg-green-50' : 'bg-amber-50' },
                { label: 'Overall GPA', value: gpa, color: 'bg-blue-50' },
                { label: 'Fees Due', value: studentFees?.terms.some(t => t.status !== 'paid') ? 'Pending' : 'Clear', color: studentFees?.terms.some(t => t.status !== 'paid') ? 'bg-amber-50' : 'bg-green-50' },
                { label: 'Next Exam', value: nextExam ? formatDate(nextExam.date) : 'None', color: 'bg-orange-50' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`rounded-xl p-3 ${color}`}>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-base font-bold text-gray-900 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="page-card p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Academic Performance (All Exams)</h3>
          <PerformanceLine studentId={student.id} />
        </div>
        <div className="page-card p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Subject-wise Scores</h3>
          <SubjectBarChart studentId={student.id} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Attendance summary */}
        <div className="page-card p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Attendance Summary</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Present', value: att.present,   color: 'text-emerald-600' },
              { label: 'Absent',  value: att.absent,    color: 'text-red-500' },
              { label: 'Late',    value: att.late,       color: 'text-amber-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center p-3 bg-gray-50 rounded-xl">
                <p className={`text-2xl font-bold ${color}`}>{value ?? '—'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Attendance rate</span>
              <span className="font-semibold">{att.percentage}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className={`h-2 rounded-full ${att.percentage >= 90 ? 'bg-emerald-500' : att.percentage >= 75 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${att.percentage}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {att.percentage >= 85 ? '✅ Excellent attendance — keep it up!' : '⚠️ Please ensure regular attendance to meet the 85% requirement.'}
            </p>
          </div>
        </div>

        {/* Fee status */}
        <div className="page-card p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Fee Payment Status</h3>
          {studentFees ? (
            <div className="space-y-3">
              {studentFees.terms.map(t => (
                <div key={t.term} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${t.status === 'paid' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                    {t.status === 'paid'
                      ? <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                      : <ClockIcon className="w-5 h-5 text-amber-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{t.term}</p>
                    <p className="text-xs text-gray-400">
                      {t.status === 'paid' ? `Paid on ${formatDate(t.paidDate)} via ${t.paymentMode}` : `Due: ${formatDate(t.dueDate)}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(t.amount)}</p>
                    <Badge color={t.status === 'paid' ? 'green' : t.status === 'overdue' ? 'red' : 'yellow'}>{t.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">No fee records.</p>}
        </div>
      </div>

      {/* Teacher remarks */}
      <div className="page-card p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Teacher Remarks</h3>
        {studentRemarks.length ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {studentRemarks.map(r => (
              <div key={r.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.teacherName}</p>
                    <p className="text-xs text-gray-400">{r.subject} · {formatDate(r.date)}</p>
                  </div>
                  <Badge color={r.sentiment === 'positive' ? 'green' : 'yellow'}>
                    {r.sentiment === 'positive' ? 'Positive' : 'Needs Improvement'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 italic">"{r.text}"</p>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-gray-400">No remarks recorded.</p>}
      </div>
    </div>
  );
}
