/**
 * Skill Matching Service
 * Implements comparison algorithm to calculate match percentage and identify matching skills
 * Considers both skill name and proficiency level for accurate matching
 */

import type { JobRole, Skill, SkillLevel } from '../backend';
import type { ExtractedSkillsResult } from './skillExtraction';

export interface MatchResult {
  percentage: number;
  matchingSkills: Skill[];
}

export interface JobRoleMatchResult {
  jobRole: JobRole;
  matchPercentage: number;
  matchingSkills: Skill[];
  missingSkills: Skill[];
  matchingSkillsCount: number;
  totalSkillsCount: number;
}

// Define proficiency hierarchy for comparison
const proficiencyHierarchy: Record<SkillLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

function meetsOrExceedsProficiency(resumeLevel: SkillLevel, requiredLevel: SkillLevel): boolean {
  return proficiencyHierarchy[resumeLevel] >= proficiencyHierarchy[requiredLevel];
}

export function calculateSkillMatch(
  extractedSkillsResult: ExtractedSkillsResult,
  jobRole: JobRole
): MatchResult {
  const requiredSkills = jobRole.requiredSkills;
  const matchingSkills: Skill[] = [];
  
  // Normalize extracted skills for comparison
  const normalizedExtracted = extractedSkillsResult.allSkills.map(s => s.toLowerCase().trim());
  
  // Find matching skills considering proficiency levels
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

export function calculateSkillMatchWithProficiency(
  resumeSkills: Skill[],
  jobRole: JobRole
): MatchResult {
  const requiredSkills = jobRole.requiredSkills;
  const matchingSkills: Skill[] = [];
  
  // Create a map of resume skills for efficient lookup
  const resumeSkillMap = new Map<string, Skill>();
  resumeSkills.forEach(skill => {
    resumeSkillMap.set(skill.name.toLowerCase().trim(), skill);
  });
  
  // Find matching skills considering both name and proficiency level
  requiredSkills.forEach(reqSkill => {
    const reqSkillNormalized = reqSkill.name.toLowerCase().trim();
    
    // Check for exact match
    const resumeSkill = resumeSkillMap.get(reqSkillNormalized);
    
    if (resumeSkill) {
      // Skill exists - check if proficiency level meets or exceeds requirement
      if (meetsOrExceedsProficiency(resumeSkill.level, reqSkill.level)) {
        matchingSkills.push(reqSkill);
      }
    } else {
      // Check for partial matches
      for (const [resumeSkillName, resumeSkillData] of resumeSkillMap.entries()) {
        if (
          resumeSkillName.includes(reqSkillNormalized) ||
          reqSkillNormalized.includes(resumeSkillName)
        ) {
          if (meetsOrExceedsProficiency(resumeSkillData.level, reqSkill.level)) {
            matchingSkills.push(reqSkill);
            break;
          }
        }
      }
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

export function calculateJobRoleMatches(
  extractedSkillsResult: ExtractedSkillsResult,
  jobRoles: JobRole[]
): JobRoleMatchResult[] {
  const results: JobRoleMatchResult[] = [];

  for (const jobRole of jobRoles) {
    const matchResult = calculateSkillMatch(extractedSkillsResult, jobRole);
    
    // Identify missing skills
    const matchingSkillNames = new Set(matchResult.matchingSkills.map(s => s.name.toLowerCase()));
    const missingSkills = jobRole.requiredSkills.filter(
      skill => !matchingSkillNames.has(skill.name.toLowerCase())
    );

    results.push({
      jobRole,
      matchPercentage: matchResult.percentage,
      matchingSkills: matchResult.matchingSkills,
      missingSkills,
      matchingSkillsCount: matchResult.matchingSkills.length,
      totalSkillsCount: jobRole.requiredSkills.length,
    });
  }

  // Sort by match percentage (highest first)
  return results.sort((a, b) => b.matchPercentage - a.matchPercentage);
}

// Legacy function for backward compatibility
export function calculateSkillMatchLegacy(extractedSkills: string[], jobRole: JobRole): MatchResult {
  const requiredSkills = jobRole.requiredSkills;
  const matchingSkills: Skill[] = [];
  
  const normalizedExtracted = extractedSkills.map(s => s.toLowerCase().trim());
  
  requiredSkills.forEach(reqSkill => {
    const reqSkillNormalized = reqSkill.name.toLowerCase().trim();
    
    const isMatch = normalizedExtracted.some(extracted => 
      extracted === reqSkillNormalized || 
      extracted.includes(reqSkillNormalized) ||
      reqSkillNormalized.includes(extracted)
    );
    
    if (isMatch) {
      matchingSkills.push(reqSkill);
    }
  });
  
  const percentage = requiredSkills.length > 0
    ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
    : 0;
  
  return {
    percentage,
    matchingSkills,
  };
}
