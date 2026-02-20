import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Calendar, CheckCircle2, Trash2 } from 'lucide-react';
import { useGetCallerResumes, useDeleteResume } from '../hooks/useQueries';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import type { Resume } from '../backend';
import { toast } from 'sonner';

interface ResumeListProps {
  onSelect: (resume: Resume) => void;
  selectedResumeId?: string;
}

export default function ResumeList({ onSelect, selectedResumeId }: ResumeListProps) {
  const { data: resumes, isLoading, error, isFetched } = useGetCallerResumes();
  const deleteResumeMutation = useDeleteResume();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<Resume | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive text-sm">Failed to load resumes</p>
      </div>
    );
  }

  if (isFetched && (!resumes || resumes.length === 0)) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No resumes uploaded yet</p>
        <p className="text-muted-foreground text-xs mt-1">Upload your first resume to get started</p>
      </div>
    );
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteClick = (e: React.MouseEvent, resume: Resume) => {
    e.stopPropagation();
    setResumeToDelete(resume);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!resumeToDelete) return;

    try {
      await deleteResumeMutation.mutateAsync(resumeToDelete.fileId);
      toast.success('Resume deleted successfully');
      setDeleteDialogOpen(false);
      setResumeToDelete(null);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete resume');
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setResumeToDelete(null);
  };

  const getResumeName = (resume: Resume) => {
    return resume.fileId.split('_').slice(2).join('_') || 'Resume';
  };

  return (
    <>
      <div className="space-y-3">
        {resumes?.map((resume) => {
          const isSelected = selectedResumeId === resume.fileId;
          const skillCount = resume.skills?.length || 0;
          const expCount = resume.experiences?.length || 0;
          const eduCount = resume.education?.length || 0;

          return (
            <Card 
              key={resume.fileId}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => onSelect(resume)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`rounded-full p-2 ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    }`}>
                      {isSelected ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate mb-1">
                        {getResumeName(resume)}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(resume.uploadTimestamp)}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {skillCount} skill{skillCount !== 1 ? 's' : ''}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {expCount} experience{expCount !== 1 ? 's' : ''}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {eduCount} education
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <Button size="sm" variant="ghost" className="pointer-events-none">
                        Selected
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => handleDeleteClick(e, resume)}
                      disabled={deleteResumeMutation.isPending}
                      aria-label="Delete resume"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ConfirmDeleteDialog
        isOpen={deleteDialogOpen}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        resumeName={resumeToDelete ? getResumeName(resumeToDelete) : ''}
        isDeleting={deleteResumeMutation.isPending}
      />
    </>
  );
}
