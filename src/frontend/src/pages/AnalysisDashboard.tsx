import React from 'react';
import { useGetCallerResume, useGetJobRoles } from '../hooks/useQueries';
import { extractSkills } from '../services/skillExtraction';
import { calculateSkillMatch } from '../services/skillMatching';
import { identifyMissingSkills } from '../services/gapAnalysis';
import { generateRecommendations } from '../services/recommendationEngine';
import SkillMatchChart from '../components/SkillMatchChart';
import SkillCategoryChart from '../components/SkillCategoryChart';
import ProficiencyGapChart from '../components/ProficiencyGapChart';
import GapAnalysisResults from '../components/GapAnalysisResults';
import RecommendationsDisplay from '../components/RecommendationsDisplay';
import DownloadReportButton from '../components/DownloadReportButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalysisDashboard() {
  const { data: resume, isLoading: resumeLoading } = useGetCallerResume();
  const { data: jobRoles, isLoading: jobRolesLoading } = useGetJobRoles();

  const isLoading = resumeLoading || jobRolesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!resume || !jobRoles || jobRoles.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">No Data Available</CardTitle>
              <CardDescription>
                Please upload a resume and ensure job roles are configured.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const selectedJobRole = jobRoles[0];
  const resumeSkills = extractSkills('Sample resume text with JavaScript, Python, React skills');
  const matchResult = calculateSkillMatch(resumeSkills, selectedJobRole);
  const missingSkills = identifyMissingSkills(resumeSkills, selectedJobRole);
  const recommendations = generateRecommendations(missingSkills);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Skill Gap Analysis
          </h1>
          <p className="text-lg text-muted-foreground">
            Analysis for <span className="font-semibold text-foreground">{selectedJobRole.title}</span>
          </p>
        </div>

        {/* Match Percentage Card */}
        <Card className="mb-8 border-border bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Overall Match</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-2">
                  {matchResult.percentage}%
                </div>
                <p className="text-base text-muted-foreground">
                  {matchResult.matchingSkills.length} of {selectedJobRole.requiredSkills.length}{' '}
                  skills matched
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Skill Match Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <SkillMatchChart
                matchingSkills={matchResult.matchingSkills.length}
                missingSkills={missingSkills.length}
              />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Skills by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <SkillCategoryChart
                matchingSkills={matchResult.matchingSkills}
                missingSkills={missingSkills}
              />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Proficiency Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ProficiencyGapChart
                matchingSkills={matchResult.matchingSkills}
                missingSkills={missingSkills}
              />
            </CardContent>
          </Card>
        </div>

        {/* Gap Analysis */}
        <div className="mb-8">
          <GapAnalysisResults
            matchingSkills={matchResult.matchingSkills}
            missingSkills={missingSkills}
          />
        </div>

        {/* Recommendations */}
        <div className="mb-8">
          <RecommendationsDisplay recommendations={recommendations} />
        </div>

        {/* Download Report */}
        <div className="flex justify-center">
          <DownloadReportButton
            jobRole={selectedJobRole}
            matchResult={matchResult}
            missingSkills={missingSkills}
            recommendations={recommendations}
          />
        </div>
      </div>
    </div>
  );
}
