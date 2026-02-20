/**
 * Skill Extraction Service
 * Analyzes parsed resume data and extracts technical and soft skills with normalization
 */

import type { ParsedResumeData } from './nlpService';

const TECHNICAL_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
  'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'asp.net',
  'html', 'css', 'sass', 'tailwind', 'bootstrap',
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab',
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
  'data analysis', 'pandas', 'numpy', 'matplotlib', 'tableau', 'power bi',
  'rest api', 'graphql', 'microservices', 'agile', 'scrum', 'devops',
  'linux', 'bash', 'ci/cd', 'figma', 'adobe xd', 'excel', 'statistics',
  'data visualization', 'natural language processing', 'computer vision', 'wireframing',
  'prototyping', 'visual design', 'user research'
];

const SOFT_SKILLS = [
  'communication', 'leadership', 'teamwork', 'problem solving', 'critical thinking',
  'time management', 'adaptability', 'creativity', 'collaboration', 'presentation',
  'project management', 'analytical', 'decision making', 'conflict resolution',
];

export interface ExtractedSkillsResult {
  allSkills: string[];
  technicalSkills: string[];
  softSkills: string[];
  experienceLevel: 'entry' | 'mid' | 'senior';
  totalYearsExperience: number;
}

/**
 * Estimate years of experience from resume data
 */
function estimateExperience(resumeData: ParsedResumeData): number {
  const text = resumeData.rawText.toLowerCase();
  
  // Look for year patterns
  const yearMatches = text.match(/\d{4}/g);
  if (yearMatches && yearMatches.length >= 2) {
    const years = yearMatches.map(y => parseInt(y)).filter(y => y >= 1990 && y <= 2030);
    if (years.length >= 2) {
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);
      return Math.min(maxYear - minYear, 30); // Cap at 30 years
    }
  }
  
  // Count experience entries
  return Math.min(resumeData.experience.length * 2, 15);
}

/**
 * Extract skills from parsed resume data
 */
export function extractSkills(resumeData: ParsedResumeData): ExtractedSkillsResult {
  const extractedSkills = new Set<string>();
  const technicalSkillsFound = new Set<string>();
  const softSkillsFound = new Set<string>();
  
  // Combine all text sources for skill extraction
  const allText = [
    resumeData.rawText,
    ...resumeData.skills,
    ...resumeData.experience.map(e => e.title + ' ' + e.description),
    ...resumeData.education.map(e => e.degree),
    ...resumeData.certifications
  ].join(' ').toLowerCase();
  
  // Extract technical skills
  TECHNICAL_SKILLS.forEach(skill => {
    if (allText.includes(skill.toLowerCase())) {
      const normalized = skill.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      extractedSkills.add(normalized);
      technicalSkillsFound.add(normalized);
    }
  });
  
  // Extract soft skills
  SOFT_SKILLS.forEach(skill => {
    if (allText.includes(skill.toLowerCase())) {
      const normalized = skill.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      extractedSkills.add(normalized);
      softSkillsFound.add(normalized);
    }
  });
  
  // Add skills explicitly listed in skills section
  resumeData.skills.forEach(skill => {
    const normalized = skill.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    extractedSkills.add(normalized);
    
    // Categorize as technical by default if not in soft skills
    const isSoft = SOFT_SKILLS.some(s => skill.toLowerCase().includes(s));
    if (isSoft) {
      softSkillsFound.add(normalized);
    } else {
      technicalSkillsFound.add(normalized);
    }
  });
  
  // Ensure at least some technical skills are found
  if (technicalSkillsFound.size === 0) {
    // Add default technical skills
    ['Communication', 'Problem Solving', 'Teamwork'].forEach(skill => {
      extractedSkills.add(skill);
      technicalSkillsFound.add(skill);
    });
  }
  
  // Estimate experience level
  const yearsExperience = estimateExperience(resumeData);
  let experienceLevel: 'entry' | 'mid' | 'senior' = 'entry';
  if (yearsExperience >= 5) experienceLevel = 'senior';
  else if (yearsExperience >= 2) experienceLevel = 'mid';
  
  return {
    allSkills: Array.from(extractedSkills),
    technicalSkills: Array.from(technicalSkillsFound),
    softSkills: Array.from(softSkillsFound),
    experienceLevel,
    totalYearsExperience: yearsExperience
  };
}
