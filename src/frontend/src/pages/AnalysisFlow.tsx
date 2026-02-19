import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import ResumeUpload from '../components/ResumeUpload';
import JobRoleSelector from '../components/JobRoleSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, FileText, Briefcase } from 'lucide-react';
import type { JobRole } from '../backend';

export default function AnalysisFlow() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [selectedJobRole, setSelectedJobRole] = useState<JobRole | null>(null);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Please login to access the skill analysis feature.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canProceed = resumeUploaded && selectedJobRole && extractedSkills.length > 0;

  const handleProceedToAnalysis = () => {
    if (canProceed) {
      navigate({ 
        to: '/dashboard',
        state: { 
          jobRole: selectedJobRole,
          extractedSkills 
        } as any
      });
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Skill Gap Analysis</h1>
          <p className="text-lg text-muted-foreground">
            Upload your resume and select a job role to discover your skill gaps
          </p>
        </div>

        <div className="space-y-8">
          {/* Step 1: Resume Upload */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Step 1: Upload Your Resume</CardTitle>
                  <CardDescription>Upload your resume in PDF format (max 10MB)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResumeUpload 
                onUploadSuccess={(skills) => {
                  setResumeUploaded(true);
                  setExtractedSkills(skills);
                }}
              />
            </CardContent>
          </Card>

          {/* Step 2: Job Role Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Step 2: Select Target Job Role</CardTitle>
                  <CardDescription>Choose the job role you're aiming for</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <JobRoleSelector 
                onSelect={setSelectedJobRole}
                disabled={!resumeUploaded}
              />
            </CardContent>
          </Card>

          {/* Proceed Button */}
          <div className="flex justify-center pt-4">
            <Button 
              size="lg" 
              onClick={handleProceedToAnalysis}
              disabled={!canProceed}
              className="px-8"
            >
              Proceed to Analysis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
