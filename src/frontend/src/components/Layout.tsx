import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import LoginButton from './LoginButton';
import { Menu, X, GraduationCap, BarChart3, Shield, Upload, FileCheck } from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = !!identity;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <GraduationCap className="h-7 w-7 text-primary" />
              <span className="hidden sm:inline">SkillGap Analyzer</span>
            </Link>
            
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/analyze"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  activeProps={{ className: 'text-primary' }}
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Analyze
                  </div>
                </Link>
                {isAdmin && (
                  <>
                    <Link
                      to="/admin"
                      className="text-sm font-medium transition-colors hover:text-primary"
                      activeProps={{ className: 'text-primary' }}
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin
                      </div>
                    </Link>
                    <Link
                      to="/admin/resume-upload"
                      className="text-sm font-medium transition-colors hover:text-primary"
                      activeProps={{ className: 'text-primary' }}
                    >
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Resume Upload
                      </div>
                    </Link>
                  </>
                )}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            <LoginButton />
            
            {isAuthenticated && (
              <button
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="md:hidden border-t border-border/40 bg-background">
            <nav className="container py-4 flex flex-col gap-3">
              <Link
                to="/analyze"
                className="flex items-center gap-2 text-sm font-medium py-2 transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BarChart3 className="h-4 w-4" />
                Analyze
              </Link>
              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 text-sm font-medium py-2 transition-colors hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                  <Link
                    to="/admin/resume-upload"
                    className="flex items-center gap-2 text-sm font-medium py-2 transition-colors hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Upload className="h-4 w-4" />
                    Resume Upload
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SkillGap Analyzer. All rights reserved.
            </div>
            <div className="text-sm text-muted-foreground">
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-foreground transition-colors"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
