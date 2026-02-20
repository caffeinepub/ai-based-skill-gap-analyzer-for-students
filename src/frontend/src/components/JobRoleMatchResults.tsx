import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import type { JobRoleMatchResult } from '../services/skillMatching';

interface JobRoleMatchResultsProps {
  matches: JobRoleMatchResult[];
  onViewDetails: (match: JobRoleMatchResult) => void;
  isLoading?: boolean;
}

export default function JobRoleMatchResults({ matches, onViewDetails, isLoading }: JobRoleMatchResultsProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Analyzing your resume against job roles...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No job roles available for matching. Please contact an administrator.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Job Role Compatibility</h3>
        <p className="text-sm text-muted-foreground">
          Your resume has been analyzed against {matches.length} job role(s). Results are sorted by compatibility.
        </p>
      </div>

      <div className="grid gap-4">
        {matches.map((match, index) => (
          <Card key={match.jobRole.title} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl">{match.jobRole.title}</CardTitle>
                    {index === 0 && match.matchPercentage >= 70 && (
                      <Badge variant="default" className="bg-green-600">Best Match</Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {match.jobRole.description}
                  </CardDescription>
                </div>
                <div className="text-right ml-4">
                  <div className="text-3xl font-bold text-primary">
                    {match.matchPercentage}%
                  </div>
                  <div className="text-xs text-muted-foreground">Match</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Compatibility Score</span>
                    <span className="font-medium">
                      {match.matchingSkillsCount} of {match.totalSkillsCount} skills
                    </span>
                  </div>
                  <Progress value={match.matchPercentage} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">
                      {match.matchingSkillsCount} Matching Skills
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-orange-600" />
                    <span className="text-muted-foreground">
                      {match.missingSkills.length} Skills to Learn
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-wrap gap-1">
                    {match.matchingSkills.slice(0, 3).map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill.name}
                      </Badge>
                    ))}
                    {match.matchingSkills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{match.matchingSkills.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewDetails(match)}
                  >
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
