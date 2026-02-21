import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, JobRole, Resume, ResumeData, Skill, WorkExperience, Education, ComparisonResult } from '../backend';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Admin Queries
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Job Role Queries
export function useGetJobRoles() {
  const { actor, isFetching } = useActor();

  return useQuery<JobRole[]>({
    queryKey: ['jobRoles'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getJobRoles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddJobRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, description, requiredSkills }: { title: string; description: string; requiredSkills: Skill[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addJobRole(title, description, requiredSkills);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobRoles'] });
      toast.success('Job role added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add job role');
    },
  });
}

export function useUpdateJobRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, description, requiredSkills }: { title: string; description: string; requiredSkills: Skill[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateJobRole(title, description, requiredSkills);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobRoles'] });
      toast.success('Job role updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update job role');
    },
  });
}

export function useRemoveJobRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeJobRole(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobRoles'] });
      toast.success('Job role removed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove job role');
    },
  });
}

// Resume Queries
export function useGetCallerResumes() {
  const { actor, isFetching } = useActor();

  return useQuery<Resume[]>({
    queryKey: ['resumes'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerResumes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetResume(documentId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Resume | null>({
    queryKey: ['resume', documentId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getResume(documentId);
    },
    enabled: !!actor && !isFetching && !!documentId,
  });
}

export function useUploadResume() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      blob,
      experiences,
      skills,
      education,
      recommendations,
    }: {
      documentId: string;
      blob: ExternalBlob;
      experiences: WorkExperience[];
      skills: Skill[];
      education: Education[];
      recommendations: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadResume(documentId, blob, experiences, skills, education, recommendations);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });
}

export function useDeleteResume() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteResume(documentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });
}

export function useGetResumeData() {
  const { actor, isFetching } = useActor();

  return useQuery<ResumeData | null>({
    queryKey: ['resumeData'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getResumeData();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateResumeData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedData: ResumeData) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateResumeData(updatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumeData'] });
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });
}
