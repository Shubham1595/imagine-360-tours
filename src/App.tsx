import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSection } from './sections/HeroSection';
import { IntroSection } from './sections/IntroSection';
import { ServicesSection } from './sections/ServicesSection';
import { DigitalTwinViewer } from './sections/DigitalTwinViewer';
import { PortfolioSection } from './sections/PortfolioSection';
import { ProcessSection } from './sections/ProcessSection';
import { IndustriesSection } from './sections/IndustriesSection';
import { WhyImagineSection } from './sections/WhyImagineSection';
import { BookServiceSection } from './sections/BookServiceSection';
import { AboutSection } from './sections/AboutSection';
import { ContactSection } from './sections/ContactSection';
import { WorkDetailPage } from './pages/WorkDetailPage';
import { PrivacyPolicyModal, TermsModal, AccessibilityModal } from './components/LegalModals';
import { Project, PricingPlan } from './types';
import { PROJECTS } from './data/projects';

// Full Stack Platform Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { UserDashboard } from './pages/user/UserDashboard';
import { AdminLayout } from './pages/admin/AdminLayout';

function MainAppContent() {
  const { user, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [activeSection, setActiveSection] = useState('hero');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [prefilledProjectType, setPrefilledProjectType] = useState<string | undefined>(undefined);

  // Legal Modals state
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);

  const navigateTo = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      setCurrentPath(path);

      const match = path.match(/\/work\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        const found = PROJECTS.find(p => p.slug === match[1]);
        if (found) {
          setSelectedProject(found);
          window.scrollTo(0, 0);
          return;
        }
      } else {
        setSelectedProject(null);
      }

      const hash = window.location.hash.replace('#', '');
      if (hash && (path === '/' || path === '')) {
        scrollToSection(hash);
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (currentPath !== '/' && !currentPath.startsWith('/work')) {
      navigateTo(`/#${sectionId}`);
      return;
    }

    if (selectedProject) {
      setSelectedProject(null);
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setActiveSection(sectionId);
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    navigateTo(`/work/${project.slug}`);
  };

  const handleBackFromProject = () => {
    setSelectedProject(null);
    navigateTo('/#work');
    setTimeout(() => {
      const workEl = document.getElementById('work');
      if (workEl) {
        workEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleStartProjectWithCategory = (category?: string) => {
    if (category) {
      setPrefilledProjectType(category);
    }
    if (selectedProject) {
      setSelectedProject(null);
      navigateTo('/#contact');
    }
    setTimeout(() => {
      scrollToSection('contact');
    }, 50);
  };

  const handleBookPricingPlan = (plan: PricingPlan) => {
    setPrefilledProjectType(plan.name);
    scrollToSection('contact');
  };

  const handleLoginSuccess = (role: string) => {
    if (role === 'USER') {
      navigateTo('/client');
    } else {
      navigateTo('/admin');
    }
  };

  // Route 1: Auth - Login
  if (currentPath === '/login') {
    return (
      <LoginPage
        onNavigateHome={() => navigateTo('/')}
        onNavigateRegister={() => navigateTo('/register')}
        onNavigateForgotPassword={() => navigateTo('/forgot-password')}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Route 2: Auth - Register
  if (currentPath === '/register') {
    return (
      <RegisterPage
        onNavigateHome={() => navigateTo('/')}
        onNavigateLogin={() => navigateTo('/login')}
        onRegisterSuccess={handleLoginSuccess}
      />
    );
  }

  // Route 3: Auth - Forgot Password
  if (currentPath === '/forgot-password') {
    return (
      <ForgotPasswordPage
        onNavigateLogin={() => navigateTo('/login')}
      />
    );
  }

  // Route 4: Client Portal (/client or /dashboard)
  if (currentPath.startsWith('/dashboard') || currentPath.startsWith('/client')) {
    if (!user && !isLoading) {
      return (
        <LoginPage
          onNavigateHome={() => navigateTo('/')}
          onNavigateRegister={() => navigateTo('/register')}
          onNavigateForgotPassword={() => navigateTo('/forgot-password')}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    }
    return (
      <UserDashboard
        onNavigateHome={() => navigateTo('/')}
      />
    );
  }

  // Route 5: Admin Panel & Sales CRM (/admin)
  if (currentPath.startsWith('/admin')) {
    if (!user && !isLoading) {
      return (
        <LoginPage
          onNavigateHome={() => navigateTo('/')}
          onNavigateRegister={() => navigateTo('/register')}
          onNavigateForgotPassword={() => navigateTo('/forgot-password')}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    }

    // Role Guard: Client users attempting to access /admin receive 403 Access Denied
    if (user && user.role === 'USER') {
      return (
        <div className="min-h-screen bg-[#07090C] text-white flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#101419] p-8 rounded-2xl border border-red-500/30 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto text-xl font-bold font-mono">
              403
            </div>
            <h2 className="text-xl font-heading font-bold text-white">Access Denied</h2>
            <p className="text-xs text-[#9BA3AE] font-mono leading-relaxed">
              Your account has Client permissions and does not have administrative access to the CRM and Internal Management Portal.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigateTo('/client')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#00F2FE] hover:bg-[#00F2FE]/90 text-black font-semibold text-xs transition-colors cursor-pointer"
              >
                Go to Client Portal
              </button>
              <button
                onClick={() => navigateTo('/')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10 transition-colors cursor-pointer"
              >
                Return to Website
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <AdminLayout
        onNavigateHome={() => navigateTo('/')}
      />
    );
  }

  // Route 6: Case Study View (/work/:slug)
  if (selectedProject) {
    return (
      <div className="min-h-screen bg-[#07090C] text-white flex flex-col selection:bg-[#00F2FE]/20 selection:text-[#00F2FE]">
        <Navbar
          onNavigate={scrollToSection}
          activeSection={activeSection}
          onOpenBookModal={() => scrollToSection('pricing')}
          onNavigateToAuth={navigateTo}
        />
        <main className="flex-1">
          <WorkDetailPage
            project={selectedProject}
            onBack={handleBackFromProject}
            onStartProject={handleStartProjectWithCategory}
          />
        </main>
        <Footer
          onNavigate={scrollToSection}
          onOpenPrivacy={() => setPrivacyOpen(true)}
          onOpenTerms={() => setTermsOpen(true)}
          onOpenAccessibility={() => setAccessibilityOpen(true)}
        />
      </div>
    );
  }

  // Route 7: 404 Not Found Catch-All
  const isKnownPublicPath =
    currentPath === '/' ||
    currentPath === '' ||
    currentPath.startsWith('/#') ||
    currentPath.startsWith('/work');

  if (!isKnownPublicPath) {
    return (
      <div className="min-h-screen bg-[#07090C] text-white flex flex-col items-center justify-center p-6 selection:bg-[#00F2FE]/20 selection:text-[#00F2FE]">
        <div className="max-w-md w-full bg-[#101419] p-8 rounded-2xl border border-white/10 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 text-[#00F2FE] flex items-center justify-center mx-auto text-2xl font-bold font-mono">
            404
          </div>
          <h2 className="text-2xl font-heading font-bold text-white tracking-tight">Page Not Found</h2>
          <p className="text-xs text-[#9BA3AE] font-mono leading-relaxed">
            The page you are looking for does not exist, has been moved, or the link is expired.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigateTo('/')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-black font-semibold text-xs shadow-lg shadow-[#00F2FE]/10 hover:opacity-95 transition-all cursor-pointer"
            >
              Return to Homepage
            </button>
            <button
              onClick={() => navigateTo('/login')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10 transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default Route: Approved Cinematic Marketing Landing Page
  return (
    <div className="min-h-screen bg-[#07090C] text-white flex flex-col selection:bg-[#00F2FE]/20 selection:text-[#00F2FE]">
      {/* Top Sticky Navbar */}
      <Navbar
        onNavigate={scrollToSection}
        activeSection={activeSection}
        onOpenBookModal={() => scrollToSection('pricing')}
        onNavigateToAuth={navigateTo}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Section 1: Cinematic Hero */}
        <HeroSection
          onExploreWork={() => scrollToSection('work')}
          onStartProject={() => scrollToSection('contact')}
        />

        {/* Section 2: Introduction */}
        <IntroSection />

        {/* Section 3: What We Create (Services) */}
        <ServicesSection
          onSelectServiceForBooking={(name) => {
            setPrefilledProjectType(name);
            scrollToSection('contact');
          }}
        />

        {/* Section 4: Immersive Experience (Three.js 3D Digital Twin Viewer) */}
        <DigitalTwinViewer />

        {/* Section 5: Selected Work (Portfolio) */}
        <PortfolioSection
          onSelectProject={handleSelectProject}
        />

        {/* Section 6: From Reality to Digital (Process) */}
        <ProcessSection />

        {/* Section 7: Built for Real-World Spaces (Industries) */}
        <IndustriesSection
          onStartProjectForIndustry={(industryName) => {
            setPrefilledProjectType(`Industry: ${industryName}`);
            scrollToSection('contact');
          }}
        />

        {/* Section 8: Why Imagine 360 */}
        <WhyImagineSection
          onStartProject={() => scrollToSection('contact')}
        />

        {/* Section 9: Book a Service (Pricing Engine) */}
        <BookServiceSection
          onBookNow={handleBookPricingPlan}
        />

        {/* Section 10: About Imagine 360 */}
        <AboutSection />

        {/* Section 11: Contact */}
        <ContactSection
          initialProjectType={prefilledProjectType}
        />
      </main>

      {/* Footer */}
      <Footer
        onNavigate={scrollToSection}
        onOpenPrivacy={() => setPrivacyOpen(true)}
        onOpenTerms={() => setTermsOpen(true)}
        onOpenAccessibility={() => setAccessibilityOpen(true)}
      />

      {/* Legal Modals */}
      <PrivacyPolicyModal
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
      />
      <TermsModal
        isOpen={termsOpen}
        onClose={() => setTermsOpen(false)}
      />
      <AccessibilityModal
        isOpen={accessibilityOpen}
        onClose={() => setAccessibilityOpen(false)}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
