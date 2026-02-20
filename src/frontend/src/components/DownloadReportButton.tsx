import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { generateAnalysisReport, type AnalysisReportData } from '../services/pdfGenerator';
import { toast } from 'sonner';

interface DownloadReportButtonProps {
  analysisData: any;
}

export default function DownloadReportButton({ analysisData }: DownloadReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      // Prepare report data with all personalized information
      const reportData: AnalysisReportData = {
        jobRole: analysisData.jobRole,
        matchPercentage: analysisData.matchPercentage,
        matchingSkills: analysisData.matchingSkills,
        missingSkills: analysisData.missingSkills,
        recommendations: analysisData.recommendations,
        resumeContext: analysisData.resumeContext
      };
      
      await generateAnalysisReport(reportData);
      toast.success('Personalized report downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate report');
      console.error('PDF generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button onClick={handleDownload} disabled={isGenerating}>
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </>
      )}
    </Button>
  );
}
