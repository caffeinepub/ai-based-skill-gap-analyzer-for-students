import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Skill } from '../backend';

interface SkillCategoryChartProps {
  matchingSkills: Skill[];
  missingSkills: Skill[];
}

export default function SkillCategoryChart({ matchingSkills, missingSkills }: SkillCategoryChartProps) {
  const technicalMatching = matchingSkills.filter(s => s.category === 'technical').length;
  const softSkillsMatching = matchingSkills.filter(s => s.category === 'softSkills').length;
  const technicalMissing = missingSkills.filter(s => s.category === 'technical').length;
  const softSkillsMissing = missingSkills.filter(s => s.category === 'softSkills').length;

  const data = [
    {
      category: 'Technical',
      Matching: technicalMatching,
      Missing: technicalMissing,
    },
    {
      category: 'Soft Skills',
      Matching: softSkillsMatching,
      Missing: softSkillsMissing,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Matching" fill="oklch(0.646 0.222 41.116)" />
            <Bar dataKey="Missing" fill="oklch(0.577 0.245 27.325)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
