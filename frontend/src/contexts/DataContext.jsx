import { createContext, useContext, useState, useCallback } from 'react';
import { students as seedStudents } from '../data/students';
import { teachers as seedTeachers } from '../data/teachers';
import { studentAttendanceSummary as seedAttSummary, recentAbsences as seedAbsences } from '../data/attendance';
import { gradesByStudent as seedGrades } from '../data/grades';
import { feesByStudent as seedFees } from '../data/fees';
import { events as seedEvents } from '../data/events';
import { remarks as seedRemarks } from '../data/remarks';

const KEYS = {
  students:   'schooldemo_students',
  teachers:   'schooldemo_teachers',
  attendance: 'schooldemo_attendance',
  grades:     'schooldemo_grades',
  fees:       'schooldemo_fees',
  events:     'schooldemo_events',
  remarks:    'schooldemo_remarks',
};

function initData(key, seed) {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : seed;
  } catch {
    return seed;
  }
}

function persist(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* quota */ }
}

function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function calcGrade(pct) {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  return 'F';
}

function calcGPA(pct) {
  if (pct >= 90) return 4.0;
  if (pct >= 80) return 3.7;
  if (pct >= 70) return 3.3;
  if (pct >= 60) return 3.0;
  if (pct >= 50) return 2.0;
  return 0.0;
}

