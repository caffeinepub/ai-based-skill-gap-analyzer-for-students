/**
 * Skill Extraction Service
 * Analyzes parsed resume text and extracts technical and soft skills
 */

const TECHNICAL_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
  'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'asp.net',
  'html', 'css', 'sass', 'tailwind', 'bootstrap',
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab',
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
  'data analysis', 'pandas', 'numpy', 'matplotlib', 'tableau', 'power bi',
  'rest api', 'graphql', 'microservices', 'agile', 'scrum', 'devops',
];

const SOFT_SKILLS = [
  'communication', 'leadership', 'teamwork', 'problem solving', 'critical thinking',
  'time management', 'adaptability', 'creativity', 'collaboration', 'presentation',
  'project management', 'analytical', 'decision making', 'conflict resolution',
];

export function extractSkills(resumeText: string): string[] {
  const text = resumeText.toLowerCase();
  const extractedSkills = new Set<string>();

  // Extract technical skills
  TECHNICAL_SKILLS.forEach(skill => {
    if (text.includes(skill.toLowerCase())) {
      extractedSkills.add(skill);
    }
  });

  // Extract soft skills
  SOFT_SKILLS.forEach(skill => {
    if (text.includes(skill.toLowerCase())) {
      extractedSkills.add(skill);
    }
  });

  // Normalize skill names
  const normalized = Array.from(extractedSkills).map(skill => {
    // Capitalize first letter of each word
    return skill.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  });

  return normalized;
}
