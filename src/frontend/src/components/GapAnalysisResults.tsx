import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Skill } from '../backend';

interface GapAnalysisResultsProps {
  matchingSkills: Skill[];
  missingSkills: Skill[];
}

export default function GapAnalysisResults({ matchingSkills, missingSkills }: GapAnalysisResultsProps) {
  const technicalMatching = matchingSkills.filter(s => s.category === 'technical');
  const softSkillsMatching = matchingSkills.filter(s => s.category === 'softSkills');
  const technicalMissing = missingSkills.filter(s => s.category === 'technical');
  const softSkillsMissing = missingSkills.filter(s => s.category === 'softSkills');

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="border-green-500/20 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            Matching Skills ({matchingSkills.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {technicalMatching.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-sm">Technical Skills</h4>
              <div className="flex flex-wrap gap-2">
                {technicalMatching.map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-green-100 dark:bg-green-900/30">
                    {skill.name} ({skill.level})
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {softSkillsMatching.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-sm">Soft Skills</h4>
              <div className="flex flex-wrap gap-2">
                {softSkillsMatching.map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-green-100 dark:bg-green-900/30">
                    {skill.name} ({skill.level})
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {matchingSkills.length === 0 && (
            <p className="text-sm text-muted-foreground">No matching skills found</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Missing Skills ({missingSkills.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {technicalMissing.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-sm">Technical Skills</h4>
              <div className="flex flex-wrap gap-2">
                {technicalMissing.map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-red-100 dark:bg-red-900/30">
                    {skill.name} ({skill.level})
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {softSkillsMissing.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-sm">Soft Skills</h4>
              <div className="flex flex-wrap gap-2">
                {softSkillsMissing.map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-red-100 dark:bg-red-900/30">
                    {skill.name} ({skill.level})
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {missingSkills.length === 0 && (
            <p className="text-sm text-muted-foreground">No missing skills - perfect match!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
