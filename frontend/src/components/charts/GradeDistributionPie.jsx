import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '../../contexts/DataContext';

const COLORS = ['#10b981', '#3b82f6', '#6366f1', '#f59e0b', '#f97316', '#ef4444'];

export default function GradeDistributionPie() {
  const { grades: gradesByStudent } = useData();
  const counts = { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'F': 0 };
  Object.values(gradesByStudent).forEach((subjects) => {
    subjects.forEach((s) => { if (counts[s.grade] !== undefined) counts[s.grade]++; });
  });
  const data = Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
          {data.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
