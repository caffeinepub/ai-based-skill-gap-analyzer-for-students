import type { Skill, SkillLevel, SkillCategory } from '../backend';
import type { ParsedResumeData } from './nlpService';

export interface CategorizedSkills {
  technical: Skill[];
  soft: Skill[];
  domain: Skill[];
}

// Legacy type for backward compatibility - now includes experience data
export interface ExtractedSkillsResult {
  allSkills: string[];
  technicalSkills: string[];
  softSkills: string[];
  experienceLevel: string;
  totalYearsExperience: number;
}

/**
 * Calculate experience level based on years
 */
function calculateExperienceLevel(years: number): string {
  if (years < 2) return 'entry';
  if (years < 5) return 'mid';
  if (years < 10) return 'senior';
  return 'expert';
}

/**
 * Calculate total years of experience from parsed resume data
 */
function calculateTotalYears(parsedData: ParsedResumeData): number {
  if (!parsedData.experience || parsedData.experience.length === 0) {
    return 0;
  }

  // Sum up all experience durations
  let totalMonths = 0;
  for (const exp of parsedData.experience) {
    if (exp.duration) {
      // Try to extract months from duration string
      const monthsMatch = exp.duration.match(/(\d+)\s*months?/i);
      const yearsMatch = exp.duration.match(/(\d+)\s*years?/i);
      
      if (monthsMatch) {
        totalMonths += parseInt(monthsMatch[1]);
      }
      if (yearsMatch) {
        totalMonths += parseInt(yearsMatch[1]) * 12;
      }
    }
  }

  return Math.floor(totalMonths / 12);
}

/**
 * Extract skills from parsed resume data (legacy function)
 */
export function extractSkills(parsedData: ParsedResumeData): ExtractedSkillsResult {
  const allSkills = parsedData.skills || [];
  
  // Technical skills database
  const technicalSkillsDB = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'go', 'rust', 'swift', 'kotlin',
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'asp.net',
    'html', 'css', 'sass', 'tailwind', 'bootstrap',
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'ci/cd',
    'git', 'github', 'gitlab', 'bitbucket',
    'rest api', 'graphql', 'websocket', 'grpc',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
    'data analysis', 'data visualization', 'tableau', 'power bi', 'excel',
    'linux', 'bash', 'shell scripting', 'powershell',
    'agile', 'scrum', 'kanban', 'jira', 'confluence'
  ];

  const technicalSkills: string[] = [];
  const softSkills: string[] = [];

  for (const skill of allSkills) {
    const skillLower = skill.toLowerCase();
    if (technicalSkillsDB.some(tech => skillLower.includes(tech) || tech.includes(skillLower))) {
      technicalSkills.push(skill);
    } else {
      softSkills.push(skill);
    }
  }

  // Ensure at least some technical skills
  if (technicalSkills.length === 0 && allSkills.length > 0) {
    technicalSkills.push(...allSkills.slice(0, Math.min(3, allSkills.length)));
  }

  // Calculate experience metrics
  const totalYearsExperience = calculateTotalYears(parsedData);
  const experienceLevel = calculateExperienceLevel(totalYearsExperience);

  return {
    allSkills,
    technicalSkills,
    softSkills,
    experienceLevel,
    totalYearsExperience,
  };
}

/**
 * Categorize skills into Technical, Soft, and Domain categories
 */
