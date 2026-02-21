import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import ResumeUpload from '../components/ResumeUpload';
import ResumeList from '../components/ResumeList';
import JobRoleMatchResults from '../components/JobRoleMatchResults';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, List, Trash2, Target } from 'lucide-react';
import { useGetCallerResumes, useGetJobRoles, useDeleteResume } from '../hooks/useQueries';
import { calculateJobRoleMatches } from '../services/skillMatching';
import { toast } from 'sonner';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import type { Resume } from '../backend';
import type { ParsedResumeData } from '../services/nlpService';
import type { ExtractedSkillsResult } from '../services/skillExtraction';
import type { JobRoleMatchResult } from '../services/skillMatching';

export default function AnalysisFlow() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: resumes } = useGetCallerResumes();
  const { data: jobRoles, isLoading: jobRolesLoading } = useGetJobRoles();
  const deleteResume = useDeleteResume();
  
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [extractedSkillsResult, setExtractedSkillsResult] = useState<ExtractedSkillsResult | null>(null);
  const [parsedResumeData, setParsedResumeData] = useState<ParsedResumeData | null>(null);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [uploadTab, setUploadTab] = useState<'upload' | 'select'>('select');
  const [jobRoleMatches, setJobRoleMatches] = useState<JobRoleMatchResult[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (selectedResume && resumes) {
      const resumeStillExists = resumes.some(r => r.fileId === selectedResume.fileId);
      if (!resumeStillExists) {
        setSelectedResume(null);
        setResumeUploaded(false);
        setExtractedSkillsResult(null);
        setParsedResumeData(null);
        setJobRoleMatches([]);
      }
    }
  }, [resumes, selectedResume]);

  useEffect(() => {
    if (extractedSkillsResult && jobRoles && jobRoles.length > 0) {
      const matches = calculateJobRoleMatches(extractedSkillsResult, jobRoles);
      setJobRoleMatches(matches);
    }
  }, [extractedSkillsResult, jobRoles]);

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

  const handleResumeSelect = (resume: Resume) => {
    setSelectedResume(resume);
    
    const totalMonths = resume.experiences?.reduce((sum, exp) => sum + Number(exp.durationMonths), 0) || 0;
    const totalYears = Math.floor(totalMonths / 12);
    
    let experienceLevel = 'entry';
    if (totalYears >= 10) experienceLevel = 'expert';
    else if (totalYears >= 5) experienceLevel = 'senior';
    else if (totalYears >= 2) experienceLevel = 'mid';
    
    const parsedData: ParsedResumeData = {
      rawText: '',
      skills: resume.skills?.map(s => s.name) || [],
      experience: resume.experiences?.map(exp => ({
        title: exp.role,
        company: exp.company,
        duration: `${exp.durationMonths} months`,
        description: exp.role
      })) || [],
      education: resume.education?.map(edu => ({
        degree: edu.degree,
        institution: edu.institution,
        year: edu.graduationYear.toString()
      })) || [],
      certifications: []
    };

    const skillsResult: ExtractedSkillsResult = {
      allSkills: resume.skills?.map(s => s.name) || [],
      technicalSkills: resume.skills?.filter(s => s.category === 'technical').map(s => s.name) || [],
      softSkills: resume.skills?.filter(s => s.category === 'softSkills').map(s => s.name) || [],
      experienceLevel,
      totalYearsExperience: totalYears
    };

    setExtractedSkillsResult(skillsResult);
    setParsedResumeData(parsedData);
    setResumeUploaded(true);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedResume) return;

    try {
      await deleteResume.mutateAsync(selectedResume.fileId);
      toast.success('Resume deleted successfully');
      setShowDeleteDialog(false);
      setSelectedResume(null);
      setResumeUploaded(false);
      setExtractedSkillsResult(null);
      setParsedResumeData(null);
      setJobRoleMatches([]);
    } catch (error) {
      toast.error('Failed to delete resume');
      console.error('Delete error:', error);
    }
  };

  const handleViewDetails = (match: JobRoleMatchResult) => {
    if (parsedResumeData && extractedSkillsResult && selectedResume) {
      // Store job role in session storage for result page
      sessionStorage.setItem('selectedJobRole', JSON.stringify(match.jobRole));
      
      // Navigate to comprehensive result page
      navigate({ 
        to: '/result/$documentId',
        params: { documentId: selectedResume.fileId }
      });
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Skill Gap Analysis</h1>
          <p className="text-lg text-muted-foreground">
            Upload your resume to discover your skill compatibility with available job roles
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Step 1: Choose Your Resume</CardTitle>
                    <CardDescription>Select a previously uploaded resume or upload a new one</CardDescription>
                  </div>
                </div>
                {resumeUploaded && selectedResume && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteClick}
                    disabled={deleteResume.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Resume
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={uploadTab} onValueChange={(v) => setUploadTab(v as 'upload' | 'select')}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="select" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    My Resumes
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload New
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="select">
                  <ResumeList 
                    onSelect={handleResumeSelect}
                    selectedResumeId={selectedResume?.fileId}
                  />
                </TabsContent>
                
                <TabsContent value="upload">
                  <ResumeUpload 
                    onUploadSuccess={(skillsResult, resumeData) => {
                      setResumeUploaded(true);
                      setExtractedSkillsResult(skillsResult);
                      setParsedResumeData(resumeData);
                      setSelectedResume(null);
                    }}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {resumeUploaded && extractedSkillsResult && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Step 2: View Job Role Matches</CardTitle>
                    <CardDescription>See how your skills match with available job roles</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <JobRoleMatchResults
                  matches={jobRoleMatches}
                  onViewDetails={handleViewDetails}
                  isLoading={jobRolesLoading}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <ConfirmDeleteDialog
          isOpen={showDeleteDialog}
          onCancel={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteConfirm}
          resumeName={selectedResume?.fileId || 'this resume'}
          isDeleting={deleteResume.isPending}
        />
      </div>
    </div>
  );
}
