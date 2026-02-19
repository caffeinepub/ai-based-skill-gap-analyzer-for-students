import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Recommendations</CardTitle>
          <CardDescription>
            Great job! You have all the required skills for this role.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Personalized Recommendations</CardTitle>
        <CardDescription className="text-base">
          Courses and projects to help you bridge your skill gaps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {recommendations.map((rec) => (
            <div key={rec.skill} className="border border-border rounded-lg p-6 bg-card">
              <h3 className="text-xl font-semibold text-foreground mb-4">{rec.skill}</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center mb-3">
                    <BookOpen className="w-5 h-5 text-primary mr-2" />
                    <h4 className="font-semibold text-foreground">Recommended Courses</h4>
                  </div>
                  <ul className="space-y-2">
                    {rec.courses.map((course, idx) => (
                      <li key={idx}>
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-primary hover:underline group"
                        >
                          <span className="font-medium">{course.title}</span>
                          <span className="text-sm text-muted-foreground ml-2">({course.provider})</span>
                          <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center mb-3">
                    <Code className="w-5 h-5 text-primary mr-2" />
                    <h4 className="font-semibold text-foreground">Practice Projects</h4>
                  </div>
                  <ul className="space-y-2">
                    {rec.projects.map((project, idx) => (
                      <li key={idx} className="text-muted-foreground">
                        <span className="font-medium text-foreground">{project.title}:</span> {project.description}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
