import { LayoutDashboard, PlusCircle, Briefcase, Users, Settings as SettingsIcon } from 'lucide-react';

export type Route =
  | { name: 'dashboard' }
  | { name: 'new-job' }
  | { name: 'jobs' }
  | { name: 'customers' }
  | { name: 'settings' }
  | { name: 'job'; id: string }
  | { name: 'public-quote'; token: string };

export interface NavItem {
  key: string;
  label: string;
  icon: typeof LayoutDashboard;
  route: Route;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: { name: 'dashboard' } },
  { key: 'new-job', label: 'New Job', icon: PlusCircle, route: { name: 'new-job' } },
  { key: 'jobs', label: 'Jobs', icon: Briefcase, route: { name: 'jobs' } },
  { key: 'customers', label: 'Customers', icon: Users, route: { name: 'customers' } },
  { key: 'settings', label: 'Settings', icon: SettingsIcon, route: { name: 'settings' } },
];

export function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/').filter(Boolean);
  if (parts.length === 0) return { name: 'dashboard' };
  switch (parts[0]) {
    case 'new-job':
      return { name: 'new-job' };
    case 'jobs':
      return { name: 'jobs' };
    case 'customers':
      return { name: 'customers' };
    case 'settings':
      return { name: 'settings' };
    case 'job':
      return parts[1] ? { name: 'job', id: parts[1] } : { name: 'dashboard' };
    case 'quote':
      return parts[1] ? { name: 'public-quote', token: parts[1] } : { name: 'dashboard' };
    default:
      return { name: 'dashboard' };
  }
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'dashboard':
      return '#/';
    case 'new-job':
      return '#/new-job';
    case 'jobs':
      return '#/jobs';
    case 'customers':
      return '#/customers';
    case 'settings':
      return '#/settings';
    case 'job':
      return `#/job/${route.id}`;
    case 'public-quote':
      return `#/quote/${route.token}`;
  }
}

export function navigate(route: Route) {
  window.location.hash = routeToHash(route);
}
