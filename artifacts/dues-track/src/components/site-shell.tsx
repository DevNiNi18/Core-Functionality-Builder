import { useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { ArrowRight, BadgeCheck, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';

const navItems = [
  { href: '/pay', label: 'Pay dues' },
  { href: '/standing', label: 'Check standing' },
  { href: '/verify', label: 'Verify code' },
];

export function SiteShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] text-foreground">
      <header className="relative z-20 border-b border-border/80 bg-[hsl(var(--background)/.88)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" data-testid="link-brand" className="group flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-[13px] bg-secondary text-primary shadow-[3px_3px_0_hsl(var(--primary))] transition-transform group-hover:-translate-y-0.5">
              <BadgeCheck className="size-5" strokeWidth={2.4} />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold leading-none tracking-tight">DuesTrack</span>
              <span className="font-mono-brand mt-1 block text-[9px] uppercase tracking-[.18em] text-muted-foreground">NACOS · UNN</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {navItems.map((item) => {
              const active = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-testid={`link-nav-${item.href.slice(1)}`}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <span className="font-mono-brand text-[10px] uppercase tracking-[.16em] text-muted-foreground">2024 / 25 session</span>
            <Link href="/pay" data-testid="link-header-start" className="group inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5">
              Start here <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <button
            type="button"
            data-testid="button-mobile-menu"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid size-10 place-items-center rounded-full border border-border bg-card md:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {menuOpen && (
          <nav className="border-t border-border bg-card px-5 py-3 md:hidden" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`link-mobile-${item.href.slice(1)}`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between border-b border-border/70 py-3 text-sm font-semibold last:border-0"
              >
                {item.label}
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main>{children}</main>

      <footer className="border-t border-border bg-secondary text-secondary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <p className="font-display text-base font-semibold">Keep your record close.</p>
            <p className="mt-1 text-xs text-secondary-foreground/65">DuesTrack is the NACOS dues desk for UNN students.</p>
          </div>
          <p className="font-mono-brand text-[10px] uppercase tracking-[.16em] text-secondary-foreground/55">Payments are simulated in this first release.</p>
        </div>
      </footer>
    </div>
  );
}

export function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="max-w-2xl fade-up">
      <p className="font-mono-brand text-[10px] font-medium uppercase tracking-[.22em] text-accent">{eyebrow}</p>
      <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.06] tracking-[-.045em] text-foreground sm:text-5xl">{title}</h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}

export function TextField({ label, hint, ...props }: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline justify-between gap-3 text-sm font-bold">
        {label}
        {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
      </span>
      <input
        {...props}
        className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-[border,box-shadow] placeholder:text-muted-foreground/65 focus:border-primary focus:ring-4 focus:ring-primary/15"
      />
    </label>
  );
}

export function SelectField({ label, children, ...props }: { label: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">{label}</span>
      <select
        {...props}
        className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-[border,box-shadow] focus:border-primary focus:ring-4 focus:ring-primary/15"
      >
        {children}
      </select>
    </label>
  );
}

export function ErrorPanel({ title = 'We could not find that record.', detail = 'Check the details and try again.' }: { title?: string; detail?: string }) {
  return (
    <div data-testid="status-error" className="rounded-2xl border border-destructive/25 bg-destructive/5 p-5">
      <p className="font-semibold text-destructive">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{detail}</p>
    </div>
  );
}

export function SkeletonPanel() {
  return (
    <div data-testid="status-loading" className="space-y-3 rounded-2xl border border-border bg-card p-6">
      <div className="shimmer h-4 w-28 rounded" />
      <div className="shimmer h-8 w-3/4 rounded" />
      <div className="shimmer h-4 w-1/2 rounded" />
      <div className="grid grid-cols-2 gap-3 pt-3">
        <div className="shimmer h-20 rounded-xl" />
        <div className="shimmer h-20 rounded-xl" />
      </div>
    </div>
  );
}