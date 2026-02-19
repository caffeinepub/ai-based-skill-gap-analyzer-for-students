import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function AccessDeniedScreen() {
  const navigate = useNavigate();

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="text-center max-w-md">
        <ShieldAlert className="h-20 w-20 text-destructive mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-8">
          You don't have permission to access this page. This area is restricted to administrators only.
        </p>
        <Button onClick={() => navigate({ to: '/' })}>
          Return to Home
        </Button>
      </div>
    </div>
  );
}
