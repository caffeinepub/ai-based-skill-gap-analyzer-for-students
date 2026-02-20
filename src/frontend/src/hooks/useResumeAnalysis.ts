import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { parseResumeWithAI } from '../services/aiResumeParser';
import { ExternalBlob } from '../backend';

interface ResumeAnalysisParams {
  file: File;
  onProgress?: (percentage: number) => void;
}

export function useResumeAnalysis() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, onProgress }: ResumeAnalysisParams) => {
      if (!actor) throw new Error('Actor not available');

      // Step 1: Parse resume with AI (0-50%)
      onProgress?.(10);
      const parsedData = await parseResumeWithAI(file);
      onProgress?.(50);

      // Step 2: Save extracted data to backend
      await actor.setResumeData(
        parsedData.name,
        parsedData.contactInfo,
        parsedData.skills,
        parsedData.workExperience,
        parsedData.education,
        parsedData.yearsOfExperience,
        parsedData.certifications
      );
      onProgress?.(70);

      // Step 3: Upload file blob
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        // Map blob upload progress to 70-100%
        onProgress?.(70 + (percentage * 0.3));
      });

      const fileId = `resume-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Note: We're not calling uploadResume here because we don't have the structured
      // skills/experience in the backend format yet. The resume data is stored separately.
      onProgress?.(100);

      return { fileId, parsedData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumeData'] });
      queryClient.invalidateQueries({ queryKey: ['callerResumes'] });
    },
  });
}
