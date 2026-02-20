import { useState, useRef } from 'react';
import { useUploadResume } from '../hooks/useQueries';
import { ExternalBlob, SkillCategory, SkillLevel } from '../backend';
import type { WorkExperience, Education, Skill } from '../backend';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { parseResumePDF, type ParsedResumeData } from '../services/nlpService';
import { extractSkills, type ExtractedSkillsResult } from '../services/skillExtraction';

interface ResumeUploadProps {
  onUploadSuccess: (skillsResult: ExtractedSkillsResult, resumeData: ParsedResumeData) => void;
}

export default function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadResume = useUploadResume();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setIsComplete(false);
    setValidationError(null);
  };

  const validateResumeData = (parsedData: ParsedResumeData, skillsResult: ExtractedSkillsResult): string | null => {
    const missingParts: string[] = [];

    // Check for work experience
    if (!parsedData.experience || parsedData.experience.length === 0) {
      missingParts.push('work experience');
    }

    // Check for skills (must have at least one technical skill)
    if (!skillsResult.technicalSkills || skillsResult.technicalSkills.length === 0) {
      missingParts.push('technical skills');
    }

    // Check for education
    if (!parsedData.education || parsedData.education.length === 0) {
      missingParts.push('education');
    }

    if (missingParts.length > 0) {
      return `Resume must contain: ${missingParts.join(', ')}`;
    }

    return null;
  };

  const convertToBackendFormat = (parsedData: ParsedResumeData, skillsResult: ExtractedSkillsResult) => {
    // Convert experiences
    const experiences: WorkExperience[] = parsedData.experience.map(exp => ({
      company: exp.company || 'Unknown Company',
      role: exp.title,
      durationMonths: BigInt(24), // Default 2 years, could be improved with better parsing
    }));

    // Convert skills
    const skills: Skill[] = skillsResult.allSkills.map(skillName => {
      const isTechnical = skillsResult.technicalSkills.includes(skillName);
      return {
        name: skillName,
        level: SkillLevel.intermediate,
        category: isTechnical ? SkillCategory.technical : SkillCategory.softSkills,
      };
    });

    // Convert education
    const education: Education[] = parsedData.education.map(edu => ({
      degree: edu.degree,
      institution: edu.institution || 'Unknown Institution',
      graduationYear: edu.year ? BigInt(parseInt(edu.year)) : BigInt(2020),
    }));

    return { experiences, skills, education };
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setUploadProgress(0);
    setValidationError(null);

    try {
      // Read file as bytes
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Parse PDF and extract structured data
      toast.info('Analyzing resume...');
      const parsedData = await parseResumePDF(bytes);
      const skillsResult = extractSkills(parsedData);

      // Validate resume data
      const validationErrorMsg = validateResumeData(parsedData, skillsResult);
      if (validationErrorMsg) {
        setValidationError(validationErrorMsg);
        toast.error(validationErrorMsg);
        setIsProcessing(false);
        return;
      }

      // Convert to backend format
      const { experiences, skills, education } = convertToBackendFormat(parsedData, skillsResult);

      // Create ExternalBlob with progress tracking
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      // Upload to backend
      const fileId = `resume_${Date.now()}_${file.name}`;
      await uploadResume.mutateAsync({ 
        documentId: fileId, 
        blob,
        experiences,
        skills,
        education,
        recommendations: []
      });

      setIsComplete(true);
      toast.success(`Resume uploaded! Found ${skillsResult.allSkills.length} skills, ${parsedData.experience.length} experience entries, and ${parsedData.education.length} education entries.`);
      onUploadSuccess(skillsResult, parsedData);
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to upload resume';
      toast.error(errorMsg);
      console.error('Upload error:', error);
      setValidationError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {!file ? (
          <div>
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Click to upload or drag and drop your resume
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              Select PDF File
            </Button>
          </div>
        ) : (
          <div>
            {isComplete ? (
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            ) : validationError ? (
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            ) : (
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
            )}
            <p className="font-medium mb-2">{file.name}</p>
            <p className="text-sm text-muted-foreground mb-4">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            
            {validationError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive font-medium">{validationError}</p>
              </div>
            )}
            
            {isProcessing && (
              <div className="mb-4">
                <Progress value={uploadProgress} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
                </p>
              </div>
            )}
            
            {!isComplete && (
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handleUpload}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Upload & Analyze'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setUploadProgress(0);
                    setValidationError(null);
                  }}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
              </div>
            )}
            
            {isComplete && (
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setIsComplete(false);
                  setUploadProgress(0);
                  setValidationError(null);
                }}
              >
                Upload Different Resume
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
