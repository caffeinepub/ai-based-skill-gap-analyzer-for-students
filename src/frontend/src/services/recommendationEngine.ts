/**
 * Recommendation Engine Service
 * Generates personalized course and project recommendations based on skill gaps and resume context
 */

import type { Skill } from '../backend';

export interface Recommendation {
  skill: string;
  courses: Array<{ title: string; url: string; provider: string }>;
  projects: Array<{ title: string; description: string }>;
}

const COURSE_DATABASE: Record<string, Array<{ title: string; url: string; provider: string }>> = {
  'javascript': [
    { title: 'JavaScript - The Complete Guide', url: 'https://www.udemy.com/course/javascript-the-complete-guide-2020-beginner-advanced/', provider: 'Udemy' },
    { title: 'JavaScript Algorithms and Data Structures', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', provider: 'freeCodeCamp' },
  ],
  'python': [
    { title: 'Python for Everybody', url: 'https://www.coursera.org/specializations/python', provider: 'Coursera' },
    { title: 'Complete Python Bootcamp', url: 'https://www.udemy.com/course/complete-python-bootcamp/', provider: 'Udemy' },
  ],
  'react': [
    { title: 'React - The Complete Guide', url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/', provider: 'Udemy' },
    { title: 'React Documentation', url: 'https://react.dev/learn', provider: 'React.dev' },
  ],
  'sql': [
    { title: 'SQL for Data Science', url: 'https://www.coursera.org/learn/sql-for-data-science', provider: 'Coursera' },
    { title: 'The Complete SQL Bootcamp', url: 'https://www.udemy.com/course/the-complete-sql-bootcamp/', provider: 'Udemy' },
  ],
  'machine learning': [
    { title: 'Machine Learning Specialization', url: 'https://www.coursera.org/specializations/machine-learning-introduction', provider: 'Coursera' },
    { title: 'Machine Learning A-Z', url: 'https://www.udemy.com/course/machinelearning/', provider: 'Udemy' },
  ],
  'docker': [
    { title: 'Docker Mastery', url: 'https://www.udemy.com/course/docker-mastery/', provider: 'Udemy' },
    { title: 'Docker Documentation', url: 'https://docs.docker.com/get-started/', provider: 'Docker' },
  ],
  'kubernetes': [
    { title: 'Kubernetes for Beginners', url: 'https://www.udemy.com/course/learn-kubernetes/', provider: 'Udemy' },
    { title: 'Kubernetes Documentation', url: 'https://kubernetes.io/docs/tutorials/', provider: 'Kubernetes' },
  ],
};

const PROJECT_DATABASE: Record<string, Array<{ title: string; description: string }>> = {
  'javascript': [
    { title: 'Build a Todo App', description: 'Create a full-featured todo application with local storage' },
    { title: 'Weather Dashboard', description: 'Build a weather app using a public API' },
  ],
  'python': [
    { title: 'Web Scraper', description: 'Create a web scraper to extract data from websites' },
    { title: 'Data Analysis Project', description: 'Analyze a dataset using pandas and create visualizations' },
  ],
  'react': [
    { title: 'E-commerce Frontend', description: 'Build a responsive e-commerce website with React' },
    { title: 'Social Media Dashboard', description: 'Create a dashboard with real-time data updates' },
  ],
  'sql': [
    { title: 'Database Design Project', description: 'Design and implement a relational database for a business scenario' },
    { title: 'Data Analysis with SQL', description: 'Perform complex queries and analysis on a large dataset' },
  ],
  'machine learning': [
    { title: 'Predictive Model', description: 'Build a machine learning model to predict outcomes' },
    { title: 'Image Classification', description: 'Create an image classifier using deep learning' },
  ],
  'docker': [
    { title: 'Containerize an Application', description: 'Package a web application with Docker' },
    { title: 'Multi-container Setup', description: 'Create a Docker Compose setup with multiple services' },
  ],
  'kubernetes': [
    { title: 'Deploy to Kubernetes', description: 'Deploy a multi-tier application to a Kubernetes cluster' },
    { title: 'Kubernetes Monitoring', description: 'Set up monitoring and logging for Kubernetes applications' },
  ],
};

const DEFAULT_COURSES = [
  { title: 'Skill Development Course', url: 'https://www.coursera.org/', provider: 'Coursera' },
  { title: 'Professional Development', url: 'https://www.udemy.com/', provider: 'Udemy' },
];

const DEFAULT_PROJECTS = [
  { title: 'Practice Project', description: 'Build a project to practice this skill' },
  { title: 'Portfolio Project', description: 'Create a portfolio piece demonstrating this skill' },
];

export function generateRecommendations(missingSkills: Skill[], experienceLevel: string): Recommendation[] {
  // Validate input
  if (!missingSkills || missingSkills.length === 0) {
    return [];
  }

  const recommendations: Recommendation[] = [];
  
  missingSkills.forEach(skill => {
    const skillNameLower = skill.name.toLowerCase();
    
    // Find matching courses
    let courses = COURSE_DATABASE[skillNameLower] || DEFAULT_COURSES;
    
    // Find matching projects
    let projects = PROJECT_DATABASE[skillNameLower] || DEFAULT_PROJECTS;
    
    recommendations.push({
      skill: skill.name,
      courses,
      projects
    });
  });
  
  return recommendations;
}
