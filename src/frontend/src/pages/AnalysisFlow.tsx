import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import ResumeUpload from '../components/ResumeUpload';
import JobRoleSelector from '../components/JobRoleSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function AnalysisFlow() {
  const [step, setStep] = useState<'upload' | 'select'>('upload');
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const navigate = useNavigate();

  const handleResumeUpload = () => {
    setResumeUploaded(true);
    setStep('select');
  };

  const handleJobRoleSelect = () => {
    navigate({ to: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  step === 'upload'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-success text-success-foreground'
                }`}
              >
                {resumeUploaded ? <CheckCircle2 className="w-6 h-6" /> : '1'}
              </div>
              <span className="ml-3 text-sm font-medium text-foreground">Upload Resume</span>
            </div>
            <div className="w-16 h-0.5 bg-border"></div>
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  step === 'select'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                2
              </div>
              <span className="ml-3 text-sm font-medium text-foreground">Select Job Role</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {step === 'upload' && (
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Upload Your Resume</CardTitle>
              <CardDescription className="text-base">
                Upload your resume in PDF format to begin the analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResumeUpload onUploadSuccess={handleResumeUpload} />
            </CardContent>
          </Card>
        )}

        {step === 'select' && (
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Select Target Job Role</CardTitle>
              <CardDescription className="text-base">
                Choose the job role you want to compare your skills against
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobRoleSelector onSelect={handleJobRoleSelect} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