const typeColor = { holiday: 'red', exam: 'orange', event: 'blue', meeting: 'green' };

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [students, setStudents]             = useState(() => initData(KEYS.students, seedStudents));
  const [teachers, setTeachers]             = useState(() => initData(KEYS.teachers, seedTeachers));
  const [savedAttendance, setSavedAtt]      = useState(() => initData(KEYS.attendance, {}));
  const [grades, setGrades]                 = useState(() => initData(KEYS.grades, seedGrades));
  const [fees, setFees]                     = useState(() => initData(KEYS.fees, seedFees));
  const [events, setEvents]                 = useState(() => initData(KEYS.events, seedEvents));
  const [remarks, setRemarks]               = useState(() => initData(KEYS.remarks, seedRemarks));

  // Seed-derived summaries (kept static for display; not mutated by attendance saves)
  const attendanceSummary = seedAttSummary;
  const recentAbsences    = seedAbsences;

  // ── Students ─────────────────────────────────────────────────────────────
  const addStudent = useCallback((data) => {
    const s = { ...data, id: uid('s') };
    setStudents(prev => { const u = [...prev, s]; persist(KEYS.students, u); return u; });
    return s;
  }, []);

  const updateStudent = useCallback((id, data) => {
    setStudents(prev => {
      const u = prev.map(s => s.id === id ? { ...s, ...data } : s);
      persist(KEYS.students, u); return u;
    });
  }, []);

  const deleteStudent = useCallback((id) => {
    setStudents(prev => { const u = prev.filter(s => s.id !== id); persist(KEYS.students, u); return u; });
  }, []);

  // ── Teachers ─────────────────────────────────────────────────────────────
  const addTeacher = useCallback((data) => {
    const t = { ...data, id: uid('t') };
    setTeachers(prev => { const u = [...prev, t]; persist(KEYS.teachers, u); return u; });
    return t;
  }, []);

  const updateTeacher = useCallback((id, data) => {
    setTeachers(prev => {
      const u = prev.map(t => t.id === id ? { ...t, ...data } : t);
      persist(KEYS.teachers, u); return u;
    });
  }, []);

  const deleteTeacher = useCallback((id) => {
    setTeachers(prev => { const u = prev.filter(t => t.id !== id); persist(KEYS.teachers, u); return u; });
  }, []);

  // ── Attendance ────────────────────────────────────────────────────────────
  const saveAttendance = useCallback((date, classSection, records) => {
    const key = `${date}_${classSection}`;
    setSavedAtt(prev => { const u = { ...prev, [key]: records }; persist(KEYS.attendance, u); return u; });
  }, []);

  const getAttendanceForDay = useCallback((date, classSection) => {
    return savedAttendance[`${date}_${classSection}`] || null;
  }, [savedAttendance]);

  // ── Grades ────────────────────────────────────────────────────────────────
  // newScores: array of { examName, maxMarks, scored, date }
  const updateStudentGrades = useCallback((studentId, subject, newScores) => {
    setGrades(prev => {
      const studentGrades = prev[studentId] || [];
      const updated = {
        ...prev,
        [studentId]: studentGrades.map(g => {
          if (g.subject !== subject) return g;
          const totalScored = newScores.reduce((s, e) => s + (Number(e.scored) || 0), 0);
          const totalMarks  = newScores.reduce((s, e) => s + e.maxMarks, 0);
          const pct         = Math.round((totalScored / totalMarks) * 1000) / 10;
          return { ...g, scores: newScores, totalScored, percentage: pct, grade: calcGrade(pct), gpa: calcGPA(pct) };
        }),
      };
      persist(KEYS.grades, updated);
      return updated;
    });
  }, []);

  // ── Fees ──────────────────────────────────────────────────────────────────
  const updateFee = useCallback((studentId, termIndex, payment) => {
    setFees(prev => {
      const sf = prev[studentId];
      if (!sf) return prev;
      const terms = sf.terms.map((t, i) => {
        if (i !== termIndex) return t;
        const newPaid    = Math.min(t.paid + Number(payment.amountPaid || 0), t.amount);
        const newBalance = Math.max(t.amount - newPaid, 0);
        const newStatus  = newBalance === 0 ? 'paid' : newPaid > 0 ? 'partial' : t.status;
        return {
          ...t,
          paid: newPaid,
          balance: newBalance,
          status: newStatus,
          paidDate: payment.paidDate || t.paidDate,
          paymentMode: payment.paymentMode || t.paymentMode,
          receiptNumber: newStatus === 'paid' ? `RCP-${Date.now().toString().slice(-6)}` : t.receiptNumber,
        };
      });
      const u = { ...prev, [studentId]: { ...sf, terms } };
      persist(KEYS.fees, u);
      return u;
    });
  }, []);

  // ── Events ────────────────────────────────────────────────────────────────
  const addEvent = useCallback((data) => {
    const ev = { ...data, id: uid('ev'), color: typeColor[data.type] || 'blue' };
    setEvents(prev => { const u = [...prev, ev]; persist(KEYS.events, u); return u; });
    return ev;
  }, []);

  const updateEvent = useCallback((id, data) => {
    setEvents(prev => {
      const u = prev.map(e => e.id === id ? { ...e, ...data, color: typeColor[data.type] || e.color } : e);
      persist(KEYS.events, u); return u;
    });
  }, []);

  const deleteEvent = useCallback((id) => {
    setEvents(prev => { const u = prev.filter(e => e.id !== id); persist(KEYS.events, u); return u; });
  }, []);

  // ── Remarks ───────────────────────────────────────────────────────────────
  const addRemark = useCallback((data) => {
    const r = { ...data, id: uid('r') };
    setRemarks(prev => { const u = [...prev, r]; persist(KEYS.remarks, u); return u; });
    return r;
  }, []);

  const deleteRemark = useCallback((id) => {
    setRemarks(prev => { const u = prev.filter(r => r.id !== id); persist(KEYS.remarks, u); return u; });
  }, []);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetData = useCallback(() => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  }, []);

  return (
    <DataContext.Provider value={{
      students, teachers, savedAttendance, grades, fees, events, remarks,
      attendanceSummary, recentAbsences,
      addStudent, updateStudent, deleteStudent,
      addTeacher, updateTeacher, deleteTeacher,
      saveAttendance, getAttendanceForDay,
      updateStudentGrades,
      updateFee,
      addEvent, updateEvent, deleteEvent,
      addRemark, deleteRemark,
      resetData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
