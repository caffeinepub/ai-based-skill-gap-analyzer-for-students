import { useNavigate } from '@tanstack/react-router';
import AdminGuard from '../components/AdminGuard';
import JobRoleForm from '../components/JobRoleForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AddJobRolePage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate({ to: '/admin' });
  };

  const handleCancel = () => {
    navigate({ to: '/admin' });
  };

  return (
    <AdminGuard>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/admin' })}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Panel
          </Button>

          <div className="flex items-center gap-3 mb-8">
            <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Add New Job Role</h1>
              <p className="text-muted-foreground">Create a new job role with required skills</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Job Role Details</CardTitle>
              <CardDescription>
                Fill in the job role information and specify the required skills with their proficiency levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobRoleForm 
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  );
}
