import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SkillMatchChartProps {
  matchingSkills: number;
  missingSkills: number;
}

export default function SkillMatchChart({ matchingSkills, missingSkills }: SkillMatchChartProps) {
  const data = [
    { name: 'Matching Skills', value: matchingSkills, color: 'oklch(0.646 0.222 41.116)' },
    { name: 'Missing Skills', value: missingSkills, color: 'oklch(0.577 0.245 27.325)' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill Match Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
