import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, BookOpen, Code } from 'lucide-react';

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
        <CardContent className="py-12 text-center">
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
        <CardTitle>Personalized Learning Recommendations</CardTitle>
        <p className="text-sm text-muted-foreground">
          Tailored suggestions based on your skill gaps and experience level
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-lg">{rec.skill}</h3>
            
            {/* Courses */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-sm">Recommended Courses</h4>
              </div>
              <div className="space-y-2">
                {rec.courses.map((course, cidx) => (
                  <div key={cidx} className="flex items-center justify-between bg-secondary/20 rounded p-2">
                    <div>
                      <p className="text-sm font-medium">{course.title}</p>
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
            
            {/* Projects */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-sm">Practice Projects</h4>
              </div>
              <div className="space-y-2">
                {rec.projects.map((project, pidx) => (
                  <div key={pidx} className="bg-secondary/20 rounded p-2">
                    <p className="text-sm font-medium">{project.title}</p>
                    <p className="text-xs text-muted-foreground">{project.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
