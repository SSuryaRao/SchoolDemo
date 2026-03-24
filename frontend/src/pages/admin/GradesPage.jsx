import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { PencilIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Avatar from '../../components/ui/Avatar';
import FormField from '../../components/forms/FormField';
import GradeDistributionPie from '../../components/charts/GradeDistributionPie';
import { useData } from '../../contexts/DataContext';
import { subjectList, examList } from '../../data/grades';

const classes = ['10A', '10B', '9A', '9B', '8A', '8B'];

function getGradeBadge(grade) {
  if (grade === 'A+' || grade === 'A') return 'green';
  if (grade === 'B+' || grade === 'B') return 'blue';
  if (grade === 'C') return 'yellow';
  return 'red';
}

export default function GradesPage() {
  const { students, grades: gradesByStudent, updateStudentGrades } = useData();

  const [selectedClass, setSelectedClass] = useState('10A');
  const [exportOpen, setExportOpen]       = useState(false);
  const [editOpen, setEditOpen]           = useState(false);
  const [editStudent, setEditStudent]     = useState(null);
  const [editSubject, setEditSubject]     = useState(null);
  const [editScores, setEditScores]       = useState([]);
  const [saving, setSaving]               = useState(false);

  const classStudents = students.filter(s => `${s.class}${s.section}` === selectedClass);

  // Helpers derived from DataContext grades
  function getStudentGPA(studentId) {
    const subs = gradesByStudent[studentId] || [];
    if (!subs.length) return 0;
    return Math.round(subs.reduce((s, g) => s + g.gpa, 0) / subs.length * 100) / 100;
  }

  function getStudentOverallPct(studentId) {
    const subs = gradesByStudent[studentId] || [];
    if (!subs.length) return 0;
    return Math.round(subs.reduce((s, g) => s + g.percentage, 0) / subs.length * 10) / 10;
  }

  // Subject averages for analytics
  const subjectAverages = subjectList.map(subject => {
    const allScores = Object.values(gradesByStudent).map(subs => subs.find(s => s.subject === subject)?.percentage || 0);
    return { subject: subject.replace('Computer Science', 'CS'), avg: Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length) };
  });

  // Top performers
  const topPerformers = students
    .map(s => ({ ...s, gpa: getStudentGPA(s.id), pct: getStudentOverallPct(s.id) }))
    .sort((a, b) => b.gpa - a.gpa)
    .slice(0, 5);

  function openEditGrades(student, subject) {
    const g = (gradesByStudent[student.id] || []).find(gr => gr.subject === subject);
    if (!g) return;
    setEditStudent(student);
    setEditSubject(subject);
    setEditScores(g.scores.map(s => ({ ...s })));
    setEditOpen(true);
  }

  function handleScoreChange(i, val) {
    setEditScores(prev => prev.map((s, idx) => idx === i ? { ...s, scored: Math.max(0, Math.min(Number(val), s.maxMarks)) } : s));
  }

  function handleSaveGrades() {
    setSaving(true);
    setTimeout(() => {
      updateStudentGrades(editStudent.id, editSubject, editScores);
      toast.success(`Grades updated for ${editStudent.name} — ${editSubject}`);
      setSaving(false);
      setEditOpen(false);
    }, 300);
  }

  return (
    <div>
      <PageHeader title="Grades & Examinations" subtitle="Gradebook and academic analytics" />

      <Tab.Group>
        <Tab.List className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 w-fit">
          {['Gradebook', 'Analytics'].map(tab => (
            <Tab key={tab} className={({ selected }) =>
              `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${selected ? 'bg-primary-600 text-white' : 'text-gray-500 hover:text-gray-700'}`
            }>{tab}</Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          {/* Gradebook */}
          <Tab.Panel>
            <div className="page-card overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
                <select className="select w-32" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                  {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
                <span className="text-xs text-gray-400">Click the edit icon to update a student's grades</span>
                <button onClick={() => setExportOpen(true)} className="btn-secondary ml-auto">Export PDF</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="table-th sticky left-0 bg-gray-50">Student</th>
                      {subjectList.map(s => <th key={s} className="table-th text-center whitespace-nowrap">{s.replace('Computer Science', 'CS')}</th>)}
                      <th className="table-th text-center">Overall %</th>
                      <th className="table-th text-center">GPA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {classStudents.map(student => {
                      const sgrades = gradesByStudent[student.id] || [];
                      const gpa = getStudentGPA(student.id);
                      const pct = getStudentOverallPct(student.id);
                      return (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="table-td sticky left-0 bg-white">
                            <div className="flex items-center gap-2">
                              <Avatar name={student.name} size="sm" />
                              <p className="font-medium text-sm whitespace-nowrap">{student.name}</p>
                            </div>
                          </td>
                          {subjectList.map(sub => {
                            const g = sgrades.find(gr => gr.subject === sub);
                            return (
                              <td key={sub} className="table-td text-center">
                                {g ? (
                                  <div className="relative group">
                                    <span className="font-semibold text-gray-900">{g.percentage}%</span>
                                    <div className="mt-0.5 flex items-center justify-center gap-1">
                                      <Badge color={getGradeBadge(g.grade)}>{g.grade}</Badge>
                                      <button
                                        onClick={() => openEditGrades(student, sub)}
                                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-primary-600 transition-all"
                                        title="Edit grades"
                                      >
                                        <PencilIcon className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ) : '—'}
                              </td>
                            );
                          })}
                          <td className="table-td text-center font-semibold">{pct}%</td>
                          <td className="table-td text-center">
                            <span className={`font-bold ${gpa >= 3.7 ? 'text-emerald-600' : gpa >= 3.0 ? 'text-blue-600' : gpa >= 2.0 ? 'text-amber-600' : 'text-red-600'}`}>{gpa}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Tab.Panel>

          {/* Analytics */}
          <Tab.Panel>
            <div className="grid lg:grid-cols-2 gap-4 mb-4">
              <div className="page-card p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Subject-wise Average Score</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={subjectAverages} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Average']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                    <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                      {subjectAverages.map((_, i) => <Cell key={i} fill={['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444'][i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="page-card p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Grade Distribution (All Students)</h3>
                <GradeDistributionPie />
              </div>
            </div>

            <div className="page-card p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">🏆 Top 5 Performers</h3>
              <div className="space-y-3">
                {topPerformers.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {i + 1}
                    </span>
                    <Avatar name={s.name} size="sm" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-500">Class {s.class}{s.section}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{s.gpa} GPA</p>
                      <p className="text-xs text-gray-500">{s.pct}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Export PDF Modal */}
      <Modal open={exportOpen} onClose={() => setExportOpen(false)} title="Export Gradebook">
        <div className="text-center py-6">
          <div className="text-4xl mb-3">📄</div>
          <h3 className="font-semibold text-gray-900">PDF Export</h3>
          <p className="text-sm text-gray-500 mt-2">PDF export with school letterhead and grade reports will be available in the full version.</p>
          <button onClick={() => setExportOpen(false)} className="btn-primary mt-4">Got it</button>
        </div>
      </Modal>

      {/* Edit Grades Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit Grades — ${editSubject}`} size="md">
        {editStudent && (
          <div>
            <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
              <Avatar name={editStudent.name} size="sm" />
              <div>
                <p className="font-medium text-sm text-gray-900">{editStudent.name}</p>
                <p className="text-xs text-gray-500">{editSubject}</p>
              </div>
            </div>

            <div className="space-y-3">
              {editScores.map((s, i) => (
                <div key={s.examName} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{s.examName}</p>
                    <p className="text-xs text-gray-400">Max: {s.maxMarks} marks</p>
                  </div>
                  <FormField>
                    <input
                      type="number"
                      min="0"
                      max={s.maxMarks}
                      className="input w-24 text-center"
                      value={s.scored}
                      onChange={e => handleScoreChange(i, e.target.value)}
                    />
                  </FormField>
                  <span className="text-xs text-gray-400 w-16 text-right">
                    {Math.round((editScores[i].scored / s.maxMarks) * 100)}%
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                Total: {editScores.reduce((s, e) => s + (Number(e.scored) || 0), 0)} / {editScores.reduce((s, e) => s + e.maxMarks, 0)} marks
              </p>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSaveGrades} disabled={saving} className="btn-primary">
                {saving ? 'Saving…' : 'Save Grades'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
