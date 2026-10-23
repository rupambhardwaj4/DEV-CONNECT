import { Link } from 'react-router-dom';
import { GitBranch, X, Link2, Mail, ArrowRight, Code2, Sparkles, Heart } from 'lucide-react';
import { Logo } from '../common';

const footerLinks = {
  Product: [
    { label: 'Find Developers', href: '/developers' },
    { label: 'Browse Jobs', href: '/jobs' },
    { label: 'Explore Projects', href: '/projects' },
    { label: 'Recommendations', href: '/recommendations' },
    { label: 'Connections', href: '/connections' },
  ],
  Resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'API Reference', href: '/api' },
    { label: 'Blog', href: '/blog' },
    { label: 'Community', href: '/community' },
    { label: 'Changelog', href: '/changelog' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

const socialLinks = [
  { icon: GitBranch, label: 'GitHub', href: '#' },
  { icon: X, label: 'Twitter / X', href: '#' },
  { icon: Link2, label: 'LinkedIn', href: '#' },
  { icon: Mail, label: 'Email', href: '#' },
];

const stats = [
  { value: '50K+', label: 'Developers' },
  { value: '12K+', label: 'Projects' },
  { value: '3.5K+', label: 'Job listings' },
  { value: '98%', label: 'Satisfaction' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      {/* ── Mini Stats Bar ─────────────────────────────────── */}
      <div className="stats-bar">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-[var(--color-border)]">
            {stats.map((s) => (
              <div key={s.label} className="stat-item py-4 md:py-0 first:pt-0 last:pb-0 md:first:pl-0 md:last:pr-0">
                <div className="stat-number">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Footer Body ───────────────────────────────── */}
      <div className="container py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Logo size="md" className="mb-4" />
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6 max-w-xs">
              The professional network built for developers. Showcase your work, connect with peers, and unlock your next opportunity.
            </p>

            {/* Social Icons */}
            <div className="flex gap-2 mb-8">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="footer-social-btn"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
                Stay in the loop
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mb-3">
                Dev insights, new features, and community highlights.
              </p>
              <div className="flex max-w-xs">
                <input
                  type="email"
                  placeholder="you@example.com"
                  aria-label="Email for newsletter"
                  className="footer-newsletter-input"
                />
                <button className="footer-newsletter-btn" type="button">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 tracking-wide">
                {section}
              </h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link to={href} className="footer-link group">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Bar ─────────────────────────────────────── */}
      <div className="border-t border-[var(--color-border)]">
        <div className="container py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[var(--color-text-tertiary)]">
            <div className="flex items-center gap-1.5">
              <span>© {currentYear} DevConnect.</span>
              <span className="hidden sm:inline">Made with</span>
              <Heart className="hidden sm:inline h-3.5 w-3.5 text-[var(--color-rose)]" aria-hidden />
              <span className="hidden sm:inline">for developers.</span>
            </div>

            <div className="flex items-center gap-1 footer-brand-tagline text-[0.68rem]">
              <Code2 className="h-3 w-3" />
              CODE · CONNECT · CAREER
              <Sparkles className="h-3 w-3" />
            </div>

            <div className="flex items-center gap-4">
              <Link to="/privacy" className="footer-link text-xs">Privacy</Link>
              <Link to="/terms" className="footer-link text-xs">Terms</Link>
              <Link to="/cookies" className="footer-link text-xs">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
