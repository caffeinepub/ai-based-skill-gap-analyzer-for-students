import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import AdminGuard from '../components/AdminGuard';
import JobRoleForm from '../components/JobRoleForm';
import { useGetJobRoles, useRemoveJobRole } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { JobRole, SkillLevel } from '../backend';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { data: jobRoles, isLoading } = useGetJobRoles();
  const removeJobRole = useRemoveJobRole();
  const [editingRole, setEditingRole] = useState<JobRole | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  const handleDeleteClick = (title: string) => {
    setRoleToDelete(title);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;
    
    try {
      await removeJobRole.mutateAsync(roleToDelete);
      toast.success('Job role deleted successfully');
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    } catch (error) {
      toast.error('Failed to delete job role');
      console.error('Delete error:', error);
    }
  };

  const handleEdit = (role: JobRole) => {
    setEditingRole(role);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRole(null);
  };

  const handleAddNewJobRole = () => {
    navigate({ to: '/admin/add-job-role' });
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

  return (
    <AdminGuard>
      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Panel</h1>
                <p className="text-muted-foreground">Manage job roles and required skills</p>
              </div>
            </div>
            <Button onClick={handleAddNewJobRole}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Job Role
            </Button>
          </div>

          {showForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{editingRole ? 'Edit Job Role' : 'Add New Job Role'}</CardTitle>
                <CardDescription>
                  {editingRole ? 'Update the job role details and required skills' : 'Create a new job role with required skills'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JobRoleForm 
                  existingRole={editingRole}
                  onSuccess={handleCloseForm}
                  onCancel={handleCloseForm}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Job Roles</CardTitle>
              <CardDescription>
                {jobRoles?.length || 0} job role(s) configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : jobRoles && jobRoles.length > 0 ? (
                <div className="space-y-4">
                  {jobRoles.map((role) => (
                    <div key={role.title} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{role.title}</h3>
                          {role.description && (
                            <p className="text-sm text-muted-foreground mt-1 mb-2">
                              {role.description}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {role.requiredSkills.length} required skill(s)
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(role)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(role.title)}
                            disabled={removeJobRole.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {role.requiredSkills.map((skill, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary"
                            className={getProficiencyBadgeVariant(skill.level)}
                          >
                            {skill.name} ({skill.level})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No job roles configured yet. Click "Add New Job Role" to create one.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the job role <span className="font-semibold text-foreground">"{roleToDelete}"</span>? 
              This action cannot be undone and will permanently remove the job role from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeJobRole.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={removeJobRole.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeJobRole.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminGuard>
  );
}
