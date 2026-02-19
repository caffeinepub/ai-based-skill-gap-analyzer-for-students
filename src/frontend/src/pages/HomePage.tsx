import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Target, TrendingUp, Award, BookOpen } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/assets/generated/hero-bg.dim_1920x1080.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        
        <div className="container relative py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Discover Your Skill Gaps,
              <span className="text-primary block mt-2">Unlock Your Potential</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              AI-powered resume analysis that identifies your skill gaps, compares them with industry requirements, 
              and provides personalized learning recommendations.
            </p>
            
            {isAuthenticated ? (
              <Button size="lg" onClick={() => navigate({ to: '/analyze' })} className="text-lg px-8">
                Start Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <div className="text-muted-foreground">
                Please login to start analyzing your skills
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Upload Resume</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your resume in PDF format for AI-powered analysis
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Select Job Role</h3>
                <p className="text-sm text-muted-foreground">
                  Choose your target job role from our curated list
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Get Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Receive detailed skill gap analysis with match percentage
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Learn & Grow</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized course recommendations to bridge gaps
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {isAuthenticated && (
        <section className="py-20">
          <div className="container">
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="py-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Analyze Your Skills?</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Take the first step towards your dream career. Upload your resume and discover 
                  what skills you need to succeed.
                </p>
                <Button size="lg" onClick={() => navigate({ to: '/analyze' })}>
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
