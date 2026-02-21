import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ResumeScore } from '../services/resumeScoring';

interface ScoreBreakdownProps {
  score: ResumeScore;
}

export default function ScoreBreakdown({ score }: ScoreBreakdownProps) {
  const getScoreColor = (scoreValue: number, maxValue: number) => {
    const percentage = (scoreValue / maxValue) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (scoreValue: number, maxValue: number) => {
    const percentage = (scoreValue / maxValue) * 100;
    if (percentage >= 80) return 'bg-green-600';
    if (percentage >= 50) return 'bg-amber-600';
    return 'bg-red-600';
  };

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <TrendingUp className="h-6 w-6 text-primary" />
          Resume Score Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-36 h-36 rounded-full bg-primary/10 border-4 border-primary mb-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">{score.totalScore}</div>
              <div className="text-sm text-muted-foreground">out of 100</div>
            </div>
          </div>
          <p className="text-xl font-semibold">
            {score.totalScore >= 80
              ? '🎉 Excellent Resume!'
              : score.totalScore >= 60
              ? '👍 Good Resume'
              : score.totalScore >= 40
              ? '📝 Fair Resume'
              : '⚠️ Needs Improvement'}
          </p>
        </div>

        <Separator />

        {/* Category Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Completeness */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">Completeness</span>
              <span className={`text-lg font-bold ${getScoreColor(score.completenessScore, 25)}`}>
                {score.completenessScore}/25
              </span>
            </div>
            <Progress
              value={(score.completenessScore / 25) * 100}
              className="h-3"
            />
            <ul className="text-sm space-y-1.5 mt-3">
              {score.feedback.completeness.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  {item.startsWith('✓') ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-muted-foreground">{item.replace(/^[✓✗○]\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Content Quality */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">Content Quality</span>
              <span className={`text-lg font-bold ${getScoreColor(score.contentQualityScore, 25)}`}>
                {score.contentQualityScore}/25
              </span>
            </div>
            <Progress
              value={(score.contentQualityScore / 25) * 100}
              className="h-3"
            />
            <ul className="text-sm space-y-1.5 mt-3">
              {score.feedback.contentQuality.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  {item.startsWith('✓') ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-muted-foreground">{item.replace(/^[✓✗○]\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Formatting */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">Formatting</span>
              <span className={`text-lg font-bold ${getScoreColor(score.formattingScore, 25)}`}>
                {score.formattingScore}/25
              </span>
            </div>
            <Progress
              value={(score.formattingScore / 25) * 100}
              className="h-3"
            />
            <ul className="text-sm space-y-1.5 mt-3">
              {score.feedback.formatting.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  {item.startsWith('✓') ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-muted-foreground">{item.replace(/^[✓✗○]\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Skill Relevance */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">Skill Relevance</span>
              <span className={`text-lg font-bold ${getScoreColor(score.skillRelevanceScore, 25)}`}>
                {score.skillRelevanceScore}/25
              </span>
            </div>
            <Progress
              value={(score.skillRelevanceScore / 25) * 100}
              className="h-3"
            />
            <ul className="text-sm space-y-1.5 mt-3">
              {score.feedback.skillRelevance.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  {item.startsWith('✓') ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-muted-foreground">{item.replace(/^[✓✗○]\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
