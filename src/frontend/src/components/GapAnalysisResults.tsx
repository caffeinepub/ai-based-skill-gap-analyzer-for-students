import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { Skill, SkillLevel } from '../backend';

interface GapAnalysisResultsProps {
  matchingSkills: Skill[];
  missingSkills: Skill[];
  insufficientProficiencySkills?: Skill[];
}

export default function GapAnalysisResults({ 
  matchingSkills, 
  missingSkills,
  insufficientProficiencySkills = []
}: GapAnalysisResultsProps) {
  const technicalMatching = matchingSkills.filter(s => s.category === 'technical');
  const softSkillsMatching = matchingSkills.filter(s => s.category === 'softSkills');
  const technicalMissing = missingSkills.filter(s => s.category === 'technical');
  const softSkillsMissing = missingSkills.filter(s => s.category === 'softSkills');
  const technicalInsufficient = insufficientProficiencySkills.filter(s => s.category === 'technical');
  const softSkillsInsufficient = insufficientProficiencySkills.filter(s => s.category === 'softSkills');

  const getProficiencyBadgeVariant = (level: SkillLevel): string => {
    switch (level) {
      case 'beginner':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'intermediate':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'advanced':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      default:
        return '';
    }
  };

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
                  <Badge 
                    key={idx} 
                    variant="secondary" 
                    className={`${getProficiencyBadgeVariant(skill.level)} border`}
                  >
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
                  <Badge 
                    key={idx} 
                    variant="secondary" 
                    className={`${getProficiencyBadgeVariant(skill.level)} border`}
                  >
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

      <div className="space-y-6">
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
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className={`${getProficiencyBadgeVariant(skill.level)} border`}
                    >
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
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className={`${getProficiencyBadgeVariant(skill.level)} border`}
                    >
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

        {insufficientProficiencySkills.length > 0 && (
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5" />
                Insufficient Proficiency ({insufficientProficiencySkills.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {technicalInsufficient.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Technical Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {technicalInsufficient.map((skill, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className={`${getProficiencyBadgeVariant(skill.level)} border`}
                      >
                        {skill.name} (need {skill.level})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {softSkillsInsufficient.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Soft Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {softSkillsInsufficient.map((skill, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className={`${getProficiencyBadgeVariant(skill.level)} border`}
                      >
                        {skill.name} (need {skill.level})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
