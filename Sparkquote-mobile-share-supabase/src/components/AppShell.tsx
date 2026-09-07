import type { ReactNode } from 'react';
import { NAV_ITEMS, navigate, type Route } from '@/lib/router';
import { Zap } from 'lucide-react';

interface Props {
  current: Route;
  onNavigate: (route: Route) => void;
  children: ReactNode;
}

export function AppShell({ current, onNavigate, children }: Props) {
  const go = (route: Route) => {
    navigate(route);
    onNavigate(route);
  };

  const isActive = (route: Route): boolean => {
    if (route.name === 'job') return current.name === 'job';
    return route.name === current.name;
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <button
            onClick={() => go({ name: 'dashboard' })}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white shadow-sm">
              <Zap className="h-5 w-5" fill="currentColor" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold leading-none text-slate-900">SparkQuote</div>
              <div className="mt-0.5 text-[11px] leading-none text-slate-500">
                Electrical Quote Assistant
              </div>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="ml-6 hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.route);
              return (
                <button
                  key={item.key}
                  onClick={() => go(item.route)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-7xl items-stretch justify-around px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.route);
            return (
              <button
                key={item.key}
                onClick={() => go(item.route)}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? 'text-brand-700' : 'text-slate-500'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 md:pb-10">{children}</main>
    </div>
  );
}

