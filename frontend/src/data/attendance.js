// Working days Jan-Mar 2026
const workingDays = [
  '2026-01-05','2026-01-06','2026-01-07','2026-01-08','2026-01-09',
  '2026-01-12','2026-01-13','2026-01-14','2026-01-15','2026-01-16',
  '2026-01-19','2026-01-20','2026-01-21','2026-01-22','2026-01-23',
  '2026-01-27','2026-01-28','2026-01-29','2026-01-30',
  '2026-02-02','2026-02-03','2026-02-04','2026-02-05','2026-02-06',
  '2026-02-09','2026-02-10','2026-02-11','2026-02-12','2026-02-13',
  '2026-02-16','2026-02-17','2026-02-18','2026-02-19','2026-02-20',
  '2026-02-23','2026-02-24','2026-02-25','2026-02-26','2026-02-27',
  '2026-03-02','2026-03-03','2026-03-04','2026-03-05','2026-03-06',
  '2026-03-09','2026-03-10','2026-03-11','2026-03-12','2026-03-13',
  '2026-03-16',
];

// Per-student attendance patterns (present/absent/late counts within 50 days)
// Pattern: [present, absent, late] — must sum to 50 (or less for inactive)
const patterns = {
  s1:  { present: 47, absent: 2, late: 1 },
  s2:  { present: 48, absent: 1, late: 1 },
  s3:  { present: 45, absent: 4, late: 1 },
  s4:  { present: 49, absent: 1, late: 0 },
  s5:  { present: 46, absent: 3, late: 1 },
  s6:  { present: 50, absent: 0, late: 0 },
  s7:  { present: 43, absent: 6, late: 1 },
  s8:  { present: 47, absent: 2, late: 1 },
  s9:  { present: 44, absent: 5, late: 1 },
  s10: { present: 48, absent: 2, late: 0 },
  s11: { present: 46, absent: 3, late: 1 },
  s12: { present: 49, absent: 1, late: 0 },
  s13: { present: 42, absent: 7, late: 1 },
  s14: { present: 47, absent: 2, late: 1 },
  s15: { present: 50, absent: 0, late: 0 },
  s16: { present: 45, absent: 4, late: 1 },
  s17: { present: 48, absent: 2, late: 0 },
  s18: { present: 46, absent: 3, late: 1 },
  s19: { present: 44, absent: 5, late: 1 },
  s20: { present: 40, absent: 9, late: 1 },
};

// Generate deterministic attendance records
function generateAttendance() {
  const byDate = {};
  const studentIds = Object.keys(patterns);

  workingDays.forEach((date, dayIdx) => {
    byDate[date] = {};
    studentIds.forEach((sid) => {
      const p = patterns[sid];
      const total = p.present + p.absent + p.late;
      const daysLeft = workingDays.length - dayIdx;
      // Simple seeded pattern: absent on specific days based on student id
      const sidNum = parseInt(sid.replace('s', ''));
      const isAbsent = p.absent > 0 && (dayIdx % Math.max(1, Math.floor(total / p.absent))) === (sidNum % 3);
      const isLate = !isAbsent && p.late > 0 && (dayIdx % Math.max(1, Math.floor(total / (p.late + 1)))) === ((sidNum + 2) % 5);
      byDate[date][sid] = isAbsent ? 'absent' : isLate ? 'late' : 'present';
    });
  });

  return byDate;
}

export const attendanceByDate = generateAttendance();

export const studentAttendanceSummary = Object.entries(patterns).reduce((acc, [sid, p]) => {
  const total = p.present + p.absent + p.late;
  acc[sid] = {
    totalDays: total,
    present: p.present,
    absent: p.absent,
    late: p.late,
    percentage: Math.round((p.present / total) * 1000) / 10,
  };
  return acc;
}, {});

export const workingDaysList = workingDays;
export const recentAbsences = [
  { studentId: 's7',  studentName: 'Liam Thompson',  class: '10B', date: '2026-03-13', parentNotified: true },
  { studentId: 's13', studentName: 'James Wilson',   class: '9B',  date: '2026-03-13', parentNotified: true },
  { studentId: 's20', studentName: 'Zoe Taylor',     class: '8B',  date: '2026-03-12', parentNotified: false },
  { studentId: 's9',  studentName: 'Noah Kim',       class: '9A',  date: '2026-03-12', parentNotified: true },
  { studentId: 's3',  studentName: 'Marcus Williams',class: '10A', date: '2026-03-11', parentNotified: true },
  { studentId: 's19', studentName: 'Tyler Davis',    class: '8B',  date: '2026-03-10', parentNotified: false },
];
