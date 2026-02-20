import type { ResumeData } from '../backend';

export interface ResumeScore {
  totalScore: number;
  completenessScore: number;
  contentQualityScore: number;
  formattingScore: number;
  skillRelevanceScore: number;
  feedback: {
    completeness: string[];
    contentQuality: string[];
    formatting: string[];
    skillRelevance: string[];
  };
}

/**
 * Calculate resume score based on multiple criteria
 */
export function calculateResumeScore(resumeData: ResumeData): ResumeScore {
  const feedback = {
    completeness: [] as string[],
    contentQuality: [] as string[],
    formatting: [] as string[],
    skillRelevance: [] as string[],
  };

  // 1. Completeness Score (25 points)
  let completenessScore = 0;
  
  if (resumeData.name && resumeData.name.length > 2) {
    completenessScore += 3;
    feedback.completeness.push('✓ Name provided');
  } else {
    feedback.completeness.push('✗ Missing name');
  }
  
  if (resumeData.contactInfo) {
    completenessScore += 4;
    feedback.completeness.push('✓ Contact information provided');
  } else {
    feedback.completeness.push('✗ Missing contact information');
  }
  
  if (resumeData.workExperience && resumeData.workExperience.length > 0) {
    completenessScore += 6;
    feedback.completeness.push(`✓ ${resumeData.workExperience.length} work experience entries`);
  } else {
    feedback.completeness.push('✗ No work experience listed');
  }
  
  if (resumeData.education && resumeData.education.length > 0) {
    completenessScore += 5;
    feedback.completeness.push(`✓ ${resumeData.education.length} education entries`);
  } else {
    feedback.completeness.push('✗ No education listed');
  }
  
  if (resumeData.skills && resumeData.skills.length > 0) {
    completenessScore += 5;
    feedback.completeness.push(`✓ ${resumeData.skills.length} skills listed`);
  } else {
    feedback.completeness.push('✗ No skills listed');
  }
  
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    completenessScore += 2;
    feedback.completeness.push(`✓ ${resumeData.certifications.length} certifications`);
  }

  // 2. Content Quality Score (25 points)
  let contentQualityScore = 0;
  
  // Check work experience detail
  if (resumeData.workExperience && resumeData.workExperience.length > 0) {
    const avgDuration = resumeData.workExperience.reduce((sum, exp) => sum + Number(exp.durationMonths), 0) / resumeData.workExperience.length;
    
    if (avgDuration >= 12) {
      contentQualityScore += 8;
      feedback.contentQuality.push('✓ Substantial work experience duration');
    } else {
      contentQualityScore += 4;
      feedback.contentQuality.push('○ Limited work experience duration');
    }
    
    if (resumeData.workExperience.length >= 2) {
      contentQualityScore += 5;
      feedback.contentQuality.push('✓ Multiple positions demonstrate career progression');
    }
  }
  
  // Check years of experience
  const years = Number(resumeData.yearsOfExperience);
  if (years >= 5) {
    contentQualityScore += 7;
    feedback.contentQuality.push(`✓ ${years} years of professional experience`);
  } else if (years >= 2) {
    contentQualityScore += 5;
    feedback.contentQuality.push(`○ ${years} years of experience`);
  } else {
    contentQualityScore += 2;
    feedback.contentQuality.push(`○ ${years} years of experience (entry level)`);
  }
  
  // Check education level
  if (resumeData.education && resumeData.education.length > 0) {
    const hasMaster = resumeData.education.some(edu => 
      edu.degree.toLowerCase().includes('master') || edu.degree.toLowerCase().includes('m.s.')
    );
    const hasPhd = resumeData.education.some(edu => 
      edu.degree.toLowerCase().includes('phd') || edu.degree.toLowerCase().includes('doctorate')
    );
    
    if (hasPhd) {
      contentQualityScore += 5;
      feedback.contentQuality.push('✓ Advanced degree (PhD)');
    } else if (hasMaster) {
      contentQualityScore += 3;
      feedback.contentQuality.push('✓ Advanced degree (Master\'s)');
    } else {
      contentQualityScore += 2;
      feedback.contentQuality.push('○ Bachelor\'s degree');
    }
  }

  // 3. Formatting Score (25 points)
  let formattingScore = 0;
  
  // Check data structure consistency
  if (resumeData.workExperience && resumeData.workExperience.length > 0) {
    const allHaveCompany = resumeData.workExperience.every(exp => exp.company && exp.company.length > 0);
    const allHaveRole = resumeData.workExperience.every(exp => exp.role && exp.role.length > 0);
    
    if (allHaveCompany && allHaveRole) {
      formattingScore += 10;
      feedback.formatting.push('✓ Consistent work experience formatting');
    } else {
      formattingScore += 5;
      feedback.formatting.push('○ Some work experience entries incomplete');
    }
  }
  
  if (resumeData.education && resumeData.education.length > 0) {
    const allHaveInstitution = resumeData.education.every(edu => edu.institution && edu.institution.length > 0);
    const allHaveDegree = resumeData.education.every(edu => edu.degree && edu.degree.length > 0);
    
    if (allHaveInstitution && allHaveDegree) {
      formattingScore += 8;
      feedback.formatting.push('✓ Consistent education formatting');
    } else {
      formattingScore += 4;
      feedback.formatting.push('○ Some education entries incomplete');
    }
  }
  
  // Check for proper contact info structure
  if (resumeData.contactInfo && resumeData.contactInfo.includes('@')) {
    formattingScore += 4;
    feedback.formatting.push('✓ Email address included');
  }
  
  if (resumeData.contactInfo && /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeData.contactInfo)) {
    formattingScore += 3;
    feedback.formatting.push('✓ Phone number included');
  }

  // 4. Skill Relevance Score (25 points)
  let skillRelevanceScore = 0;
  
  if (resumeData.skills && resumeData.skills.length > 0) {
    // In-demand technical skills
    const inDemandSkills = [
      'javascript', 'python', 'java', 'react', 'node.js', 'typescript', 'sql',
      'aws', 'azure', 'docker', 'kubernetes', 'git', 'machine learning', 'ai',
      'data analysis', 'agile', 'scrum', 'rest api', 'graphql', 'mongodb',
      'postgresql', 'redis', 'tensorflow', 'pytorch', 'html', 'css'
    ];
    
    const skillsLower = resumeData.skills.map(s => s.toLowerCase());
    const matchingSkills = skillsLower.filter(skill => 
      inDemandSkills.some(demand => skill.includes(demand) || demand.includes(skill))
    );
    
    if (matchingSkills.length >= 10) {
      skillRelevanceScore += 15;
      feedback.skillRelevance.push(`✓ ${matchingSkills.length} in-demand technical skills`);
    } else if (matchingSkills.length >= 5) {
      skillRelevanceScore += 10;
      feedback.skillRelevance.push(`✓ ${matchingSkills.length} in-demand technical skills`);
    } else if (matchingSkills.length >= 2) {
      skillRelevanceScore += 5;
      feedback.skillRelevance.push(`○ ${matchingSkills.length} in-demand technical skills`);
    } else {
      feedback.skillRelevance.push('○ Limited in-demand technical skills');
    }
    
    // Skill diversity
    if (resumeData.skills.length >= 10) {
      skillRelevanceScore += 7;
      feedback.skillRelevance.push('✓ Diverse skill set');
    } else if (resumeData.skills.length >= 5) {
      skillRelevanceScore += 4;
      feedback.skillRelevance.push('○ Moderate skill set');
    }
    
    // Soft skills presence
    const softSkills = ['communication', 'leadership', 'teamwork', 'problem solving', 'critical thinking'];
    const hasSoftSkills = skillsLower.some(skill => 
      softSkills.some(soft => skill.includes(soft))
    );
    
    if (hasSoftSkills) {
      skillRelevanceScore += 3;
      feedback.skillRelevance.push('✓ Soft skills included');
    }
  }

  const totalScore = completenessScore + contentQualityScore + formattingScore + skillRelevanceScore;

  return {
    totalScore,
    completenessScore,
    contentQualityScore,
    formattingScore,
    skillRelevanceScore,
    feedback,
  };
}