export function categorizeSkills(skills: string[], yearsOfExperience: number): CategorizedSkills {
  const categorized: CategorizedSkills = {
    technical: [],
    soft: [],
    domain: [],
  };

  // Technical skills database
  const technicalSkillsDB = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'go', 'rust', 'swift', 'kotlin',
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'asp.net',
    'html', 'css', 'sass', 'tailwind', 'bootstrap',
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'ci/cd',
    'git', 'github', 'gitlab', 'bitbucket',
    'rest api', 'graphql', 'websocket', 'grpc',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
    'data analysis', 'data visualization', 'tableau', 'power bi', 'excel',
    'linux', 'bash', 'shell scripting', 'powershell',
    'agile', 'scrum', 'kanban', 'jira', 'confluence'
  ];

  // Soft skills database
  const softSkillsDB = [
    'communication', 'leadership', 'teamwork', 'collaboration', 'problem solving',
    'critical thinking', 'analytical', 'creativity', 'adaptability', 'time management',
    'project management', 'presentation', 'negotiation', 'conflict resolution',
    'emotional intelligence', 'mentoring', 'coaching', 'strategic thinking'
  ];

  // Domain skills database
  const domainSkillsDB = [
    'finance', 'accounting', 'banking', 'investment', 'trading',
    'healthcare', 'medical', 'clinical', 'pharmaceutical',
    'marketing', 'sales', 'advertising', 'branding', 'seo', 'sem',
    'education', 'teaching', 'training', 'curriculum',
    'legal', 'compliance', 'regulatory', 'audit',
    'manufacturing', 'supply chain', 'logistics', 'operations',
    'retail', 'e-commerce', 'customer service'
  ];

  for (const skill of skills) {
    const skillLower = skill.toLowerCase();
    const proficiency = inferProficiency(skill, yearsOfExperience);

    // Check technical skills
    if (technicalSkillsDB.some(tech => skillLower.includes(tech) || tech.includes(skillLower))) {
      categorized.technical.push({
        name: skill,
        level: proficiency,
        category: 'technical' as SkillCategory,
      });
      continue;
    }

    // Check soft skills
    if (softSkillsDB.some(soft => skillLower.includes(soft) || soft.includes(skillLower))) {
      categorized.soft.push({
        name: skill,
        level: proficiency,
        category: 'softSkills' as SkillCategory,
      });
      continue;
    }

    // Check domain skills
    if (domainSkillsDB.some(domain => skillLower.includes(domain) || domain.includes(skillLower))) {
      categorized.domain.push({
        name: skill,
        level: proficiency,
        category: 'technical' as SkillCategory, // Backend only has technical/softSkills
      });
      continue;
    }

    // Default to technical if uncertain
    categorized.technical.push({
      name: skill,
      level: proficiency,
      category: 'technical' as SkillCategory,
    });
  }

  return categorized;
}

/**
 * Infer proficiency level based on context and years of experience
 */
function inferProficiency(skill: string, yearsOfExperience: number): SkillLevel {
  const skillLower = skill.toLowerCase();

  // Check for explicit proficiency indicators in the skill name
  if (skillLower.includes('expert') || skillLower.includes('advanced') || skillLower.includes('proficient')) {
    return 'advanced' as SkillLevel;
  }

  if (skillLower.includes('intermediate') || skillLower.includes('working knowledge')) {
    return 'intermediate' as SkillLevel;
  }

  if (skillLower.includes('basic') || skillLower.includes('beginner') || skillLower.includes('familiar')) {
    return 'beginner' as SkillLevel;
  }

  // Infer based on years of experience
  if (yearsOfExperience >= 5) {
    return 'advanced' as SkillLevel;
  } else if (yearsOfExperience >= 2) {
    return 'intermediate' as SkillLevel;
  } else {
    return 'beginner' as SkillLevel;
  }
}

/**
 * Get proficiency level display name
 */
export function getProficiencyDisplay(level: SkillLevel): string {
  switch (level) {
    case 'advanced':
      return 'Advanced';
    case 'intermediate':
      return 'Intermediate';
    case 'beginner':
      return 'Beginner';
    default:
      return 'Intermediate';
  }
}

/**
 * Get proficiency level color
 */
export function getProficiencyColor(level: SkillLevel): string {
  switch (level) {
    case 'advanced':
      return 'text-green-600 dark:text-green-400';
    case 'intermediate':
      return 'text-amber-600 dark:text-amber-400';
    case 'beginner':
      return 'text-gray-600 dark:text-gray-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}
