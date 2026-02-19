/**
 * Skill Matching Service
 * Implements cosine similarity algorithm to compare resume skills with job requirements
 */

import type { JobRole, Skill } from '../backend';

interface MatchResult {
  percentage: number;
  matchingSkills: Skill[];
}

export function calculateSkillMatch(extractedSkills: string[], jobRole: JobRole): MatchResult {
  const requiredSkills = jobRole.requiredSkills;
  const matchingSkills: Skill[] = [];

  // Normalize extracted skills for comparison
  const normalizedExtracted = extractedSkills.map(s => s.toLowerCase().trim());

  // Find matching skills
  requiredSkills.forEach(reqSkill => {
    const reqSkillNormalized = reqSkill.name.toLowerCase().trim();
    
    // Check for exact match or partial match
    const isMatch = normalizedExtracted.some(extracted => 
      extracted === reqSkillNormalized || 
      extracted.includes(reqSkillNormalized) ||
      reqSkillNormalized.includes(extracted)
    );

    if (isMatch) {
      matchingSkills.push(reqSkill);
    }
  });

  // Calculate match percentage
  const percentage = requiredSkills.length > 0
    ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
    : 0;

  return {
    percentage,
    matchingSkills,
  };
}
