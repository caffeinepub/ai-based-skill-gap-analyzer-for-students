import React, { useState } from 'react';
import { generateAnalysisReport } from '../services/pdfGenerator';
import { JobRole, Skill } from '../backend';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

interface MatchResult {
  percentage: number;
  matchingSkills: Skill[];
}

interface Recommendation {
  skill: string;
  courses: Array<{ title: string; url: string; provider: string }>;
  projects: Array<{ title: string; description: string }>;
}

interface DownloadReportButtonProps {
  jobRole: JobRole;
  matchResult: MatchResult;
  missingSkills: Skill[];
  recommendations: Recommendation[];
}

export default function DownloadReportButton({
  jobRole,
  matchResult,
  missingSkills,
  recommendations,
}: DownloadReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await generateAnalysisReport({
        jobRole,
        matchPercentage: matchResult.percentage,
        matchingSkills: matchResult.matchingSkills,
        missingSkills,
        recommendations,
      });
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button onClick={handleDownload} disabled={isGenerating} size="lg" className="font-semibold">
      {isGenerating ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Generating Report...
        </>
      ) : (
        <>
          <Download className="w-5 h-5 mr-2" />
          Download Report
        </>
      )}
    </Button>
  );
}
