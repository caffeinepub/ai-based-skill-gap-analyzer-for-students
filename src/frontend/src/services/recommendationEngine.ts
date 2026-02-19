/**
 * Recommendation Engine Service
 * Generates personalized course and project recommendations based on skill gaps
 */

import type { Skill } from '../backend';

interface Recommendation {
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
};

export function generateRecommendations(missingSkills: Skill[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  missingSkills.forEach(skill => {
    const skillNameLower = skill.name.toLowerCase();
    
    // Find matching courses
    let courses = COURSE_DATABASE[skillNameLower] || [];
    
    // If no exact match, try partial match
    if (courses.length === 0) {
      Object.keys(COURSE_DATABASE).forEach(key => {
        if (skillNameLower.includes(key) || key.includes(skillNameLower)) {
          courses = COURSE_DATABASE[key];
        }
      });
    }
    
    // Find matching projects
    let projects = PROJECT_DATABASE[skillNameLower] || [];
    
    // If no exact match, try partial match
    if (projects.length === 0) {
      Object.keys(PROJECT_DATABASE).forEach(key => {
        if (skillNameLower.includes(key) || key.includes(skillNameLower)) {
          projects = PROJECT_DATABASE[key];
        }
      });
    }
    
    // Add generic recommendations if none found
    if (courses.length === 0) {
      courses = [
        { 
          title: `Learn ${skill.name}`, 
          url: `https://www.google.com/search?q=learn+${encodeURIComponent(skill.name)}+online+course`, 
          provider: 'Search Online' 
        },
      ];
    }
    
    if (projects.length === 0) {
      projects = [
        { 
          title: `${skill.name} Practice Project`, 
          description: `Build a project to practice ${skill.name} skills` 
        },
      ];
    }

    recommendations.push({
      skill: skill.name,
      courses,
      projects,
    });
  });

  return recommendations;
}
