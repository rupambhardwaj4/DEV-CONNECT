import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Button, Card, CardContent, Badge, Avatar, Logo,
} from '../components/common';
import { Footer } from '../components/layout';
import {
  Users, Briefcase, Code2, Sparkles, ArrowRight,
  CheckCircle2, Star, GitBranch, Zap, Globe,
  TrendingUp, Shield, ChevronDown, Menu, X,
  Play,
} from 'lucide-react';
import { useTheme } from '../context';

/* ── Static Data ───────────────────────────────────────────── */
const sampleDevelopers = [
  {
    name: 'Sarah Chen',
    role: 'Full Stack Developer',
    location: 'San Francisco, CA',
    skills: ['React', 'Node.js', 'TypeScript'],
    avatar: 'SC',
    stars: 142,
    repos: 38,
    color: '#6366f1',
  },
  {
    name: 'Alex Johnson',
    role: 'Frontend Engineer',
    location: 'Berlin, Germany',
    skills: ['Vue.js', 'GraphQL', 'Figma'],
    avatar: 'AJ',
    stars: 218,
    repos: 52,
    color: '#8b5cf6',
  },
  {
    name: 'Maria Garcia',
    role: 'Backend Developer',
    location: 'London, UK',
    skills: ['Python', 'Django', 'Postgres'],
    avatar: 'MG',
    stars: 97,
    repos: 29,
    color: '#06b6d4',
  },
];

const features = [
  {
    icon: Users,
    title: 'Developer Networking',
    description:
      'Build real professional relationships with developers across the globe. Discover peers who share your stack and ambitions.',
    color: '#6366f1',
  },
  {
    icon: Code2,
    title: 'Project Showcase',
    description:
      'Link your GitHub, highlight your best work, and let your code speak for itself in front of recruiters and collaborators.',
    color: '#8b5cf6',
  },
  {
    icon: Briefcase,
    title: 'Smart Job Discovery',
    description:
      'Get personalized job matches based on your skills, experience, and preferences — not just keyword searches.',
    color: '#06b6d4',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Matching',
    description:
      'Our intelligent recommendation engine surfaces the right opportunities and collaborators at the right time.',
    color: '#f43f5e',
  },
  {
    icon: Shield,
    title: 'Verified Profiles',
    description:
      'Trust the profiles you see. Our verification system ensures authentic developer identities and honest portfolios.',
    color: '#10b981',
  },
  {
    icon: TrendingUp,
    title: 'Career Analytics',
    description:
      'Track your profile views, connection growth, and application pipeline with insightful, real-time analytics.',
    color: '#f59e0b',
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'Build Your Profile',
    description:
      'Add your skills, experience, and GitHub projects. Tell your story the way you want developers and hiring teams to see it.',
  },
  {
    step: '02',
    title: 'Showcase Your Work',
    description:
      'Pin your best repositories, write project descriptions, and get automatically ranked by our quality signals.',
  },
  {
    step: '03',
    title: 'Connect & Grow',
    description:
      'Follow developers, request connections, and discover opportunities curated specifically for your unique profile.',
  },
];

const testimonials = [
  {
    quote: "DevConnect helped me land my dream job at a startup I'd never have discovered otherwise. The matching is genuinely impressive.",
    name: 'James Park',
    role: 'Senior React Developer',
    avatar: 'JP',
  },
  {
    quote: "I built my whole professional network on DevConnect. It's the first platform where developers actually feel at home.",
    name: 'Priya Nair',
    role: 'Backend Engineer at Stripe',
    avatar: 'PN',
  },
  {
    quote: "The project showcase feature alone is worth it. My GitHub profile never looked this good to recruiters before.",
    name: 'Lucas Müller',
    role: 'Open Source Contributor',
    avatar: 'LM',
  },
];

