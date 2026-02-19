import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, ExternalLink } from 'lucide-react';

interface Recommendation {
  skill: string;
  courses: Array<{ title: string; url: string; provider: string }>;
  projects: Array<{ title: string; description: string }>;
}

interface RecommendationsDisplayProps {
  recommendations: Recommendation[];
}

export default function RecommendationsDisplay({ recommendations }: RecommendationsDisplayProps) {
  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Great job! You have all the required skills for this role.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Personalized Learning Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="border-l-4 border-primary pl-4 space-y-3">
            <div>
              <Badge className="mb-2">{rec.skill}</Badge>
            </div>
            
            {rec.courses.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Recommended Courses</h4>
                <div className="space-y-2">
                  {rec.courses.map((course, cidx) => (
                    <div key={cidx} className="flex items-start justify-between gap-2 p-2 rounded bg-muted/50">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.provider}</p>
                      </div>
                      <Button size="sm" variant="ghost" asChild>
                        <a href={course.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {rec.projects.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Suggested Projects</h4>
                <div className="space-y-2">
                  {rec.projects.map((project, pidx) => (
                    <div key={pidx} className="p-2 rounded bg-muted/50">
                      <p className="font-medium text-sm">{project.title}</p>
                      <p className="text-xs text-muted-foreground">{project.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
