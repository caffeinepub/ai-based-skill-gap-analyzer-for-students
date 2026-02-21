import { useState, useMemo } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Award,
  User,
  Mail,
  Calendar,
  FileText,
  MapPin,
  Phone,
  TrendingUp,
  Edit2,
  Download,
  Users,
  Save,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useGetResume, useGetCallerResumes, useUpdateResumeData } from '../hooks/useQueries';
import { calculateResumeScore } from '../services/resumeScoring';
import { categorizeSkills } from '../services/skillExtraction';
import { performGapAnalysis } from '../services/gapAnalysis';
import { generateRecommendations } from '../services/recommendationEngine';
import { generateAnalysisReport } from '../services/pdfGenerator';
import type { ResumeData, Resume, JobRole } from '../backend';
import ScoreBreakdown from '../components/ScoreBreakdown';
import SkillMatchGapDisplay from '../components/SkillMatchGapDisplay';
import RecommendationsDisplay from '../components/RecommendationsDisplay';
import CompareResumesView from '../components/CompareResumesView';
import SkillTagDisplay from '../components/SkillTagDisplay';

export default function ComprehensiveResultPage() {
  const navigate = useNavigate();
  const { documentId } = useParams({ from: '/result/$documentId' });
  const { identity } = useInternetIdentity();
  const { data: resume, isLoading: resumeLoading } = useGetResume(documentId);
  const { data: allResumes } = useGetCallerResumes();
  const updateResumeData = useUpdateResumeData();

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<ResumeData>>({});
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [selectedResumeIds, setSelectedResumeIds] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const isAuthenticated = !!identity;

  // Convert Resume to ResumeData format
  const resumeData = useMemo((): ResumeData | null => {
    if (!resume) return null;

    return {
      name: 'Resume Candidate',
      contactInfo: resume.experiences?.[0]?.company || 'Contact information',
      skills: resume.skills?.map(s => s.name) || [],
      workExperience: resume.experiences || [],
      education: resume.education || [],
      yearsOfExperience: BigInt(
        Math.floor((resume.experiences?.reduce((sum, exp) => sum + Number(exp.durationMonths), 0) || 0) / 12)
      ),
      certifications: resume.recommendations || [],
    };
  }, [resume]);

  const resumeScore = useMemo(() => {
    if (!resumeData) return null;
    return calculateResumeScore(resumeData);
  }, [resumeData]);

  const categorizedSkills = useMemo(() => {
    if (!resumeData || !resumeData.skills) {
      return { technical: [], soft: [], domain: [] };
    }
    return categorizeSkills(resumeData.skills, Number(resumeData.yearsOfExperience));
  }, [resumeData]);

  // Get job role from session storage (if navigated from analysis flow)
  const jobRole = useMemo((): JobRole | null => {
    try {
      const stored = sessionStorage.getItem('selectedJobRole');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // Perform gap analysis if job role is available
  const gapAnalysis = useMemo(() => {
    if (!resume || !jobRole || !resume.skills) return null;

    try {
      const parsedResumeData = {
        rawText: '',
        skills: resume.skills.map(s => s.name),
        experience: resume.experiences?.map(exp => ({
          title: exp.role,
          company: exp.company,
          duration: `${exp.durationMonths} months`,
          description: exp.role,
        })) || [],
        education: resume.education?.map(edu => ({
          degree: edu.degree,
          institution: edu.institution,
          year: edu.graduationYear.toString(),
        })) || [],
        certifications: resume.recommendations || [],
      };

      const extractedSkillsResult = {
        allSkills: resume.skills.map(s => s.name),
        technicalSkills: resume.skills.filter(s => s.category === 'technical').map(s => s.name),
        softSkills: resume.skills.filter(s => s.category === 'softSkills').map(s => s.name),
        experienceLevel: 'mid',
        totalYearsExperience: Math.floor((resume.experiences?.reduce((sum, exp) => sum + Number(exp.durationMonths), 0) || 0) / 12),
      };

      return performGapAnalysis(extractedSkillsResult, parsedResumeData, jobRole);
    } catch (error) {
      console.error('Gap analysis error:', error);
      return null;
    }
  }, [resume, jobRole]);

  // Generate recommendations
  const recommendations = useMemo(() => {
    if (!gapAnalysis || !gapAnalysis.missingSkills.length) return [];
    return generateRecommendations(gapAnalysis.missingSkills, gapAnalysis.resumeContext.experienceLevel);
  }, [gapAnalysis]);

  const handleEdit = () => {
    if (!resumeData) return;
    setEditedData(resumeData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedData.name || editedData.name.trim() === '') {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      await updateResumeData.mutateAsync(editedData as ResumeData);
      toast.success('Resume data updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update resume data');
      console.error('Update error:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({});
  };

  const handleDownloadReport = async () => {
    if (!resumeData || !resumeScore || !gapAnalysis || !jobRole) {
      toast.error('Missing data for report generation');
      return;
    }

    setIsDownloading(true);
    try {
      const reportData = {
        jobRole: {
          title: jobRole.title,
        },
        matchPercentage: Math.round((gapAnalysis.matchingSkills.length / (gapAnalysis.matchingSkills.length + gapAnalysis.missingSkills.length)) * 100),
        matchingSkills: gapAnalysis.matchingSkills.map(s => ({
          name: s.name,
          level: s.level,
          category: s.category,
        })),
        missingSkills: gapAnalysis.missingSkills.map(s => ({
          name: s.name,
          level: s.level,
          category: s.category,
        })),
        recommendations,
        resumeContext: gapAnalysis.resumeContext,
      };

      await generateAnalysisReport(reportData);
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate report');
      console.error('PDF generation error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCompareClick = () => {
    setShowCompareDialog(true);
  };

  const handleCompareConfirm = () => {
    if (selectedResumeIds.length < 2) {
      toast.error('Please select at least 2 resumes to compare');
      return;
    }
    setShowCompareDialog(false);
    setCompareMode(true);
  };

  const toggleResumeSelection = (resumeId: string) => {
    setSelectedResumeIds(prev =>
      prev.includes(resumeId) ? prev.filter(id => id !== resumeId) : [...prev, resumeId]
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Please login to view resume results.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resumeLoading) {
    return (
      <div className="container py-8 max-w-6xl">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!resume || !resumeData) {
    return (
      <div className="container py-8 max-w-6xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Resume not found</p>
          <Button onClick={() => navigate({ to: '/analyze' })}>Go to Analysis</Button>
        </div>
      </div>
    );
  }

  if (compareMode && selectedResumeIds.length >= 2) {
    return (
      <div className="container py-8 max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setCompareMode(false)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Individual View
          </Button>
        </div>
        <CompareResumesView resumeIds={selectedResumeIds} />
      </div>
    );
  }

  const contactParts = resumeData.contactInfo?.split('|').map(p => p.trim()) || [];
  const email = contactParts.find(p => p.includes('@'));
  const phone = contactParts.find(p => /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(p));
  const location = contactParts.find(p => !p.includes('@') && !/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(p));

  return (
    <div className="container py-8 max-w-6xl">
      {/* Header with Actions */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/analyze' })} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Analysis
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Comprehensive Resume Analysis</h1>
            <p className="text-muted-foreground text-lg">Detailed insights and recommendations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEdit} disabled={isEditing}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDownloadReport} 
              disabled={isDownloading || !jobRole || !gapAnalysis}
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? 'Generating...' : 'Download Report'}
            </Button>
            <Button variant="outline" onClick={handleCompareClick}>
              <Users className="mr-2 h-4 w-4" />
              Compare
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Score Breakdown */}
        {resumeScore && <ScoreBreakdown score={resumeScore} />}

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editedData.name || ''}
                    onChange={e => setEditedData({ ...editedData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contact">Contact Information</Label>
                  <Input
                    id="contact"
                    value={editedData.contactInfo || ''}
                    onChange={e => setEditedData({ ...editedData, contactInfo: e.target.value })}
                    placeholder="Email | Phone | Location"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={updateResumeData.isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Name</p>
                  <p className="font-semibold text-xl">{resumeData.name}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {email && (
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{email}</p>
                      </div>
                    </div>
                  )}
                  {phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{phone}</p>
                      </div>
                    </div>
                  )}
                  {location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{location}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="font-medium">{Number(resumeData.yearsOfExperience)} years</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Skills & Expertise
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resumeData.skills && resumeData.skills.length > 0 ? (
              <SkillTagDisplay
                technicalSkills={categorizedSkills.technical}
                softSkills={categorizedSkills.soft}
                domainSkills={categorizedSkills.domain}
              />
            ) : (
              <p className="text-sm text-muted-foreground">No skills data available</p>
            )}
          </CardContent>
        </Card>

        {/* Skill Match & Gap Analysis */}
        {jobRole && gapAnalysis && (
          <SkillMatchGapDisplay jobRole={jobRole} gapAnalysis={gapAnalysis} />
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && <RecommendationsDisplay recommendations={recommendations} />}

        {/* Work Experience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Work Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resumeData.workExperience && resumeData.workExperience.length > 0 ? (
              <div className="space-y-6">
                {resumeData.workExperience.map((exp, index) => (
                  <div key={index} className="relative pl-6 pb-6 border-l-2 border-primary last:pb-0">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-semibold text-lg">{exp.role}</h4>
                        <p className="text-primary font-medium">{exp.company}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {Number(exp.durationMonths)} months
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No work experience data available</p>
            )}
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resumeData.education && resumeData.education.length > 0 ? (
              <div className="space-y-4">
                {resumeData.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-secondary pl-4 py-2">
                    <h4 className="font-semibold text-lg">{edu.degree}</h4>
                    <p className="text-secondary font-medium">{edu.institution}</p>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Graduated: {Number(edu.graduationYear)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No education data available</p>
            )}
          </CardContent>
        </Card>

        {/* Certifications */}
        {resumeData.certifications && resumeData.certifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {resumeData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-secondary/20 rounded-lg">
                    <Award className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium">{cert}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Compare Dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Resumes to Compare</DialogTitle>
            <DialogDescription>Choose at least 2 resumes to compare side-by-side</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {allResumes && allResumes.length > 0 ? (
              allResumes.map(r => (
                <div
                  key={r.fileId}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-secondary/20 cursor-pointer"
                  onClick={() => toggleResumeSelection(r.fileId)}
                >
                  <Checkbox
                    checked={selectedResumeIds.includes(r.fileId)}
                    onCheckedChange={() => toggleResumeSelection(r.fileId)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">Resume {r.fileId.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {r.experiences?.length || 0} experiences • {r.skills?.length || 0} skills
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No other resumes available</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCompareDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompareConfirm} disabled={selectedResumeIds.length < 2}>
              Compare ({selectedResumeIds.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
