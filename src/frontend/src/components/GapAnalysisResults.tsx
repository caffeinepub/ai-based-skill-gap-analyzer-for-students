import React from 'react';
import { Skill } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';

interface GapAnalysisResultsProps {
  matchingSkills: Skill[];
  missingSkills: Skill[];
}

export default function GapAnalysisResults({ matchingSkills, missingSkills }: GapAnalysisResultsProps) {
  const renderSkillBadge = (skill: Skill, isMatching: boolean) => (
    <div key={skill.name} className="flex items-center space-x-2 p-3 rounded-lg bg-muted/50 border border-border">
      {isMatching ? (
        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{skill.name}</p>
        <div className="flex items-center space-x-2 mt-1">
          <Badge variant="outline" className="text-xs">
            {skill.level}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {skill.category === 'technical' ? 'Technical' : 'Soft Skill'}
          </Badge>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center">
            <CheckCircle2 className="w-6 h-6 text-success mr-2" />
            Matching Skills ({matchingSkills.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {matchingSkills.length > 0 ? (
              matchingSkills.map((skill) => renderSkillBadge(skill, true))
            ) : (
              <p className="text-muted-foreground text-center py-8">No matching skills found</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center">
            <XCircle className="w-6 h-6 text-destructive mr-2" />
            Missing Skills ({missingSkills.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {missingSkills.length > 0 ? (
              missingSkills.map((skill) => renderSkillBadge(skill, false))
            ) : (
              <p className="text-success text-center py-8 font-medium">
                Congratulations! You have all required skills.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
