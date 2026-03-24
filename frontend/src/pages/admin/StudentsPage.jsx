import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, EyeIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import EmptyState from '../../components/ui/EmptyState';
import FormField from '../../components/forms/FormField';
import { useData } from '../../contexts/DataContext';
import { getAttendanceBadge } from '../../utils/calculations';

const EMPTY_FORM = {
  name: '', rollNumber: '', class: '10', section: 'A', gender: 'Male',
  dob: '', bloodGroup: 'O+', email: '', phone: '',
  parentName: '', parentPhone: '', address: '', admissionDate: '', status: 'active',
};

function validate(f) {
  const errs = {};
  if (!f.name.trim())       errs.name       = 'Name is required';
  if (!f.rollNumber.trim()) errs.rollNumber  = 'Roll number is required';
  if (!f.email.trim())      errs.email       = 'Email is required';
  return errs;
}

export default function StudentsPage() {
  const navigate = useNavigate();
  const { students, attendanceSummary, addStudent, updateStudent, deleteStudent } = useData();

  const [search, setSearch]       = useState('');
  const [filterClass, setFilterClass]     = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  const [filterStatus, setFilterStatus]   = useState('all');
  const [page, setPage]           = useState(0);
  const PER_PAGE = 10;

  const [formOpen, setFormOpen]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [errors, setErrors]       = useState({});
  const [saving, setSaving]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    return students.filter(s => {
      const matchSearch  = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNumber.includes(search);
      const matchClass   = filterClass   === 'all' || s.class   === filterClass;
      const matchSection = filterSection === 'all' || s.section === filterSection;
      const matchStatus  = filterStatus  === 'all' || s.status  === filterStatus;
      return matchSearch && matchClass && matchSection && matchStatus;
    });
  }, [students, search, filterClass, filterSection, filterStatus]);

  const paginated  = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormOpen(true);
  }

  function openEdit(s) {
    setEditing(s);
    setForm({
      name: s.name, rollNumber: s.rollNumber, class: s.class, section: s.section,
      gender: s.gender, dob: s.dob, bloodGroup: s.bloodGroup, email: s.email,
      phone: s.phone, parentName: s.parentName, parentPhone: s.parentPhone,
      address: s.address, admissionDate: s.admissionDate, status: s.status,
    });
    setErrors({});
    setFormOpen(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }

  function handleSave() {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setTimeout(() => {
      if (editing) {
        updateStudent(editing.id, form);
        toast.success('Student updated');
      } else {
        addStudent(form);
        toast.success('Student added');
        setPage(0);
      }
      setSaving(false);
      setFormOpen(false);
    }, 300);
  }

  function confirmDelete() {
    deleteStudent(deleteTarget.id);
    toast.success('Student removed');
    setDeleteTarget(null);
  }

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${students.length} enrolled students`}
        action={
          <button onClick={openAdd} className="btn-primary">
            <PlusIcon className="w-4 h-4" /> Add Student
          </button>
        }
      />

      {/* Filters */}
      <div className="page-card p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input pl-9" placeholder="Search name or roll number..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }} />
          </div>
          <select className="select w-32" value={filterClass} onChange={e => { setFilterClass(e.target.value); setPage(0); }}>
            <option value="all">All Classes</option>
            {['8','9','10'].map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
          <select className="select w-32" value={filterSection} onChange={e => { setFilterSection(e.target.value); setPage(0); }}>
            <option value="all">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
          <select className="select w-32" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(0); }}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <p className="text-xs text-gray-400 mt-2">Showing {filtered.length} of {students.length} students</p>
      </div>

      {/* Content */}
      <div className="page-card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon="🎓" title="No students found" message="Try adjusting your filters or add a new student." action={<button onClick={openAdd} className="btn-primary"><PlusIcon className="w-4 h-4" />Add Student</button>} />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="table-th">Student</th>
                    <th className="table-th">Roll No.</th>
                    <th className="table-th">Class</th>
                    <th className="table-th">Parent</th>
                    <th className="table-th">Attendance</th>
                    <th className="table-th">Status</th>
                    <th className="table-th"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map(s => {
                    const att = attendanceSummary[s.id];
                    const attColor = getAttendanceBadge(att?.percentage || 0);
                    return (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="table-td">
                          <div className="flex items-center gap-3">
                            <Avatar name={s.name} size="sm" />
                            <div>
                              <p className="font-medium text-gray-900">{s.name}</p>
                              <p className="text-xs text-gray-400">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="table-td font-mono text-xs">{s.rollNumber}</td>
                        <td className="table-td">{s.class}{s.section}</td>
                        <td className="table-td">
                          <p className="text-sm">{s.parentName}</p>
                          <p className="text-xs text-gray-400">{s.parentPhone}</p>
                        </td>
                        <td className="table-td">
                          <Badge color={attColor}>{att?.percentage || 0}%</Badge>
                        </td>
                        <td className="table-td">
                          <Badge color={s.status === 'active' ? 'green' : 'gray'}>{s.status}</Badge>
                        </td>
                        <td className="table-td">
                          <div className="flex items-center gap-1">
                            <button onClick={() => navigate(`/admin/students/${s.id}`)} className="btn-ghost text-xs">
                              <EyeIcon className="w-4 h-4" /> View
                            </button>
                            <button onClick={() => openEdit(s)} className="btn-ghost text-xs p-2">
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteTarget(s)} className="btn-ghost text-xs p-2 text-red-500 hover:bg-red-50">
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {paginated.map(s => {
                const att = attendanceSummary[s.id];
                const attColor = getAttendanceBadge(att?.percentage || 0);
                return (
                  <div key={s.id} className="p-4 flex items-start gap-3">
                    <Avatar name={s.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{s.name}</p>
                          <p className="text-xs text-gray-400">#{s.rollNumber} · Class {s.class}{s.section}</p>
                        </div>
                        <Badge color={s.status === 'active' ? 'green' : 'gray'}>{s.status}</Badge>
                      </div>
                      <p className="text-xs text-gray-500">{s.parentName} · {s.parentPhone}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge color={attColor}>{att?.percentage || 0}% Attendance</Badge>
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <button onClick={() => navigate(`/admin/students/${s.id}`)} className="btn-secondary text-xs py-1 px-2">
                          <EyeIcon className="w-3 h-3" /> View
                        </button>
                        <button onClick={() => openEdit(s)} className="btn-secondary text-xs py-1 px-2">
                          <PencilIcon className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => setDeleteTarget(s)} className="text-xs py-1 px-2 rounded-lg text-red-600 border border-red-200 hover:bg-red-50 inline-flex items-center gap-1">
                          <TrashIcon className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Page {page + 1} of {totalPages}</p>
                <div className="flex gap-2">
                  <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs py-1.5 disabled:opacity-40">Previous</button>
                  <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs py-1.5 disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Student' : 'Add Student'} size="lg">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Full Name" required error={errors.name}>
            <input name="name" className="input" value={form.name} onChange={handleChange} placeholder="Alex Johnson" />
          </FormField>
          <FormField label="Roll Number" required error={errors.rollNumber}>
            <input name="rollNumber" className="input" value={form.rollNumber} onChange={handleChange} placeholder="2024021" />
          </FormField>
          <FormField label="Class" required>
            <select name="class" className="select" value={form.class} onChange={handleChange}>
              {['8','9','10'].map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </FormField>
          <FormField label="Section" required>
            <select name="section" className="select" value={form.section} onChange={handleChange}>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </FormField>
          <FormField label="Gender">
            <select name="gender" className="select" value={form.gender} onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </FormField>
          <FormField label="Date of Birth">
            <input name="dob" type="date" className="input" value={form.dob} onChange={handleChange} />
          </FormField>
          <FormField label="Blood Group">
            <select name="bloodGroup" className="select" value={form.bloodGroup} onChange={handleChange}>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </FormField>
          <FormField label="Status">
            <select name="status" className="select" value={form.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
          <FormField label="Email" required error={errors.email}>
            <input name="email" type="email" className="input" value={form.email} onChange={handleChange} placeholder="student@school.edu" />
          </FormField>
          <FormField label="Phone">
            <input name="phone" className="input" value={form.phone} onChange={handleChange} placeholder="+1-555-0101" />
          </FormField>
          <FormField label="Admission Date">
            <input name="admissionDate" type="date" className="input" value={form.admissionDate} onChange={handleChange} />
          </FormField>
          <FormField label="Parent/Guardian Name">
            <input name="parentName" className="input" value={form.parentName} onChange={handleChange} placeholder="Robert Johnson" />
          </FormField>
          <FormField label="Parent Phone">
            <input name="parentPhone" className="input" value={form.parentPhone} onChange={handleChange} placeholder="+1-555-0102" />
          </FormField>
          <FormField label="Address">
            <input name="address" className="input" value={form.address} onChange={handleChange} placeholder="42 Maple Street, Springfield" />
          </FormField>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => setFormOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Student'}
          </button>
        </div>
      </Modal>

      {/* Confirm delete */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Remove Student"
        message={`Are you sure you want to remove ${deleteTarget?.name}? Their data will be deleted.`}
        confirmLabel="Remove"
      />
    </div>
  );
}
