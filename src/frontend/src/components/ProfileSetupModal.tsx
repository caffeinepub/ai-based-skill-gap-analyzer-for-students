import React, { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProfileSetupModalProps {
  isOpen: boolean;
}

export default function ProfileSetupModal({ isOpen }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      await saveProfile.mutateAsync({
        name: name.trim(),
        email: email.trim() || undefined,
        education: education.trim() || undefined,
        experience: experience.trim() || undefined,
      });
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome!</DialogTitle>
          <DialogDescription className="text-base">
            Please complete your profile to get started
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="education" className="text-sm font-medium">
              Education
            </Label>
            <Input
              id="education"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="Bachelor's in Computer Science"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="experience" className="text-sm font-medium">
              Experience
            </Label>
            <Input
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="3 years as Software Developer"
              className="mt-1.5"
            />
          </div>
          <Button type="submit" disabled={!name.trim() || saveProfile.isPending} className="w-full">
            {saveProfile.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
