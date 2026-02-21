import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Briefcase, GraduationCap, TrendingUp } from 'lucide-react';
import { useGetCallerResumes } from '../hooks/useQueries';
import { calculateResumeScore } from '../services/resumeScoring';
import type { ResumeData } from '../backend';

interface CompareResumesViewProps {
  resumeIds: string[];
}

export default function CompareResumesView({ resumeIds }: CompareResumesViewProps) {
  const { data: allResumes, isLoading } = useGetCallerResumes();

  const comparisonData = useMemo(() => {
    if (!allResumes) return [];

    return resumeIds
      .map(id => {
        const resume = allResumes.find(r => r.fileId === id);
        if (!resume) return null;

        const resumeData: ResumeData = {
          name: `Resume ${id.slice(0, 8)}`,
          contactInfo: resume.experiences?.[0]?.company || '',
          skills: resume.skills?.map(s => s.name) || [],
          workExperience: resume.experiences || [],
          education: resume.education || [],
          yearsOfExperience: BigInt(
            Math.floor((resume.experiences?.reduce((sum, exp) => sum + Number(exp.durationMonths), 0) || 0) / 12)
          ),
          certifications: resume.recommendations || [],
        };

        const score = calculateResumeScore(resumeData);

        return {
          id,
          resumeData,
          score,
          metrics: {
            overallScore: score.totalScore,
            experienceLevel: Number(resumeData.yearsOfExperience),
            educationCount: resumeData.education?.length || 0,
            skillCount: resumeData.skills?.length || 0,
            certificationsCount: resumeData.certifications?.length || 0,
          },
        };
      })
      .filter(Boolean);
  }, [allResumes, resumeIds]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumeIds.map(id => (
            <Card key={id}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (comparisonData.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No resumes available for comparison</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Resume Comparison</h2>
        <p className="text-muted-foreground">Side-by-side analysis of {comparisonData.length} resumes</p>
      </div>

      {/* Comparison Table */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comparisonData.map((data, idx) => (
          <Card key={data!.id} className="border-2">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-lg">Resume {idx + 1}</CardTitle>
              <p className="text-sm text-muted-foreground">{data!.resumeData.name}</p>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Overall Score */}
              <div className="text-center pb-4 border-b">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary mb-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{data!.metrics.overallScore}</div>
                  </div>
                </div>
                <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
              </div>

              {/* Metrics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Experience</span>
                  </div>
                  <span className="font-semibold">{data!.metrics.experienceLevel} years</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Education</span>
                  </div>
                  <span className="font-semibold">{data!.metrics.educationCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Skills</span>
                  </div>
                  <span className="font-semibold">{data!.metrics.skillCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Certifications</span>
                  </div>
                  <span className="font-semibold">{data!.metrics.certificationsCount}</span>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="pt-4 border-t space-y-2">
                <p className="text-sm font-medium mb-2">Score Breakdown</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Completeness:</span>
                    <span className="ml-1 font-semibold">{data!.score.completenessScore}/25</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Content:</span>
                    <span className="ml-1 font-semibold">{data!.score.contentQualityScore}/25</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Formatting:</span>
                    <span className="ml-1 font-semibold">{data!.score.formattingScore}/25</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Skills:</span>
                    <span className="ml-1 font-semibold">{data!.score.skillRelevanceScore}/25</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skill Overlap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Overlap Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisonData.map((data, idx) => (
              <div key={data!.id}>
                <p className="font-medium mb-2">Resume {idx + 1} Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {data!.resumeData.skills?.slice(0, 10).map((skill, sidx) => (
                    <span key={sidx} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                      {skill}
                    </span>
                  ))}
                  {data!.resumeData.skills && data!.resumeData.skills.length > 10 && (
                    <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                      +{data!.resumeData.skills.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
