import type { ResumeData, WorkExperience, Education } from '../backend';
import { extractComprehensiveResumeData } from './nlpService';

export interface ParsedResumeData {
  name: string;
  contactInfo: string | null;
  skills: string[] | null;
  workExperience: WorkExperience[] | null;
  education: Education[] | null;
  yearsOfExperience: bigint;
  certifications: string[] | null;
  // Enhanced fields
  phone?: string;
  email?: string;
  linkedIn?: string;
  location?: string;
  professionalSummary?: string;
  languages?: Array<{ language: string; proficiency: string }>;
}

export async function parseResumeWithAI(file: File): Promise<ParsedResumeData> {
  try {
    // Convert file to bytes for processing
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Extract comprehensive data from resume
    const extractedData = await extractComprehensiveResumeData(bytes, file.name);
    
    return extractedData;
  } catch (error) {
    console.error('Resume parsing error:', error);
    throw new Error('Failed to parse resume. Please ensure the file is readable and try again.');
  }
}
