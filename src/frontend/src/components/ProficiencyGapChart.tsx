import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Skill } from '../backend';

interface ProficiencyGapChartProps {
  matchingSkills: Skill[];
  missingSkills: Skill[];
}

export default function ProficiencyGapChart({ matchingSkills, missingSkills }: ProficiencyGapChartProps) {
  const beginnerMatching = matchingSkills.filter(s => s.level === 'beginner').length;
  const intermediateMatching = matchingSkills.filter(s => s.level === 'intermediate').length;
  const advancedMatching = matchingSkills.filter(s => s.level === 'advanced').length;
  
  const beginnerMissing = missingSkills.filter(s => s.level === 'beginner').length;
  const intermediateMissing = missingSkills.filter(s => s.level === 'intermediate').length;
  const advancedMissing = missingSkills.filter(s => s.level === 'advanced').length;

  const data = [
    {
      level: 'Beginner',
      Matching: beginnerMatching,
      Missing: beginnerMissing,
    },
    {
      level: 'Intermediate',
      Matching: intermediateMatching,
      Missing: intermediateMissing,
    },
    {
      level: 'Advanced',
      Matching: advancedMatching,
      Missing: advancedMissing,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proficiency Level Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="level" />
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
