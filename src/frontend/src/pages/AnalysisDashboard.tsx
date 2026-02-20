import { useEffect, useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Briefcase, GraduationCap, Award, AlertCircle } from 'lucide-react';
import SkillMatchChart from '../components/SkillMatchChart';
import SkillCategoryChart from '../components/SkillCategoryChart';
import ProficiencyGapChart from '../components/ProficiencyGapChart';
import GapAnalysisResults from '../components/GapAnalysisResults';
import RecommendationsDisplay from '../components/RecommendationsDisplay';
import DownloadReportButton from '../components/DownloadReportButton';
import { calculateSkillMatch } from '../services/skillMatching';
import { performGapAnalysis } from '../services/gapAnalysis';
import { generateRecommendations } from '../services/recommendationEngine';
import type { JobRole } from '../backend';
import type { ParsedResumeData } from '../services/nlpService';
import type { ExtractedSkillsResult } from '../services/skillExtraction';
import { toast } from 'sonner';

export default function AnalysisDashboard() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const state = (routerState.location.state as any) || {};
  
  const [analysisData, setAnalysisData] = useState<any>(null);

  useEffect(() => {
    // Check if we have valid state data
    if (!state.jobRole || !state.extractedSkillsResult || !state.parsedResumeData) {
      // No valid data, redirect to analysis flow
      return;
    }

    const jobRole: JobRole = state.jobRole;
    const extractedSkillsResult: ExtractedSkillsResult = state.extractedSkillsResult;
    const parsedResumeData: ParsedResumeData = state.parsedResumeData;

    // Validate resume data before analysis
    if (!parsedResumeData.experience || parsedResumeData.experience.length === 0) {
      toast.error('Invalid resume: Missing work experience');
      navigate({ to: '/analyze' });
      return;
    }

    if (!extractedSkillsResult.technicalSkills || extractedSkillsResult.technicalSkills.length === 0) {
      toast.error('Invalid resume: Missing technical skills');
      navigate({ to: '/analyze' });
      return;
    }

    if (!parsedResumeData.education || parsedResumeData.education.length === 0) {
      toast.error('Invalid resume: Missing education');
      navigate({ to: '/analyze' });
      return;
    }

    // Perform comprehensive analysis
    const matchResult = calculateSkillMatch(extractedSkillsResult, jobRole);
    const gapAnalysis = performGapAnalysis(extractedSkillsResult, parsedResumeData, jobRole);
    const recommendations = generateRecommendations(
      gapAnalysis.missingSkills,
      gapAnalysis.resumeContext.experienceLevel
    );

    setAnalysisData({
      jobRole,
      extractedSkillsResult,
      parsedResumeData,
      matchPercentage: matchResult.percentage,
      matchingSkills: matchResult.matchingSkills,
      missingSkills: gapAnalysis.missingSkills,
      recommendations,
      resumeContext: gapAnalysis.resumeContext,
    });
  }, [state, navigate]);

  if (!analysisData) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No analysis data available. The resume may have been deleted or the session expired.
            </p>
            <Button onClick={() => navigate({ to: '/analyze' })}>
              Start New Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate({ to: '/analyze' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Analysis
          </Button>
          <DownloadReportButton analysisData={analysisData} />
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Skill Gap Analysis Results</h1>
          <p className="text-lg text-muted-foreground">
            Personalized analysis for <span className="font-semibold text-foreground">{analysisData.jobRole.title}</span>
          </p>
        </div>

        {/* Resume Context Summary */}
        {analysisData.resumeContext && (
          <Card className="mb-8 bg-gradient-to-br from-secondary/20 to-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Profile Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium">Experience Level</p>
                    <Badge variant="secondary" className="mt-1">
                      {analysisData.resumeContext.experienceLevel.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium">Years of Experience</p>
                    <p className="text-lg font-bold">{analysisData.resumeContext.totalYearsExperience}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium">Education Entries</p>
                    <p className="text-lg font-bold">{analysisData.resumeContext.education.length}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium">Certifications</p>
                    <p className="text-lg font-bold">{analysisData.resumeContext.certifications.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Match Percentage */}
        <Card className="mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="py-12 text-center">
            <div className="text-6xl font-bold text-primary mb-2">
              {analysisData.matchPercentage}%
            </div>
            <p className="text-lg text-muted-foreground">Skill Match</p>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <SkillMatchChart 
            matchingSkills={analysisData.matchingSkills.length}
            missingSkills={analysisData.missingSkills.length}
          />
          <SkillCategoryChart 
            matchingSkills={analysisData.matchingSkills}
            missingSkills={analysisData.missingSkills}
          />
          <ProficiencyGapChart 
            matchingSkills={analysisData.matchingSkills}
            missingSkills={analysisData.missingSkills}
          />
        </div>

        {/* Gap Analysis Results */}
        <GapAnalysisResults 
          matchingSkills={analysisData.matchingSkills}
          missingSkills={analysisData.missingSkills}
        />

        {/* Recommendations */}
        <RecommendationsDisplay recommendations={analysisData.recommendations} />
      </div>
    </div>
  );
}
