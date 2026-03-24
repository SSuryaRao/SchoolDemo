const subjects = ['Mathematics', 'Science', 'English', 'History', 'Computer Science'];

const exams = [
  { name: 'Unit Test 1', maxMarks: 25, date: '2026-01-20' },
  { name: 'Midterm',     maxMarks: 50, date: '2026-02-10' },
  { name: 'Unit Test 2', maxMarks: 25, date: '2026-02-25' },
  { name: 'Final Exam',  maxMarks: 100, date: '2026-03-10' },
];

// Raw scores per student per subject [UT1, Midterm, UT2, Final]
const rawScores = {
  s1:  { Mathematics: [23,44,21,89], Science: [20,38,19,78], English: [24,46,22,91], History: [21,40,20,82], 'Computer Science': [25,48,23,95] },
  s2:  { Mathematics: [25,49,24,96], Science: [24,47,23,92], English: [23,45,22,88], History: [24,46,23,91], 'Computer Science': [22,43,21,85] },
  s3:  { Mathematics: [18,35,17,70], Science: [19,37,18,73], English: [20,39,19,76], History: [17,33,16,65], 'Computer Science': [15,30,14,62] },
  s4:  { Mathematics: [22,43,21,85], Science: [21,41,20,82], English: [24,47,23,92], History: [23,44,22,88], 'Computer Science': [20,39,19,78] },
  s5:  { Mathematics: [24,47,23,93], Science: [25,49,24,97], English: [21,41,20,83], History: [22,43,21,86], 'Computer Science': [24,46,23,91] },
  s6:  { Mathematics: [20,39,19,78], Science: [22,43,21,85], English: [25,49,24,96], History: [21,41,20,82], 'Computer Science': [19,37,18,73] },
  s7:  { Mathematics: [16,31,15,63], Science: [17,33,16,65], English: [18,35,17,69], History: [15,29,14,58], 'Computer Science': [14,28,13,55] },
  s8:  { Mathematics: [21,41,20,82], Science: [23,44,22,88], English: [22,43,21,85], History: [20,39,19,77], 'Computer Science': [21,40,20,80] },
  s9:  { Mathematics: [19,37,18,74], Science: [20,38,19,76], English: [18,35,17,69], History: [19,36,18,72], 'Computer Science': [22,42,21,83] },
  s10: { Mathematics: [23,44,22,88], Science: [22,42,21,84], English: [24,46,23,91], History: [23,44,22,87], 'Computer Science': [21,41,20,81] },
  s11: { Mathematics: [20,39,19,77], Science: [19,37,18,74], English: [21,40,20,79], History: [20,38,19,76], 'Computer Science': [23,44,22,87] },
  s12: { Mathematics: [25,50,25,99], Science: [24,48,24,96], English: [25,49,24,97], History: [24,47,23,93], 'Computer Science': [25,50,25,100] },
  s13: { Mathematics: [14,27,13,54], Science: [15,29,14,57], English: [16,31,15,61], History: [13,25,12,50], 'Computer Science': [12,23,11,46] },
  s14: { Mathematics: [22,43,21,86], Science: [23,44,22,88], English: [21,41,20,82], History: [22,43,21,85], 'Computer Science': [20,39,19,78] },
  s15: { Mathematics: [24,46,23,92], Science: [25,48,24,96], English: [23,44,22,88], History: [24,46,23,91], 'Computer Science': [22,43,21,86] },
  s16: { Mathematics: [19,37,18,74], Science: [20,39,19,77], English: [22,42,21,83], History: [18,35,17,70], 'Computer Science': [21,40,20,79] },
  s17: { Mathematics: [21,41,20,82], Science: [20,38,19,76], English: [19,37,18,73], History: [21,40,20,79], 'Computer Science': [23,44,22,87] },
  s18: { Mathematics: [23,44,22,88], Science: [22,42,21,84], English: [24,46,23,91], History: [22,43,21,85], 'Computer Science': [21,41,20,82] },
  s19: { Mathematics: [17,33,16,66], Science: [18,34,17,68], English: [19,37,18,73], History: [16,31,15,62], 'Computer Science': [20,38,19,75] },
  s20: { Mathematics: [15,29,14,57], Science: [16,31,15,60], English: [17,33,16,65], History: [14,27,13,52], 'Computer Science': [13,25,12,48] },
};

function getGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  return 'F';
}

function getGPA(percentage) {
  if (percentage >= 90) return 4.0;
  if (percentage >= 80) return 3.7;
  if (percentage >= 70) return 3.3;
  if (percentage >= 60) return 3.0;
  if (percentage >= 50) return 2.0;
  return 0.0;
}

function buildGrades() {
  const grades = {};
  Object.entries(rawScores).forEach(([sid, subjectScores]) => {
    grades[sid] = subjects.map((subject) => {
      const scores = subjectScores[subject];
      const detailed = exams.map((exam, i) => ({
        examName: exam.name,
        maxMarks: exam.maxMarks,
        scored: scores[i],
        date: exam.date,
      }));
      const totalMax = exams.reduce((s, e) => s + e.maxMarks, 0);
      const totalScored = scores.reduce((s, v) => s + v, 0);
      const percentage = Math.round((totalScored / totalMax) * 1000) / 10;
      return {
        studentId: sid,
        subject,
        scores: detailed,
        totalMarks: totalMax,
        totalScored,
        percentage,
        grade: getGrade(percentage),
        gpa: getGPA(percentage),
      };
    });
  });
  return grades;
}

export const gradesByStudent = buildGrades();

export function getStudentGPA(studentId) {
  const subjects = gradesByStudent[studentId] || [];
  if (!subjects.length) return 0;
  const avg = subjects.reduce((s, sub) => s + sub.gpa, 0) / subjects.length;
  return Math.round(avg * 100) / 100;
}

export function getStudentOverallPercentage(studentId) {
  const subjects = gradesByStudent[studentId] || [];
  if (!subjects.length) return 0;
  const avg = subjects.reduce((s, sub) => s + sub.percentage, 0) / subjects.length;
  return Math.round(avg * 10) / 10;
}

export const subjectList = subjects;
export const examList = exams;
