import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skill } from '../backend';

interface SkillCategoryChartProps {
  matchingSkills: Skill[];
  missingSkills: Skill[];
}

export default function SkillCategoryChart({ matchingSkills, missingSkills }: SkillCategoryChartProps) {
  const technicalMatching = matchingSkills.filter((s) => s.category === 'technical').length;
  const softSkillsMatching = matchingSkills.filter((s) => s.category === 'softSkills').length;
  const technicalMissing = missingSkills.filter((s) => s.category === 'technical').length;
  const softSkillsMissing = missingSkills.filter((s) => s.category === 'softSkills').length;

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
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
        <YAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Bar dataKey="Matching" fill="hsl(var(--primary))" />
        <Bar dataKey="Missing" fill="hsl(var(--muted))" />
      </BarChart>
    </ResponsiveContainer>
  );
}
