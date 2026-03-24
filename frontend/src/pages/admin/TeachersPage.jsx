import { useState, useMemo } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import EmptyState from '../../components/ui/EmptyState';
import FormField from '../../components/forms/FormField';
import { useData } from '../../contexts/DataContext';
import { formatDate } from '../../utils/formatters';

const CLASS_OPTIONS = ['10A','10B','9A','9B','8A','8B'];

const EMPTY_FORM = {
  name: '', subject: '', email: '', phone: '',
  qualification: '', experience: '', joinDate: '', status: 'active', classes: [],
};

function validate(f) {
  const errs = {};
  if (!f.name.trim())    errs.name    = 'Name is required';
  if (!f.subject.trim()) errs.subject = 'Subject is required';
  if (!f.email.trim())   errs.email   = 'Email is required';
  return errs;
}

export default function TeachersPage() {
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useData();

  const [search, setSearch]         = useState('');
  const [formOpen, setFormOpen]     = useState(false);
  const [editing, setEditing]       = useState(null); // teacher object or null
  const [form, setForm]             = useState(EMPTY_FORM);
  const [errors, setErrors]         = useState({});
  const [saving, setSaving]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    if (!search) return teachers;
    const q = search.toLowerCase();
    return teachers.filter(t => t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q));
  }, [teachers, search]);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormOpen(true);
  }

  function openEdit(t) {
    setEditing(t);
    setForm({
      name: t.name, subject: t.subject, email: t.email, phone: t.phone || '',
      qualification: t.qualification || '', experience: t.experience || '',
      joinDate: t.joinDate || '', status: t.status, classes: t.classes || [],
    });
    setErrors({});
    setFormOpen(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }

  function toggleClass(cls) {
    setForm(prev => ({
      ...prev,
      classes: prev.classes.includes(cls)
        ? prev.classes.filter(c => c !== cls)
        : [...prev.classes, cls],
    }));
  }

  function handleSave() {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setTimeout(() => {
      if (editing) {
        updateTeacher(editing.id, form);
        toast.success('Teacher updated');
      } else {
        addTeacher(form);
        toast.success('Teacher added');
      }
      setSaving(false);
      setFormOpen(false);
    }, 300);
  }

  function handleDelete(id, name) {
    setDeleteTarget({ id, name });
  }

  function confirmDelete() {
    deleteTeacher(deleteTarget.id);
    toast.success('Teacher removed');
    setDeleteTarget(null);
  }

  return (
    <div>
      <PageHeader
        title="Teachers"
        subtitle={`${teachers.length} staff members`}
        action={
          <button onClick={openAdd} className="btn-primary">
            <PlusIcon className="w-4 h-4" /> Add Teacher
          </button>
        }
      />

      {/* Search */}
      <div className="page-card p-4 mb-4">
        <div className="relative max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search name or subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">Showing {filtered.length} of {teachers.length} teachers</p>
      </div>

      {/* Table — desktop */}
      <div className="page-card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon="👩‍🏫" title="No teachers found" message="Try a different search or add a new teacher." action={<button onClick={openAdd} className="btn-primary"><PlusIcon className="w-4 h-4" />Add Teacher</button>} />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="table-th">Teacher</th>
                    <th className="table-th">Subject</th>
                    <th className="table-th">Classes</th>
                    <th className="table-th">Qualification</th>
                    <th className="table-th">Experience</th>
                    <th className="table-th">Status</th>
                    <th className="table-th"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <Avatar name={t.name} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900">{t.name}</p>
                            <p className="text-xs text-gray-400">{t.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td font-medium">{t.subject}</td>
                      <td className="table-td">
                        <div className="flex flex-wrap gap-1">
                          {(t.classes || []).map(c => (
                            <span key={c} className="badge badge-blue text-xs">{c}</span>
                          ))}
                        </div>
                      </td>
                      <td className="table-td text-xs text-gray-500">{t.qualification || '—'}</td>
                      <td className="table-td">{t.experience || '—'}</td>
                      <td className="table-td">
                        <Badge color={t.status === 'active' ? 'green' : 'gray'}>{t.status}</Badge>
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(t)} className="btn-ghost text-xs p-2">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(t.id, t.name)} className="btn-ghost text-xs p-2 text-red-500 hover:bg-red-50">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filtered.map(t => (
                <div key={t.id} className="p-4 flex items-start gap-3">
                  <Avatar name={t.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.subject}</p>
                        <p className="text-xs text-gray-400">{t.email}</p>
                      </div>
                      <Badge color={t.status === 'active' ? 'green' : 'gray'}>{t.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(t.classes || []).map(c => (
                        <span key={c} className="badge badge-blue text-xs">{c}</span>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => openEdit(t)} className="btn-secondary text-xs py-1 px-2">
                        <PencilIcon className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => handleDelete(t.id, t.name)} className="text-xs py-1 px-2 rounded-lg text-red-600 border border-red-200 hover:bg-red-50 inline-flex items-center gap-1">
                        <TrashIcon className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Teacher' : 'Add Teacher'} size="lg">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Full Name" required error={errors.name}>
            <input name="name" className="input" value={form.name} onChange={handleChange} placeholder="Dr. Sarah Mitchell" />
          </FormField>
          <FormField label="Subject" required error={errors.subject}>
            <input name="subject" className="input" value={form.subject} onChange={handleChange} placeholder="Mathematics" />
          </FormField>
          <FormField label="Email" required error={errors.email}>
            <input name="email" type="email" className="input" value={form.email} onChange={handleChange} placeholder="teacher@school.edu" />
          </FormField>
          <FormField label="Phone">
            <input name="phone" className="input" value={form.phone} onChange={handleChange} placeholder="+1-555-0201" />
          </FormField>
          <FormField label="Qualification">
            <input name="qualification" className="input" value={form.qualification} onChange={handleChange} placeholder="Ph.D. Mathematics, MIT" />
          </FormField>
          <FormField label="Experience">
            <input name="experience" className="input" value={form.experience} onChange={handleChange} placeholder="8 years" />
          </FormField>
          <FormField label="Join Date">
            <input name="joinDate" type="date" className="input" value={form.joinDate} onChange={handleChange} />
          </FormField>
          <FormField label="Status">
            <select name="status" className="select" value={form.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
        </div>

        <FormField label="Classes Taught" className="mt-4">
          <div className="flex flex-wrap gap-2 mt-1">
            {CLASS_OPTIONS.map(cls => (
              <button
                key={cls}
                type="button"
                onClick={() => toggleClass(cls)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  form.classes.includes(cls)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </FormField>

        <div className="flex gap-3 mt-6">
          <button onClick={() => setFormOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Teacher'}
          </button>
        </div>
      </Modal>

      {/* Confirm delete */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Remove Teacher"
        message={`Are you sure you want to remove ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Remove"
      />
    </div>
  );
}
