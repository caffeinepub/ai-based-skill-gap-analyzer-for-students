import { useEffect, useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SkillMatchChart from '../components/SkillMatchChart';
import SkillCategoryChart from '../components/SkillCategoryChart';
import ProficiencyGapChart from '../components/ProficiencyGapChart';
import GapAnalysisResults from '../components/GapAnalysisResults';
import RecommendationsDisplay from '../components/RecommendationsDisplay';
import DownloadReportButton from '../components/DownloadReportButton';
import { calculateSkillMatch } from '../services/skillMatching';
import { identifyMissingSkills } from '../services/gapAnalysis';
import { generateRecommendations } from '../services/recommendationEngine';
import type { JobRole } from '../backend';

export default function AnalysisDashboard() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const state = (routerState.location.state as any) || {};
  
  const [analysisData, setAnalysisData] = useState<any>(null);

  useEffect(() => {
    if (state.jobRole && state.extractedSkills) {
      const jobRole: JobRole = state.jobRole;
      const extractedSkills: string[] = state.extractedSkills;

      // Perform analysis
      const matchResult = calculateSkillMatch(extractedSkills, jobRole);
      const missingSkills = identifyMissingSkills(extractedSkills, jobRole);
      const recommendations = generateRecommendations(missingSkills);

      setAnalysisData({
        jobRole,
        extractedSkills,
        matchPercentage: matchResult.percentage,
        matchingSkills: matchResult.matchingSkills,
        missingSkills,
        recommendations,
      });
    }
  }, [state]);

  if (!analysisData) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No analysis data available.</p>
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
            Analysis for <span className="font-semibold text-foreground">{analysisData.jobRole.title}</span>
          </p>
        </div>

        {/* Match Percentage */}
        <Card className="mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="py-12 text-center">
            <div className="text-6xl font-bold text-primary mb-2">
              {analysisData.matchPercentage}%
            </div>
            <p className="text-lg text-muted-foreground">Overall Skill Match</p>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <SkillMatchChart 
            matchingSkills={analysisData.matchingSkills.length}
            missingSkills={analysisData.missingSkills.length}
          />
          <SkillCategoryChart 
            matchingSkills={analysisData.matchingSkills}
            missingSkills={analysisData.missingSkills}
          />
        </div>

        <div className="mb-8">
          <ProficiencyGapChart 
            matchingSkills={analysisData.matchingSkills}
            missingSkills={analysisData.missingSkills}
          />
        </div>

        {/* Gap Analysis */}
        <div className="mb-8">
          <GapAnalysisResults 
            matchingSkills={analysisData.matchingSkills}
            missingSkills={analysisData.missingSkills}
          />
        </div>

        {/* Recommendations */}
        <RecommendationsDisplay recommendations={analysisData.recommendations} />
      </div>
    </div>
  );
}
