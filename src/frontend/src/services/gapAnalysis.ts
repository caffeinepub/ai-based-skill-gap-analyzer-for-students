/**
 * Gap Analysis Service
 * Identifies missing skills by comparing resume skills with job requirements
 * Considers both skill name and proficiency level for accurate gap identification
 */

import type { JobRole, Skill, SkillLevel } from '../backend';
import type { ParsedResumeData, ExperienceEntry, EducationEntry } from './nlpService';
import type { ExtractedSkillsResult } from './skillExtraction';

export interface GapAnalysisResult {
  missingSkills: Skill[];
  matchingSkills: Skill[];
  insufficientProficiencySkills: Skill[];
  resumeContext: {
    experience: ExperienceEntry[];
    education: EducationEntry[];
    certifications: string[];
    experienceLevel: string;
    totalYearsExperience: number;
  };
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

export function performGapAnalysis(
  extractedSkillsResult: ExtractedSkillsResult,
  resumeData: ParsedResumeData,
  jobRole: JobRole
): GapAnalysisResult {
  // Validate input data
  if (!extractedSkillsResult.allSkills || extractedSkillsResult.allSkills.length === 0) {
    throw new Error('No skills found in resume');
  }

  if (!resumeData.experience || resumeData.experience.length === 0) {
    throw new Error('No work experience found in resume');
  }

  if (!resumeData.education || resumeData.education.length === 0) {
    throw new Error('No education found in resume');
  }

  const requiredSkills = jobRole.requiredSkills;
  const missingSkills: Skill[] = [];
  const matchingSkills: Skill[] = [];
  const insufficientProficiencySkills: Skill[] = [];
  
  // Normalize extracted skills for comparison
  const normalizedExtracted = extractedSkillsResult.allSkills.map(s => s.toLowerCase().trim());
  
  // Find matching, missing, and insufficient proficiency skills
  requiredSkills.forEach(reqSkill => {
    const reqSkillNormalized = reqSkill.name.toLowerCase().trim();
    
    // Check if skill is present
    const isMatch = normalizedExtracted.some(extracted => 
      extracted === reqSkillNormalized || 
      extracted.includes(reqSkillNormalized) ||
      reqSkillNormalized.includes(extracted)
    );
    
    if (isMatch) {
      matchingSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });
  
  return {
    missingSkills,
    matchingSkills,
    insufficientProficiencySkills,
    resumeContext: {
      experience: resumeData.experience,
      education: resumeData.education,
      certifications: resumeData.certifications,
      experienceLevel: extractedSkillsResult.experienceLevel,
      totalYearsExperience: extractedSkillsResult.totalYearsExperience
    }
  };
}

export function performGapAnalysisWithProficiency(
  resumeSkills: Skill[],
  resumeData: ParsedResumeData,
  jobRole: JobRole,
  extractedSkillsResult: ExtractedSkillsResult
): GapAnalysisResult {
  // Validate input data
  if (!resumeSkills || resumeSkills.length === 0) {
    throw new Error('No skills found in resume');
  }

  if (!resumeData.experience || resumeData.experience.length === 0) {
    throw new Error('No work experience found in resume');
  }

  if (!resumeData.education || resumeData.education.length === 0) {
    throw new Error('No education found in resume');
  }

  const requiredSkills = jobRole.requiredSkills;
  const missingSkills: Skill[] = [];
  const matchingSkills: Skill[] = [];
  const insufficientProficiencySkills: Skill[] = [];
  
  // Create a map of resume skills for efficient lookup
  const resumeSkillMap = new Map<string, Skill>();
  resumeSkills.forEach(skill => {
    resumeSkillMap.set(skill.name.toLowerCase().trim(), skill);
  });
  
  // Find matching, missing, and insufficient proficiency skills
  requiredSkills.forEach(reqSkill => {
    const reqSkillNormalized = reqSkill.name.toLowerCase().trim();
    
    // Check for exact match
    const resumeSkill = resumeSkillMap.get(reqSkillNormalized);
    
    if (resumeSkill) {
      // Skill exists - check proficiency level
      if (meetsOrExceedsProficiency(resumeSkill.level, reqSkill.level)) {
        matchingSkills.push(reqSkill);
      } else {
        // Skill exists but at insufficient proficiency level
        insufficientProficiencySkills.push(reqSkill);
      }
    } else {
      // Check for partial matches
      let foundPartialMatch = false;
      for (const [resumeSkillName, resumeSkillData] of resumeSkillMap.entries()) {
        if (
          resumeSkillName.includes(reqSkillNormalized) ||
          reqSkillNormalized.includes(resumeSkillName)
        ) {
          foundPartialMatch = true;
          if (meetsOrExceedsProficiency(resumeSkillData.level, reqSkill.level)) {
            matchingSkills.push(reqSkill);
          } else {
            insufficientProficiencySkills.push(reqSkill);
          }
          break;
        }
      }
      
      if (!foundPartialMatch) {
        missingSkills.push(reqSkill);
      }
    }
  });
  
  return {
    missingSkills,
    matchingSkills,
    insufficientProficiencySkills,
    resumeContext: {
      experience: resumeData.experience,
      education: resumeData.education,
      certifications: resumeData.certifications,
      experienceLevel: extractedSkillsResult.experienceLevel,
      totalYearsExperience: extractedSkillsResult.totalYearsExperience
    }
  };
}

// Legacy function for backward compatibility
export function identifyMissingSkills(extractedSkills: string[], jobRole: JobRole): Skill[] {
  const requiredSkills = jobRole.requiredSkills;
  const missingSkills: Skill[] = [];
  
  const normalizedExtracted = extractedSkills.map(s => s.toLowerCase().trim());
  
  requiredSkills.forEach(reqSkill => {
    const reqSkillNormalized = reqSkill.name.toLowerCase().trim();
    
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
