import React, { useState } from 'react';
import { useGetJobRoles, useAddJobRole, useUpdateJobRole, useRemoveJobRole } from '../hooks/useQueries';
import JobRoleForm from '../components/JobRoleForm';
import AdminGuard from '../components/AdminGuard';
import { JobRole, Skill } from '../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminPanel() {
  const { data: jobRoles, isLoading } = useGetJobRoles();
  const addJobRole = useAddJobRole();
  const updateJobRole = useUpdateJobRole();
  const removeJobRole = useRemoveJobRole();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<JobRole | null>(null);

  const handleAddRole = () => {
    setEditingRole(null);
    setIsFormOpen(true);
  };

  const handleEditRole = (role: JobRole) => {
    setEditingRole(role);
    setIsFormOpen(true);
  };

  const handleDeleteRole = async (title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await removeJobRole.mutateAsync(title);
    }
  };

  const handleSubmit = async (title: string, skills: Skill[]) => {
    if (editingRole) {
      await updateJobRole.mutateAsync({ title, requiredSkills: skills });
    } else {
      await addJobRole.mutateAsync({ title, requiredSkills: skills });
    }
    setIsFormOpen(false);
    setEditingRole(null);
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Admin Panel</h1>
              <p className="text-lg text-muted-foreground">Manage job roles and requirements</p>
            </div>
            <Button onClick={handleAddRole} size="lg" className="font-semibold">
              <Plus className="w-5 h-5 mr-2" />
              Add Job Role
            </Button>
          </div>

          {isFormOpen && (
            <Card className="mb-8 border-border">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  {editingRole ? 'Edit Job Role' : 'Add New Job Role'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <JobRoleForm
                  initialData={editingRole || undefined}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    setIsFormOpen(false);
                    setEditingRole(null);
                  }}
                />
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {jobRoles?.map((role) => (
                <Card key={role.title} className="border-border hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-semibold">{role.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {role.requiredSkills.length} required skills
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRole(role)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRole(role.title)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {role.requiredSkills.slice(0, 6).map((skill) => (
                        <Badge key={skill.name} variant="secondary">
                          {skill.name}
                        </Badge>
                      ))}
                      {role.requiredSkills.length > 6 && (
                        <Badge variant="outline">+{role.requiredSkills.length - 6} more</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
