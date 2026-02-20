import { Badge } from '@/components/ui/badge';
import type { Skill, SkillLevel } from '../backend';
import { Code, Users, Briefcase } from 'lucide-react';

interface SkillTagDisplayProps {
  technicalSkills: Skill[];
  softSkills: Skill[];
  domainSkills: Skill[];
}

export default function SkillTagDisplay({ technicalSkills, softSkills, domainSkills }: SkillTagDisplayProps) {
  const getProficiencyColor = (level: SkillLevel): string => {
    switch (level) {
      case 'advanced':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'intermediate':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-700';
      case 'beginner':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600';
    }
  };

  const getProficiencyDot = (level: SkillLevel): string => {
    switch (level) {
      case 'advanced':
        return 'bg-green-500';
      case 'intermediate':
        return 'bg-amber-500';
      case 'beginner':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const renderSkillCategory = (
    title: string,
    icon: React.ReactNode,
    skills: Skill[],
    categoryColor: string
  ) => {
    if (skills.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-lg">{title}</h3>
          <span className="text-sm text-muted-foreground">({skills.length})</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge
              key={index}
              variant="outline"
              className={`${getProficiencyColor(skill.level)} flex items-center gap-1.5 px-3 py-1`}
            >
              <span className={`w-2 h-2 rounded-full ${getProficiencyDot(skill.level)}`} />
              {skill.name}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderSkillCategory(
        'Technical Skills',
        <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
        technicalSkills,
        'blue'
      )}
      {renderSkillCategory(
        'Soft Skills',
        <Users className="h-5 w-5 text-green-600 dark:text-green-400" />,
        softSkills,
        'green'
      )}
      {renderSkillCategory(
        'Domain Skills',
        <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
        domainSkills,
        'purple'
      )}
    </div>
  );
}
