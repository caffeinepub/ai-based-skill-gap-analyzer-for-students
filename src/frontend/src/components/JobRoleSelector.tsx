import { useState } from 'react';
import { useGetJobRoles } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase } from 'lucide-react';
import type { JobRole, SkillLevel } from '../backend';

interface JobRoleSelectorProps {
  onSelect: (role: JobRole | null) => void;
  disabled?: boolean;
}

export default function JobRoleSelector({ onSelect, disabled }: JobRoleSelectorProps) {
  const { data: jobRoles, isLoading, isFetched } = useGetJobRoles();
  const [selectedTitle, setSelectedTitle] = useState<string>('');

  const handleSelect = (title: string) => {
    setSelectedTitle(title);
    const role = jobRoles?.find(r => r.title === title);
    onSelect(role || null);
  };

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

  if (disabled) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Please upload your resume first
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-5 w-5 rounded-full mt-1" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isFetched && (!jobRoles || jobRoles.length === 0)) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No job roles available. Please contact an administrator.
      </div>
    );
  }

  return (
    <RadioGroup value={selectedTitle} onValueChange={handleSelect}>
      <div className="grid gap-4">
        {jobRoles?.map((role) => (
          <Card 
            key={role.title}
            className={`cursor-pointer transition-colors ${
              selectedTitle === role.title ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
            }`}
            onClick={() => handleSelect(role.title)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <RadioGroupItem value={role.title} id={role.title} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={role.title} className="cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-lg">{role.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {role.requiredSkills.length} required skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {role.requiredSkills.slice(0, 5).map((skill, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary" 
                          className={`text-xs ${getProficiencyBadgeVariant(skill.level)}`}
                        >
                          {skill.name} ({skill.level})
                        </Badge>
                      ))}
                      {role.requiredSkills.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.requiredSkills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </RadioGroup>
  );
}
