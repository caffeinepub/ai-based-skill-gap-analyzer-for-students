import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skill } from '../backend';

interface ProficiencyGapChartProps {
  matchingSkills: Skill[];
  missingSkills: Skill[];
}

export default function ProficiencyGapChart({ matchingSkills, missingSkills }: ProficiencyGapChartProps) {
  const beginnerMatching = matchingSkills.filter((s) => s.level === 'beginner').length;
  const intermediateMatching = matchingSkills.filter((s) => s.level === 'intermediate').length;
  const advancedMatching = matchingSkills.filter((s) => s.level === 'advanced').length;

  const beginnerMissing = missingSkills.filter((s) => s.level === 'beginner').length;
  const intermediateMissing = missingSkills.filter((s) => s.level === 'intermediate').length;
  const advancedMissing = missingSkills.filter((s) => s.level === 'advanced').length;

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
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="level" stroke="hsl(var(--muted-foreground))" />
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
