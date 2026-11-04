import {
  Bell,
  Briefcase,
  Bookmark,
  ClipboardList,
  GitBranch,
  LayoutDashboard,
  Plus,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import { actsAs } from '../lib/roles.js';

/**
 * Single source of truth for the authenticated shell. Each entry's `mobilePrimary` lists,
 * in order, the destinations that earn a place in the phone tab bar; everything else lives
 * in the drawer. Role capability rules live in `lib/roles.js`.
 *
 * @type {Record<'developer'|'recruiter'|'superuser', {label: string, items: any[], secondary: any[], mobilePrimary: string[]}>}
 */
export const NAVIGATION = {
  developer: {
    label: 'Developer',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/jobs', label: 'Jobs', icon: Briefcase },
      { to: '/matches', label: 'Matches', icon: Sparkles },
      { to: '/applications', label: 'Applications', icon: ClipboardList, badge: 'applications' },
      { to: '/saved', label: 'Saved jobs', icon: Bookmark },
      { to: '/network', label: 'Network', icon: Users, badge: 'requests' },
      { to: '/repositories', label: 'Repositories', icon: GitBranch },
      { to: '/profile', label: 'My profile', icon: User },
    ],
    secondary: [{ to: '/notifications', label: 'Notifications', icon: Bell, badge: 'notifications' }],
    mobilePrimary: ['/', '/jobs', '/network', '/applications', '/notifications'],
  },
  recruiter: {
    label: 'Recruiter',
    items: [
      { to: '/recruiter', label: 'Overview', icon: LayoutDashboard, exact: true },
      { to: '/recruiter/jobs', label: 'Job postings', icon: Briefcase },
      { to: '/recruiter/applicants', label: 'Applicants', icon: ClipboardList, badge: 'applicants' },
      { to: '/recruiter/candidates', label: 'Candidates', icon: Users },
    ],
    secondary: [{ to: '/notifications', label: 'Notifications', icon: Bell, badge: 'notifications' }],
    mobilePrimary: ['/recruiter', '/recruiter/jobs', '/recruiter/applicants', '/notifications'],
  },
  superuser: {
    label: 'Review',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/jobs', label: 'Browse jobs', icon: Briefcase },
      { to: '/matches', label: 'My matches', icon: Sparkles },
      { to: '/applications', label: 'My applications', icon: ClipboardList, badge: 'applications' },
      { to: '/saved', label: 'Saved jobs', icon: Bookmark },
      { to: '/network', label: 'Network', icon: Users, badge: 'requests' },
      { to: '/repositories', label: 'Repositories', icon: GitBranch },
      { to: '/recruiter', label: 'Hiring overview', icon: LayoutDashboard, exact: true },
      { to: '/recruiter/jobs', label: 'Job postings', icon: Briefcase },
      { to: '/recruiter/applicants', label: 'Applicants', icon: ClipboardList, badge: 'applicants' },
      { to: '/recruiter/candidates', label: 'Saved candidates', icon: Users },
      { to: '/profile', label: 'My profile', icon: User },
    ],
    secondary: [{ to: '/notifications', label: 'Notifications', icon: Bell, badge: 'notifications' }],
    mobilePrimary: ['/', '/jobs', '/recruiter', '/applications', '/notifications'],
  },
};

/** The one prominent create/browse action in the sidebar, per role. */
export function primaryAction(role) {
  if (actsAs(role, 'recruiter')) {
    return { for: 'recruiter', to: '/recruiter/jobs/new', label: 'Post a job', icon: Plus };
  }
  return { for: 'developer', to: '/jobs', label: 'Browse open roles', icon: Briefcase };
}

export function navigationFor(role) {
  return NAVIGATION[role] ?? NAVIGATION.developer;
}

/** The phone tab bar, resolved from mobilePrimary paths so order stays explicit. */
export function mobileNavFor(role) {
  const nav = navigationFor(role);
  const byPath = new Map([...nav.items, ...nav.secondary].map((item) => [item.to, item]));
  return nav.mobilePrimary.map((path) => byPath.get(path)).filter(Boolean);
}
