import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Target } from 'lucide-react';
import type { JobRole, Skill } from '../backend';
import type { GapAnalysisResult } from '../services/gapAnalysis';

interface SkillMatchGapDisplayProps {
  jobRole: JobRole;
  gapAnalysis: GapAnalysisResult;
}

export default function SkillMatchGapDisplay({ jobRole, gapAnalysis }: SkillMatchGapDisplayProps) {
  const { matchingSkills, missingSkills, insufficientProficiencySkills } = gapAnalysis;

  const technicalMatching = matchingSkills.filter(s => s.category === 'technical');
  const softMatching = matchingSkills.filter(s => s.category === 'softSkills');
  const technicalMissing = missingSkills.filter(s => s.category === 'technical');
  const softMissing = missingSkills.filter(s => s.category === 'softSkills');
  const technicalInsufficient = insufficientProficiencySkills.filter(s => s.category === 'technical');
  const softInsufficient = insufficientProficiencySkills.filter(s => s.category === 'softSkills');

  const getProficiencyBadge = (level: string) => {
    const colors = {
      beginner: 'bg-gray-500',
      intermediate: 'bg-amber-500',
      advanced: 'bg-green-600',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500';
  };

  const renderSkillBadge = (skill: Skill, status: 'match' | 'missing' | 'insufficient') => {
    const statusConfig = {
      match: { icon: CheckCircle2, color: 'border-green-600 bg-green-50 text-green-700' },
      missing: { icon: XCircle, color: 'border-red-600 bg-red-50 text-red-700' },
      insufficient: { icon: AlertTriangle, color: 'border-amber-600 bg-amber-50 text-amber-700' },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-2 p-2 rounded-lg border-2 ${config.color}`}>
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="font-medium text-sm">{skill.name}</span>
        <div className={`ml-auto w-2 h-2 rounded-full ${getProficiencyBadge(skill.level)}`} />
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Skill Match & Gap Analysis
        </CardTitle>
        <CardDescription>Comparing your skills with {jobRole.title} requirements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Matching Skills */}
        {matchingSkills.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-lg">Matching Skills ({matchingSkills.length})</h3>
            </div>

            {technicalMatching.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Technical Skills</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {technicalMatching.map((skill, idx) => (
                    <div key={idx}>{renderSkillBadge(skill, 'match')}</div>
                  ))}
                </div>
              </div>
            )}

            {softMatching.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Soft Skills</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {softMatching.map((skill, idx) => (
                    <div key={idx}>{renderSkillBadge(skill, 'match')}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Insufficient Proficiency Skills */}
        {insufficientProficiencySkills.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-lg">
                Skills Needing Improvement ({insufficientProficiencySkills.length})
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              You have these skills but need to improve proficiency level
            </p>

            {technicalInsufficient.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Technical Skills</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {technicalInsufficient.map((skill, idx) => (
                    <div key={idx}>{renderSkillBadge(skill, 'insufficient')}</div>
                  ))}
                </div>
              </div>
            )}

            {softInsufficient.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Soft Skills</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {softInsufficient.map((skill, idx) => (
                    <div key={idx}>{renderSkillBadge(skill, 'insufficient')}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Missing Skills */}
        {missingSkills.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-lg">Missing Skills ({missingSkills.length})</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Skills required for this role that are not present in your resume
            </p>

            {technicalMissing.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Technical Skills</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {technicalMissing.map((skill, idx) => (
                    <div key={idx}>{renderSkillBadge(skill, 'missing')}</div>
                  ))}
                </div>
              </div>
            )}

            {softMissing.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Soft Skills</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {softMissing.map((skill, idx) => (
                    <div key={idx}>{renderSkillBadge(skill, 'missing')}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{matchingSkills.length}</div>
              <div className="text-sm text-muted-foreground">Matching</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{insufficientProficiencySkills.length}</div>
              <div className="text-sm text-muted-foreground">Need Improvement</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{missingSkills.length}</div>
              <div className="text-sm text-muted-foreground">Missing</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
