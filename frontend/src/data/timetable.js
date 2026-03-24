const periods = [
  { time: '8:00 - 8:45' },
  { time: '8:45 - 9:30' },
  { time: '9:30 - 10:15' },
  { time: '10:35 - 11:20' },
  { time: '11:20 - 12:05' },
  { time: '12:05 - 12:50' },
];

export const timetables = {
  '10A': {
    Monday:    ['Mathematics', 'English', 'Science', 'History', 'Computer Science', 'PE'],
    Tuesday:   ['English', 'Mathematics', 'History', 'Science', 'PE', 'Computer Science'],
    Wednesday: ['Science', 'Computer Science', 'Mathematics', 'English', 'History', 'Mathematics'],
    Thursday:  ['History', 'Science', 'English', 'Computer Science', 'Mathematics', 'Science'],
    Friday:    ['Computer Science', 'History', 'PE', 'Mathematics', 'English', 'History'],
  },
  '10B': {
    Monday:    ['English', 'Science', 'Mathematics', 'Computer Science', 'History', 'PE'],
    Tuesday:   ['Mathematics', 'History', 'English', 'PE', 'Science', 'Mathematics'],
    Wednesday: ['Computer Science', 'Mathematics', 'History', 'Science', 'English', 'History'],
    Thursday:  ['Science', 'English', 'Computer Science', 'Mathematics', 'PE', 'Science'],
    Friday:    ['History', 'PE', 'Science', 'English', 'Computer Science', 'Mathematics'],
  },
  '9A': {
    Monday:    ['Science', 'Mathematics', 'English', 'Computer Science', 'History', 'PE'],
    Tuesday:   ['Mathematics', 'Science', 'PE', 'English', 'Computer Science', 'History'],
    Wednesday: ['English', 'History', 'Science', 'Mathematics', 'PE', 'Science'],
    Thursday:  ['Computer Science', 'English', 'Mathematics', 'History', 'Science', 'English'],
    Friday:    ['History', 'Computer Science', 'Mathematics', 'PE', 'English', 'Mathematics'],
  },
  '9B': {
    Monday:    ['Mathematics', 'Computer Science', 'Science', 'History', 'English', 'PE'],
    Tuesday:   ['Science', 'English', 'Mathematics', 'PE', 'History', 'Computer Science'],
    Wednesday: ['History', 'Science', 'English', 'Computer Science', 'Mathematics', 'Science'],
    Thursday:  ['English', 'Mathematics', 'History', 'Science', 'Computer Science', 'History'],
    Friday:    ['PE', 'History', 'Computer Science', 'English', 'Science', 'Mathematics'],
  },
  '8A': {
    Monday:    ['English', 'History', 'Mathematics', 'Science', 'PE', 'Computer Science'],
    Tuesday:   ['Science', 'Mathematics', 'History', 'English', 'Computer Science', 'PE'],
    Wednesday: ['Mathematics', 'Science', 'English', 'PE', 'History', 'Mathematics'],
    Thursday:  ['History', 'Computer Science', 'Science', 'Mathematics', 'English', 'Science'],
    Friday:    ['Computer Science', 'PE', 'History', 'Science', 'Mathematics', 'English'],
  },
  '8B': {
    Monday:    ['History', 'Mathematics', 'PE', 'English', 'Science', 'Computer Science'],
    Tuesday:   ['Computer Science', 'Science', 'English', 'History', 'Mathematics', 'English'],
    Wednesday: ['PE', 'English', 'Computer Science', 'Mathematics', 'Science', 'History'],
    Thursday:  ['Mathematics', 'History', 'Science', 'Computer Science', 'English', 'PE'],
    Friday:    ['Science', 'Computer Science', 'Mathematics', 'PE', 'History', 'Science'],
  },
};

export const periodTimes = periods;
export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function getTodayTimetable(classSection) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = dayNames[new Date().getDay()];
  const daySchedule = timetables[classSection]?.[today];
  if (!daySchedule) return null;
  return { day: today, subjects: daySchedule, periods };
}
