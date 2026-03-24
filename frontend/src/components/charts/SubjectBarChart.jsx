import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useData } from '../../contexts/DataContext';

export default function SubjectBarChart({ studentId }) {
  const { grades: gradesByStudent } = useData();
  const subjects = gradesByStudent[studentId] || [];
  const data = subjects.map(s => ({
    subject: s.subject.replace('Computer Science', 'CS'),
    percentage: s.percentage,
  }));

  const getColor = (pct) => {
    if (pct >= 80) return '#10b981';
    if (pct >= 60) return '#3b82f6';
    if (pct >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" barSize={18}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis dataKey="subject" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={80} />
        <Tooltip
          formatter={(value) => [`${value}%`, 'Score']}
          contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => <Cell key={i} fill={getColor(entry.percentage)} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
