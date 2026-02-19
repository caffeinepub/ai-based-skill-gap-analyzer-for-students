import React, { useState } from 'react';
import { useGetJobRoles } from '../hooks/useQueries';
import { JobRole } from '../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2 } from 'lucide-react';

interface JobRoleSelectorProps {
  onSelect: (role: JobRole) => void;
}

export default function JobRoleSelector({ onSelect }: JobRoleSelectorProps) {
  const { data: jobRoles, isLoading, isFetched } = useGetJobRoles();
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);

  const handleSelect = (role: JobRole) => {
    setSelectedRole(role);
  };

  const handleConfirm = () => {
    if (selectedRole) {
      onSelect(selectedRole);
    }
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  if (isFetched && (!jobRoles || jobRoles.length === 0)) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          No job roles available. Please contact an administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        {jobRoles?.map((role) => (
          <Card
            key={role.title}
            className={`cursor-pointer transition-all ${
              selectedRole?.title === role.title
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border hover:border-primary/50 hover:shadow-sm'
            }`}
            onClick={() => handleSelect(role)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold">{role.title}</CardTitle>
                {selectedRole?.title === role.title && (
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                )}
              </div>
              <CardDescription>{role.requiredSkills.length} required skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {role.requiredSkills.slice(0, 5).map((skill) => (
                  <Badge key={skill.name} variant="secondary" className="text-xs">
                    {skill.name}
                  </Badge>
                ))}
                {role.requiredSkills.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{role.requiredSkills.length - 5} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedRole && (
        <div className="flex justify-center pt-4">
          <Button onClick={handleConfirm} size="lg" className="font-semibold px-8">
            Continue with {selectedRole.title}
          </Button>
        </div>
      )}
    </div>
  );
}
