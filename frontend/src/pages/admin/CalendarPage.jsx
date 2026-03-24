import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import FormField from '../../components/forms/FormField';
import { useData } from '../../contexts/DataContext';
import { formatDate } from '../../utils/formatters';

const typeStyle = {
  holiday: 'badge-red',
  exam:    'badge-orange',
  event:   'badge-blue',
  meeting: 'badge-green',
};

const typeDot = {
  holiday: 'bg-red-500',
  exam:    'bg-orange-500',
  event:   'bg-blue-500',
  meeting: 'bg-green-500',
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const EMPTY_FORM = { title: '', type: 'event', date: '', description: '' };

function validate(f) {
  const errs = {};
  if (!f.title.trim()) errs.title = 'Title is required';
  if (!f.date)         errs.date  = 'Date is required';
  return errs;
}

export default function CalendarPage() {
  const { events, addEvent, updateEvent, deleteEvent } = useData();

  const [year, setYear]   = useState(2026);
  const [month, setMonth] = useState(2); // 0-based, March = 2

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailOpen, setDetailOpen]       = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay }, () => null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  function getEventsForDay(day) {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return events.filter(e => e.date === dateStr);
  }

  const monthStr    = `${year}-${String(month + 1).padStart(2,'0')}`;
  const monthEvents = events.filter(e => e.date.startsWith(monthStr)).sort((a,b) => a.date.localeCompare(b.date));

  const isToday = (day) => {
    const t = new Date();
    return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day;
  };

  function openEventDetail(ev) {
    setSelectedEvent(ev);
    setDetailOpen(true);
  }

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, date: `${year}-${String(month + 1).padStart(2,'0')}-01` });
    setErrors({});
    setFormOpen(true);
  }

  function openEdit(ev) {
    setEditing(ev);
    setForm({ title: ev.title, type: ev.type, date: ev.date, description: ev.description || '' });
    setErrors({});
    setDetailOpen(false);
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
        updateEvent(editing.id, form);
        toast.success('Event updated');
      } else {
        addEvent(form);
        toast.success('Event added');
        // Navigate to event's month
        const d = new Date(form.date);
        setMonth(d.getMonth());
        setYear(d.getFullYear());
      }
      setSaving(false);
      setFormOpen(false);
    }, 300);
  }

  function handleDeleteClick(ev) {
    setDeleteTarget(ev);
    setDetailOpen(false);
  }

  function confirmDelete() {
    deleteEvent(deleteTarget.id);
    toast.success('Event deleted');
    setDeleteTarget(null);
  }

  return (
    <div>
      <PageHeader
        title="Event Calendar"
        subtitle="School events, holidays, and exam schedule"
        action={
          <button onClick={openAdd} className="btn-primary">
            <PlusIcon className="w-4 h-4" /> Add Event
          </button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Calendar grid */}
        <div className="page-card p-4 sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">{MONTHS[month]} {year}</h2>
            <div className="flex gap-2">
              <button onClick={() => { setMonth(new Date().getMonth()); setYear(new Date().getFullYear()); }} className="btn-secondary text-xs py-1.5 px-3">Today</button>
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100"><ChevronLeftIcon className="w-4 h-4" /></button>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100"><ChevronRightIcon className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1.5">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 border-l border-t border-gray-100">
            {cells.map((day, i) => {
              const dayEvents = getEventsForDay(day);
              return (
                <div
                  key={i}
                  className={`min-h-[60px] sm:min-h-[70px] border-r border-b border-gray-100 p-1 sm:p-1.5 ${!day ? 'bg-gray-50/50' : 'hover:bg-gray-50 transition-colors'} ${isToday(day) ? 'bg-primary-50' : ''}`}
                >
                  {day && (
                    <>
                      <span className={`inline-flex w-5 h-5 sm:w-6 sm:h-6 items-center justify-center text-xs font-semibold rounded-full ${isToday(day) ? 'bg-primary-600 text-white' : 'text-gray-700'}`}>{day}</span>
                      <div className="mt-0.5 space-y-0.5">
                        {dayEvents.slice(0, 2).map(ev => (
                          <button
                            key={ev.id}
                            onClick={() => openEventDetail(ev)}
                            className={`w-full text-left text-xs px-1 py-0.5 rounded truncate ${typeDot[ev.type]} text-white hover:opacity-90 transition-opacity`}
                          >
                            <span className="hidden sm:inline">{ev.title}</span>
                            <span className="sm:hidden">•</span>
                          </button>
                        ))}
                        {dayEvents.length > 2 && (
                          <p className="text-xs text-gray-400 px-1">+{dayEvents.length - 2}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            {Object.entries(typeDot).map(([type, cls]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${cls}`} />
                <span className="text-xs text-gray-500 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Events this month */}
        <div className="page-card p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Events in {MONTHS[month]}</h3>
          {monthEvents.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400">No events this month.</p>
              <button onClick={openAdd} className="btn-secondary text-xs mt-3">
                <PlusIcon className="w-3.5 h-3.5" /> Add Event
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {monthEvents.map(ev => (
                <button
                  key={ev.id}
                  onClick={() => openEventDetail(ev)}
                  className="w-full text-left p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${typeDot[ev.type]}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-800 leading-snug">{ev.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(ev.date)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Event Details">
        {selectedEvent && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className={typeStyle[selectedEvent.type]}>{selectedEvent.type}</Badge>
              <span className="text-sm text-gray-500">{formatDate(selectedEvent.date)}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
            <p className="text-sm text-gray-600 mt-2">{selectedEvent.description}</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => openEdit(selectedEvent)} className="btn-secondary">
                <PencilIcon className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => handleDeleteClick(selectedEvent)} className="btn-ghost text-red-600 hover:bg-red-50">
                <TrashIcon className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Event Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Event' : 'Add Event'} size="md">
        <div className="space-y-4">
          <FormField label="Event Title" required error={errors.title}>
            <input name="title" className="input" value={form.title} onChange={handleChange} placeholder="Sports Day" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Type" required>
              <select name="type" className="select" value={form.type} onChange={handleChange}>
                <option value="event">Event</option>
                <option value="exam">Exam</option>
                <option value="holiday">Holiday</option>
                <option value="meeting">Meeting</option>
              </select>
            </FormField>
            <FormField label="Date" required error={errors.date}>
              <input name="date" type="date" className="input" value={form.date} onChange={handleChange} />
            </FormField>
          </div>
          <FormField label="Description">
            <textarea
              name="description"
              className="input resize-none"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description of the event…"
            />
          </FormField>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => setFormOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Event'}
          </button>
        </div>
      </Modal>

      {/* Confirm delete */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Event"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