/* ── Component ──────────────────────────────────────────────── */
export function Landing() {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div className="landing-shell min-h-screen bg-[var(--color-background)]">

      {/* ══════════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════════ */}
      <header
        className="landing-header sticky top-0 z-[var(--z-index-sticky)] border-b border-[var(--color-border)] transition-all duration-300"
        style={{
          boxShadow: scrolled ? '0 2px 20px rgb(0 0 0 / .07)' : 'none',
        }}
      >
        <div className="container">
          <div className="flex items-center justify-between h-16">

            <Link to="/">
              <Logo size="md" />
            </Link>

            <nav className="landing-nav hidden md:flex items-center gap-7">
              {['Developers', 'Projects', 'Jobs'].map((name) => (
                <Link
                  key={name}
                  to={`/${name.toLowerCase()}`}
                  className="text-sm"
                >
                  {name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="hidden md:flex p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light'
                  ? <span className="text-base">🌙</span>
                  : <span className="text-base">☀️</span>
                }
              </button>
              <Link to="/login">
                <Button variant="ghost" size="md" className="hidden sm:inline-flex">
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="md"
                  className="hero-cta-primary"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Get started free
                </Button>
              </Link>
              <button
                className="md:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] transition-colors ml-1"
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4 pt-2 border-t border-[var(--color-border)] animate-fade-up">
              <div className="flex flex-col gap-1">
                {['Developers', 'Projects', 'Jobs'].map((name) => (
                  <Link
                    key={name}
                    to={`/${name.toLowerCase()}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    {name}
                  </Link>
                ))}
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" size="md" fullWidth className="mt-2">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button size="md" fullWidth className="hero-cta-primary mt-1">
                    Get started free
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-copy mx-auto text-center">

            {/* Eyebrow */}
            <div className="hero-eyebrow mb-7 animate-fade-up">
              <Sparkles className="h-3 w-3" />
              The developer network that actually works
            </div>

            {/* Headline */}
            <h1 className="hero-title font-extrabold text-[var(--color-text-primary)] mb-7 animate-fade-up" style={{ animationDelay: '0.07s' }}>
              Where great code meets{' '}
              <span className="gradient-text">real opportunity.</span>
            </h1>

            {/* Sub */}
            <p className="hero-description mb-9 mx-auto animate-fade-up" style={{ animationDelay: '0.13s' }}>
              Build your developer identity, showcase what you've built, connect with people worth knowing, and land the role that fits your ambition — all in one place.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-9 animate-fade-up" style={{ animationDelay: '0.18s' }}>
              <Link to="/register">
                <Button
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="hero-cta-primary w-full sm:w-auto px-8"
                >
                  Create your profile — it's free
                </Button>
              </Link>
              <Link to="/developers">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto gap-2"
                >
                  <Globe className="h-4 w-4" />
                  Explore the community
                </Button>
              </Link>
            </div>

            {/* Trust signals */}
            <div className="hero-trust animate-fade-up" style={{ animationDelay: '0.22s' }}>
              {[
                { icon: CheckCircle2, text: 'Free forever plan' },
                { icon: Shield, text: 'No spam, ever' },
                { icon: Zap, text: 'Set up in 3 minutes' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="hero-trust-item">
                  <Icon className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          DEVELOPER PREVIEW CARDS
      ══════════════════════════════════════════════════════ */}
      <section className="preview-section">
        <div className="container">
          <div className="text-center mb-12">
            <div className="section-kicker mb-3">Community spotlight</div>
            <h2 className="text-3xl md:text-[2.5rem] font-bold text-[var(--color-text-primary)] mb-4 leading-tight">
              Meet your future teammates.
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
              Thousands of talented developers are already here, ready to connect and collaborate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-children">
            {sampleDevelopers.map((dev) => (
              <div key={dev.name} className="developer-preview p-5 animate-fade-up">
                {/* Top accent dot */}
                <div className="flex items-start justify-between mb-4">
                  <Avatar size="lg" fallback={dev.avatar} />
                  <span className="preview-stat-badge">
                    <Star className="h-3 w-3" /> {dev.stars}
                  </span>
                </div>
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-0.5">
                  {dev.name}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-1">{dev.role}</p>
                <p className="text-xs text-[var(--color-text-tertiary)] mb-3 flex items-center gap-1">
                  <Globe className="h-3 w-3" />{dev.location}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {dev.skills.map((s) => (
                    <Badge key={s} variant="outline" size="sm">
                      {s}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--color-text-tertiary)]">
                  <span className="flex items-center gap-1">
                    <GitBranch className="h-3 w-3" />{dev.repos} repos
                  </span>
                  <Button size="sm" variant="outline">Connect</Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/developers">
              <Button variant="ghost" size="md" icon={ArrowRight} iconPosition="right">
                Browse all developers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════════ */}
      <section className="feature-section">
        <div className="container relative">
          <div className="text-center mb-14">
            <div className="section-kicker mb-3">Everything you need</div>
            <h2 className="text-3xl md:text-[2.5rem] font-bold text-[var(--color-text-primary)] mb-4 leading-tight">
              Built specifically for developers.
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Every feature on DevConnect is designed around how developers actually think, work, and grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="feature-card animate-fade-up">
                  <div
                    className="feature-icon"
                    style={{ '--feature-color': feature.color }}
                  >
                    <Icon
                      className="h-5.5 w-5.5"
                      style={{ color: feature.color }}
                    />
                  </div>
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════ */}
      <section className="steps-section">
        <div className="container relative">
          <div className="text-center mb-14">
            <div className="section-kicker mb-3">Simple by design</div>
            <h2 className="text-3xl md:text-[2.5rem] font-bold text-[var(--color-text-primary)] mb-4 leading-tight">
              Up and running in minutes.
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
              No lengthy onboarding. No confusing setup. Just your profile, your projects, and your next opportunity.
            </p>
          </div>

          <div className="steps-grid grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            {howItWorks.map((step) => (
              <div key={step.step} className="step-card animate-fade-up">
                <div className="step-number">{step.step}</div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════ */}
      <section
        className="py-24"
        style={{ background: 'var(--color-surface)' }}
      >
        <div className="container">
          <div className="text-center mb-14">
            <div className="section-kicker mb-3">Social proof</div>
            <h2 className="text-3xl md:text-[2.5rem] font-bold text-[var(--color-text-primary)] mb-4 leading-tight">
              Developers love DevConnect.
            </h2>
            <div className="flex items-center justify-center gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-[var(--color-amber)] text-[var(--color-amber)]" />
              ))}
            </div>
            <p className="text-sm text-[var(--color-text-tertiary)]">4.9 / 5 from 2,400+ reviews</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-children">
            {testimonials.map((t) => (
              <div key={t.name} className="testimonial-card animate-fade-up">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[var(--color-amber)] text-[var(--color-amber)]" />
                  ))}
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-5 italic">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <Avatar size="sm" fallback={t.avatar} />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{t.name}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════ */}
      <section className="cta-section">
        <div className="container">
          <Card className="cta-card max-w-4xl mx-auto">
            <CardContent className="py-16 px-6 md:px-14 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-bold tracking-widest uppercase mb-6">
                <Sparkles className="h-3 w-3" />
                Join the community
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-5 leading-tight">
                Your next chapter starts here.
              </h2>
              <p className="text-lg text-white/85 mb-9 max-w-xl mx-auto leading-relaxed">
                Create a free profile, connect with incredible developers, and get discovered by the companies building the future.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register">
                  <Button size="lg" className="cta-btn-primary w-full sm:w-auto px-8" icon={ArrowRight} iconPosition="right">
                    Get started for free
                  </Button>
                </Link>
                <Link to="/developers">
                  <Button size="lg" className="cta-btn-outline w-full sm:w-auto">
                    Explore developers
                  </Button>
                </Link>
              </div>
              <p className="text-white/55 text-xs mt-6">
                No credit card required · Cancel anytime · Free forever plan available
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════ */}
      <Footer />
    </div>
  );
}
