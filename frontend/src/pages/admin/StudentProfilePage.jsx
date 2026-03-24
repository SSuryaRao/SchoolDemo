import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { ArrowLeftIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import FormField from '../../components/forms/FormField';
import PerformanceLine from '../../components/charts/PerformanceLine';
import { useData } from '../../contexts/DataContext';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { getAttendanceBadge } from '../../utils/calculations';

const tabs = ['Personal Info', 'Grades', 'Attendance', 'Fees', 'Remarks'];

const REMARK_FORM = { teacherName: '', subject: '', sentiment: 'positive', text: '', date: new Date().toISOString().slice(0,10) };

export default function StudentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { students, grades: gradesByStudent, attendanceSummary, fees, remarks, updateStudent, addRemark, deleteRemark } = useData();

  const student = students.find(s => s.id === id);
  if (!student) return <div className="p-8 text-gray-500">Student not found.</div>;

  const att           = attendanceSummary[id] || {};
  const sgrades       = gradesByStudent[id] || [];
  const studentFees   = fees[id];
  const studentRmarks = remarks.filter(r => r.studentId === id);
  const attColor      = getAttendanceBadge(att.percentage || 0);
  const gpa           = sgrades.length ? (sgrades.reduce((s, g) => s + g.gpa, 0) / sgrades.length).toFixed(2) : '—';

  // Edit student form
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving]     = useState(false);

  function openEdit() {
    setEditForm({
      name: student.name, rollNumber: student.rollNumber, class: student.class,
      section: student.section, gender: student.gender, dob: student.dob,
      bloodGroup: student.bloodGroup, email: student.email, phone: student.phone,
      parentName: student.parentName, parentPhone: student.parentPhone,
      address: student.address, admissionDate: student.admissionDate, status: student.status,
    });
    setEditOpen(true);
  }

  function handleEditChange(e) {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSaveEdit() {
    if (!editForm.name?.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    setTimeout(() => {
      updateStudent(id, editForm);
      toast.success('Profile updated');
      setSaving(false);
      setEditOpen(false);
    }, 300);
  }

  // Add remark
  const [remarkOpen, setRemarkOpen]     = useState(false);
  const [remarkForm, setRemarkForm]     = useState(REMARK_FORM);
  const [savingRemark, setSavingRemark] = useState(false);
  const [deleteRmk, setDeleteRmk]       = useState(null);

  function handleRemarkChange(e) {
    setRemarkForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSaveRemark() {
    if (!remarkForm.text.trim()) { toast.error('Remark text is required'); return; }
    setSavingRemark(true);
    setTimeout(() => {
      addRemark({ ...remarkForm, studentId: id, teacherId: 'admin' });
      toast.success('Remark added');
      setSavingRemark(false);
      setRemarkOpen(false);
      setRemarkForm(REMARK_FORM);
    }, 300);
  }

  return (
    <div>
      <button onClick={() => navigate('/admin/students')} className="btn-ghost mb-4 text-sm">
        <ArrowLeftIcon className="w-4 h-4" /> Back to Students
      </button>

      {/* Profile header */}
      <div className="page-card p-4 sm:p-6 mb-4">
        <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
          <Avatar name={student.name} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
                <p className="text-sm text-gray-500">Class {student.class}{student.section} · Roll #{student.rollNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge color={student.status === 'active' ? 'green' : 'gray'}>{student.status}</Badge>
                <button onClick={openEdit} className="btn-secondary text-xs">
                  <PencilIcon className="w-3.5 h-3.5" /> Edit Profile
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Attendance</p>
                <p className="text-lg font-bold text-gray-900">{att.percentage || 0}%</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Overall GPA</p>
                <p className="text-lg font-bold text-gray-900">{gpa}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Blood Group</p>
                <p className="text-lg font-bold text-gray-900">{student.bloodGroup}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="page-card overflow-hidden">
        <Tab.Group>
          <Tab.List className="flex border-b border-gray-100 px-4 sm:px-6 pt-4 gap-0 overflow-x-auto">
            {tabs.map(tab => (
              <Tab key={tab} className={({ selected }) =>
                `px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${selected ? 'text-primary-600 border-b-2 border-primary-600 -mb-px' : 'text-gray-500 hover:text-gray-700'}`
              }>
                {tab}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="p-4 sm:p-6">
            {/* Personal Info */}
            <Tab.Panel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {[
                  ['Full Name', student.name],
                  ['Date of Birth', formatDate(student.dob)],
                  ['Gender', student.gender],
                  ['Blood Group', student.bloodGroup],
                  ['Email', student.email],
                  ['Phone', student.phone],
                  ['Class', `${student.class}${student.section}`],
                  ['Roll Number', student.rollNumber],
                  ['Admission Date', formatDate(student.admissionDate)],
                  ['Address', student.address],
                  ['Parent/Guardian', student.parentName],
                  ['Parent Phone', student.parentPhone],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{value || '—'}</p>
                  </div>
                ))}
              </div>
            </Tab.Panel>

            {/* Grades */}
            <Tab.Panel>
              <div className="mb-6">
                <PerformanceLine studentId={id} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="table-th">Subject</th>
                      <th className="table-th text-right">Scored</th>
                      <th className="table-th text-right">Max</th>
                      <th className="table-th text-right">%</th>
                      <th className="table-th text-right">Grade</th>
                      <th className="table-th text-right">GPA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sgrades.map(g => (
                      <tr key={g.subject}>
                        <td className="table-td font-medium">{g.subject}</td>
                        <td className="table-td text-right">{g.totalScored}</td>
                        <td className="table-td text-right">{g.totalMarks}</td>
                        <td className="table-td text-right">{g.percentage}%</td>
                        <td className="table-td text-right">
                          <Badge color={g.gpa >= 3.7 ? 'green' : g.gpa >= 3.0 ? 'blue' : g.gpa >= 2.0 ? 'yellow' : 'red'}>{g.grade}</Badge>
                        </td>
                        <td className="table-td text-right font-semibold">{g.gpa.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tab.Panel>

            {/* Attendance */}
            <Tab.Panel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  ['Total Days', att.totalDays, 'blue'],
                  ['Present',    att.present,   'green'],
                  ['Absent',     att.absent,    'red'],
                  ['Late',       att.late,      'yellow'],
                ].map(([label, val, color]) => (
                  <div key={label} className={`rounded-xl p-4 bg-${color}-50`}>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{val ?? '—'}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Attendance Rate: <span className="font-bold text-gray-900">{att.percentage}%</span></p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className={`h-2 rounded-full ${att.percentage >= 90 ? 'bg-emerald-500' : att.percentage >= 75 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${att.percentage}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {att.percentage >= 85 ? '✅ Good attendance' : att.percentage >= 75 ? '⚠️ Attendance needs improvement' : '🔴 Critical — parent notification sent'}
                </p>
              </div>
            </Tab.Panel>

            {/* Fees */}
            <Tab.Panel>
              {studentFees ? (
                <div className="space-y-3">
                  {studentFees.terms.map(t => (
                    <div key={t.term} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl flex-wrap gap-3">
                      <div>
                        <p className="font-medium text-gray-900">{t.term}</p>
                        <p className="text-xs text-gray-500">Due: {formatDate(t.dueDate)}</p>
                        {t.paidDate && <p className="text-xs text-gray-500">Paid: {formatDate(t.paidDate)} via {t.paymentMode}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(t.paid)} / {formatCurrency(t.amount)}</p>
                        <Badge color={t.status === 'paid' ? 'green' : t.status === 'overdue' ? 'red' : t.status === 'partial' ? 'yellow' : 'gray'}>{t.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-400">No fee records.</p>}
            </Tab.Panel>

            {/* Remarks */}
            <Tab.Panel>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Teacher Remarks</h3>
                <button onClick={() => setRemarkOpen(true)} className="btn-secondary text-xs">
                  <PlusIcon className="w-3.5 h-3.5" /> Add Remark
                </button>
              </div>
              {studentRmarks.length ? (
                <div className="space-y-4">
                  {studentRmarks.map(r => (
                    <div key={r.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2 gap-2 flex-wrap">
                        <div>
                          <span className="font-medium text-sm text-gray-900">{r.teacherName}</span>
                          <span className="text-xs text-gray-400 ml-2">· {r.subject}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge color={r.sentiment === 'positive' ? 'green' : 'yellow'}>
                            {r.sentiment === 'positive' ? 'Positive' : 'Needs Improvement'}
                          </Badge>
                          <span className="text-xs text-gray-400">{formatDate(r.date)}</span>
                          <button onClick={() => setDeleteRmk(r)} className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 italic">"{r.text}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">No remarks recorded.</p>
                  <button onClick={() => setRemarkOpen(true)} className="btn-secondary text-xs mt-3">
                    <PlusIcon className="w-3.5 h-3.5" /> Add First Remark
                  </button>
                </div>
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Edit Profile Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Student Profile" size="lg">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Full Name" required>
            <input name="name" className="input" value={editForm.name || ''} onChange={handleEditChange} />
          </FormField>
          <FormField label="Roll Number">
            <input name="rollNumber" className="input" value={editForm.rollNumber || ''} onChange={handleEditChange} />
          </FormField>
          <FormField label="Class">
            <select name="class" className="select" value={editForm.class || '10'} onChange={handleEditChange}>
              {['8','9','10'].map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </FormField>
          <FormField label="Section">
            <select name="section" className="select" value={editForm.section || 'A'} onChange={handleEditChange}>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </FormField>
          <FormField label="Email">
            <input name="email" type="email" className="input" value={editForm.email || ''} onChange={handleEditChange} />
          </FormField>
          <FormField label="Phone">
            <input name="phone" className="input" value={editForm.phone || ''} onChange={handleEditChange} />
          </FormField>
          <FormField label="Parent/Guardian">
            <input name="parentName" className="input" value={editForm.parentName || ''} onChange={handleEditChange} />
          </FormField>
          <FormField label="Parent Phone">
            <input name="parentPhone" className="input" value={editForm.parentPhone || ''} onChange={handleEditChange} />
          </FormField>
          <FormField label="Address">
            <input name="address" className="input" value={editForm.address || ''} onChange={handleEditChange} />
          </FormField>
          <FormField label="Status">
            <select name="status" className="select" value={editForm.status || 'active'} onChange={handleEditChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setEditOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSaveEdit} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </Modal>

      {/* Add Remark Modal */}
      <Modal open={remarkOpen} onClose={() => setRemarkOpen(false)} title="Add Remark" size="md">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Teacher Name" required>
              <input name="teacherName" className="input" value={remarkForm.teacherName} onChange={handleRemarkChange} placeholder="Dr. Sarah Mitchell" />
            </FormField>
            <FormField label="Subject">
              <input name="subject" className="input" value={remarkForm.subject} onChange={handleRemarkChange} placeholder="Mathematics" />
            </FormField>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Sentiment">
              <select name="sentiment" className="select" value={remarkForm.sentiment} onChange={handleRemarkChange}>
                <option value="positive">Positive</option>
                <option value="needs_improvement">Needs Improvement</option>
              </select>
            </FormField>
            <FormField label="Date">
              <input name="date" type="date" className="input" value={remarkForm.date} onChange={handleRemarkChange} />
            </FormField>
          </div>
          <FormField label="Remark" required>
            <textarea
              name="text"
              className="input resize-none"
              rows={4}
              value={remarkForm.text}
              onChange={handleRemarkChange}
              placeholder="Write the teacher's remark here…"
            />
          </FormField>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => setRemarkOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSaveRemark} disabled={savingRemark} className="btn-primary">
            {savingRemark ? 'Saving…' : 'Add Remark'}
          </button>
        </div>
      </Modal>

      {/* Confirm delete remark */}
      <ConfirmModal
        open={!!deleteRmk}
        onClose={() => setDeleteRmk(null)}
        onConfirm={() => { deleteRemark(deleteRmk.id); toast.success('Remark deleted'); setDeleteRmk(null); }}
        title="Delete Remark"
        message="Are you sure you want to delete this remark?"
        confirmLabel="Delete"
      />
    </div>
  );
}
