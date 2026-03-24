import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useData } from '../../contexts/DataContext';

export default function PerformanceLine({ studentId }) {
  const { grades: gradesByStudent } = useData();
  const subjects = gradesByStudent[studentId] || [];
  const examNames = subjects[0]?.scores.map(s => s.examName) || [];

  const data = examNames.map((examName) => {
    const point = { exam: examName.replace('Unit Test', 'UT') };
    subjects.forEach((sub) => {
      const score = sub.scores.find(s => s.examName === examName);
      if (score) point[sub.subject] = Math.round((score.scored / score.maxMarks) * 100);
    });
    return point;
  });

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
  const subjectNames = subjects.map(s => s.subject);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="exam" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(value, name) => [`${value}%`, name]}
          contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {subjectNames.map((name, i) => (
          <Line key={name} type="monotone" dataKey={name} stroke={colors[i]} strokeWidth={2} dot={{ r: 3 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
