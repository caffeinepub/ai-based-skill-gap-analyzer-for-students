import React, { useState } from 'react';
import { JobRole, Skill, SkillLevel, SkillCategory } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface JobRoleFormProps {
  initialData?: JobRole;
  onSubmit: (title: string, skills: Skill[]) => Promise<void>;
  onCancel: () => void;
}

export default function JobRoleForm({ initialData, onSubmit, onCancel }: JobRoleFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [skills, setSkills] = useState<Skill[]>(initialData?.requiredSkills || []);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>(SkillLevel.beginner);
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>(SkillCategory.technical);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSkill = () => {
    if (newSkillName.trim()) {
      const newSkill: Skill = {
        name: newSkillName.trim(),
        level: newSkillLevel,
        category: newSkillCategory,
      };
      setSkills([...skills, newSkill]);
      setNewSkillName('');
      setNewSkillLevel(SkillLevel.beginner);
      setNewSkillCategory(SkillCategory.technical);
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && skills.length > 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(title.trim(), skills);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title" className="text-sm font-medium">
          Job Role Title
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Senior Frontend Developer"
          required
          className="mt-1.5"
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">Required Skills</Label>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <Input
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Skill name"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              />
            </div>
            <Select value={newSkillLevel} onValueChange={(v) => setNewSkillLevel(v as SkillLevel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SkillLevel.beginner}>Beginner</SelectItem>
                <SelectItem value={SkillLevel.intermediate}>Intermediate</SelectItem>
                <SelectItem value={SkillLevel.advanced}>Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newSkillCategory} onValueChange={(v) => setNewSkillCategory(v as SkillCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SkillCategory.technical}>Technical</SelectItem>
                <SelectItem value={SkillCategory.softSkills}>Soft Skills</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="button" onClick={handleAddSkill} variant="outline" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Skill
          </Button>
        </div>

        {skills.length > 0 && (
          <div className="mt-4 space-y-2">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-foreground">{skill.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {skill.level}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {skill.category === SkillCategory.technical ? 'Technical' : 'Soft Skill'}
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSkill(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex space-x-3 pt-4">
        <Button type="submit" disabled={isSubmitting || !title.trim() || skills.length === 0} className="flex-1">
          {isSubmitting ? 'Saving...' : initialData ? 'Update Role' : 'Create Role'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
