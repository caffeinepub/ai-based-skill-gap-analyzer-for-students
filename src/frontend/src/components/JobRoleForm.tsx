import { useState, useEffect } from 'react';
import { useAddJobRole, useUpdateJobRole } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import type { JobRole, Skill, SkillLevel, SkillCategory } from '../backend';

interface JobRoleFormProps {
  existingRole?: JobRole | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function JobRoleForm({ existingRole, onSuccess, onCancel }: JobRoleFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<Skill[]>([]);
  
  const addJobRole = useAddJobRole();
  const updateJobRole = useUpdateJobRole();

  useEffect(() => {
    if (existingRole) {
      setTitle(existingRole.title);
      setDescription(existingRole.description || '');
      setSkills(existingRole.requiredSkills);
    }
  }, [existingRole]);

  const addSkill = () => {
    setSkills([...skills, { 
      name: '', 
      level: 'beginner' as SkillLevel, 
      category: 'technical' as SkillCategory 
    }]);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index: number, field: keyof Skill, value: any) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    setSkills(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a job title');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    if (skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    const invalidSkills = skills.filter(s => !s.name.trim());
    if (invalidSkills.length > 0) {
      toast.error('Please fill in all skill names');
      return;
    }

    try {
      if (existingRole) {
        await updateJobRole.mutateAsync({ title, description, requiredSkills: skills });
        toast.success('Job role updated successfully');
      } else {
        await addJobRole.mutateAsync({ title, description, requiredSkills: skills });
        toast.success('Job role added successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(existingRole ? 'Failed to update job role' : 'Failed to add job role');
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Job Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Data Analyst, Web Developer"
          disabled={!!existingRole}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Job Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the job role, responsibilities, and key requirements..."
          rows={4}
          required
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Required Skills *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addSkill}>
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </Button>
        </div>

        {skills.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
            No skills added yet. Click "Add Skill" to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {skills.map((skill, index) => (
              <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input
                    placeholder="Skill name"
                    value={skill.name}
                    onChange={(e) => updateSkill(index, 'name', e.target.value)}
                    required
                  />
                  <Select
                    value={skill.level}
                    onValueChange={(value) => updateSkill(index, 'level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={skill.category}
                    onValueChange={(value) => updateSkill(index, 'category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="softSkills">Soft Skills</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSkill(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={addJobRole.isPending || updateJobRole.isPending}
        >
          {existingRole ? 'Update' : 'Create'} Job Role
        </Button>
      </div>
    </form>
  );
}
