import { useNavigate } from '@tanstack/react-router';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import AdminGuard from '../components/AdminGuard';
import SkillTagDisplay from '../components/SkillTagDisplay';
import { useGetResumeData } from '../hooks/useQueries';
import { calculateResumeScore } from '../services/resumeScoring';
import { categorizeSkills } from '../services/skillExtraction';
import { useMemo } from 'react';

export default function ResumeResultsPage() {
  const navigate = useNavigate();
  const { data: resumeData, isLoading, error } = useGetResumeData();

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

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="container py-8 max-w-6xl">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
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
      </AdminGuard>
    );
  }

  if (error || !resumeData) {
    return (
      <AdminGuard>
        <div className="container py-8 max-w-6xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {error ? 'Failed to load resume data' : 'No resume data available'}
            </p>
            <Button onClick={() => navigate({ to: '/admin/resume-upload' })}>
              Upload Resume
            </Button>
          </div>
        </div>
      </AdminGuard>
    );
  }

  // Parse contact info for detailed display
  const contactParts = resumeData.contactInfo?.split('|').map(p => p.trim()) || [];
  const email = contactParts.find(p => p.includes('@'));
  const phone = contactParts.find(p => /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(p));
  const location = contactParts.find(p => !p.includes('@') && !/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(p));

  return (
    <AdminGuard>
      <div className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/admin/resume-upload' })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Upload
          </Button>
          <h1 className="text-4xl font-bold mb-2">Resume Analysis Results</h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive analysis of the uploaded resume
          </p>
        </div>

        <div className="space-y-6">
          {/* Resume Score Section */}
          {resumeScore && (
            <Card className="border-2 border-primary/20 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Resume Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Score */}
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 border-4 border-primary mb-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">{resumeScore.totalScore}</div>
                      <div className="text-sm text-muted-foreground">out of 100</div>
                    </div>
                  </div>
                  <p className="text-lg font-medium">
                    {resumeScore.totalScore >= 80
                      ? 'Excellent Resume!'
                      : resumeScore.totalScore >= 60
                      ? 'Good Resume'
                      : resumeScore.totalScore >= 40
                      ? 'Fair Resume'
                      : 'Needs Improvement'}
                  </p>
                </div>

                <Separator />

                {/* Category Breakdown */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Completeness */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Completeness</span>
                      <span className="text-sm text-muted-foreground">
                        {resumeScore.completenessScore}/25
                      </span>
                    </div>
                    <Progress value={(resumeScore.completenessScore / 25) * 100} className="h-2" />
                    <ul className="text-sm space-y-1 mt-2">
                      {resumeScore.feedback.completeness.map((item, idx) => (
                        <li key={idx} className="text-muted-foreground">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Content Quality */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Content Quality</span>
                      <span className="text-sm text-muted-foreground">
                        {resumeScore.contentQualityScore}/25
                      </span>
                    </div>
                    <Progress value={(resumeScore.contentQualityScore / 25) * 100} className="h-2" />
                    <ul className="text-sm space-y-1 mt-2">
                      {resumeScore.feedback.contentQuality.map((item, idx) => (
                        <li key={idx} className="text-muted-foreground">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Formatting */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Formatting</span>
                      <span className="text-sm text-muted-foreground">
                        {resumeScore.formattingScore}/25
                      </span>
                    </div>
                    <Progress value={(resumeScore.formattingScore / 25) * 100} className="h-2" />
                    <ul className="text-sm space-y-1 mt-2">
                      {resumeScore.feedback.formatting.map((item, idx) => (
                        <li key={idx} className="text-muted-foreground">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Skill Relevance */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Skill Relevance</span>
                      <span className="text-sm text-muted-foreground">
                        {resumeScore.skillRelevanceScore}/25
                      </span>
                    </div>
                    <Progress value={(resumeScore.skillRelevanceScore / 25) * 100} className="h-2" />
                    <ul className="text-sm space-y-1 mt-2">
                      {resumeScore.feedback.skillRelevance.map((item, idx) => (
                        <li key={idx} className="text-muted-foreground">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Professional Summary */}
          {resumeData.contactInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Professional Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Experienced professional with {Number(resumeData.yearsOfExperience)} years in the
                  industry, demonstrating expertise across multiple domains and technologies.
                </p>
              </CardContent>
            </Card>
          )}

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
                    <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                      <Award className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-medium">{cert}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Button onClick={() => navigate({ to: '/admin/resume-upload' })} size="lg">
              Upload Another Resume
            </Button>
            <Button
              onClick={() => navigate({ to: '/analyze' })}
              variant="outline"
              size="lg"
            >
              Analyze Against Job Roles
            </Button>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
