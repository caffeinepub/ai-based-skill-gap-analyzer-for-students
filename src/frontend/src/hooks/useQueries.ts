import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, JobRole, Resume, Skill } from '../backend';

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
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<JobRole[]>({
    queryKey: ['jobRoles'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getJobRoles();
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

export function useAddJobRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, requiredSkills }: { title: string; requiredSkills: Skill[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addJobRole(title, requiredSkills);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobRoles'] });
    },
  });
}

export function useUpdateJobRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, requiredSkills }: { title: string; requiredSkills: Skill[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateJobRole(title, requiredSkills);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobRoles'] });
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
    },
  });
}

// Resume Queries
export function useGetCallerResume() {
  const { actor, isFetching } = useActor();

  return useQuery<Resume | null>({
    queryKey: ['currentUserResume'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerResume();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadResume() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileId, blob }: { fileId: string; blob: any }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadResume(fileId, blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserResume'] });
    },
  });
}
