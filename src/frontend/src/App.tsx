import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Layout from './components/Layout';
import ProfileSetupModal from './components/ProfileSetupModal';
import HomePage from './pages/HomePage';
import AnalysisFlow from './pages/AnalysisFlow';
import AnalysisDashboard from './pages/AnalysisDashboard';
import AdminPanel from './pages/AdminPanel';
import ResumeUploadPage from './pages/ResumeUploadPage';
import ResumeResultsPage from './pages/ResumeResultsPage';
import ComprehensiveResultPage from './pages/ComprehensiveResultPage';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  
  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Layout>
        <Outlet />
      </Layout>
      {showProfileSetup && <ProfileSetupModal />}
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const analyzeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analyze',
  component: AnalysisFlow,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: AnalysisDashboard,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPanel,
});

const resumeUploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/resume-upload',
  component: ResumeUploadPage,
});

const resumeResultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/resume-results',
  component: ResumeResultsPage,
});

const comprehensiveResultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/result/$documentId',
  component: ComprehensiveResultPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  analyzeRoute,
  dashboardRoute,
  adminRoute,
  resumeUploadRoute,
  resumeResultsRoute,
  comprehensiveResultRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
