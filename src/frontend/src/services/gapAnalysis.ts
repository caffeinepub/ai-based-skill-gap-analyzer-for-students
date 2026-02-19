/**
 * Gap Analysis Service
 * Identifies missing skills by comparing resume skills with job requirements
 */

import type { JobRole, Skill } from '../backend';

export function identifyMissingSkills(extractedSkills: string[], jobRole: JobRole): Skill[] {
  const requiredSkills = jobRole.requiredSkills;
  const missingSkills: Skill[] = [];

  // Normalize extracted skills for comparison
  const normalizedExtracted = extractedSkills.map(s => s.toLowerCase().trim());

  // Find missing skills
  requiredSkills.forEach(reqSkill => {
    const reqSkillNormalized = reqSkill.name.toLowerCase().trim();
    
    // Check if skill is missing
    const isMissing = !normalizedExtracted.some(extracted => 
      extracted === reqSkillNormalized || 
      extracted.includes(reqSkillNormalized) ||
      reqSkillNormalized.includes(extracted)
    );

    if (isMissing) {
      missingSkills.push(reqSkill);
    }
  });

  return missingSkills;
}
