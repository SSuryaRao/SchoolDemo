export function calcGPA(grades) {
  if (!grades || !grades.length) return 0;
  const avg = grades.reduce((s, g) => s + g.gpa, 0) / grades.length;
  return Math.round(avg * 100) / 100;
}

export function calcAttendancePercent(present, total) {
  if (!total) return 0;
  return Math.round((present / total) * 1000) / 10;
}

export function calcLetterGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  return 'F';
}

export function gradeColor(grade) {
  if (grade === 'A+' || grade === 'A') return 'green';
  if (grade === 'B+' || grade === 'B') return 'blue';
  if (grade === 'C') return 'yellow';
  return 'red';
}

export function getAttendanceBadge(percentage) {
  if (percentage >= 90) return 'green';
  if (percentage >= 75) return 'yellow';
  return 'red';
}
