import { ArrowLeft, FileQuestion } from 'lucide-react';
import { Link } from 'wouter';
import { SiteShell } from '@/components/site-shell';

export default function NotFound() {
  return (
    <SiteShell>
      <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 py-20 text-center">
        <div className="grid size-16 place-items-center rounded-2xl bg-primary text-secondary shadow-[5px_5px_0_hsl(var(--accent))]"><FileQuestion className="size-8" /></div>
        <p className="mt-8 font-mono-brand text-[10px] uppercase tracking-[.2em] text-accent">404 / not on the record</p>
        <h1 data-testid="text-not-found" className="mt-4 font-display text-4xl font-semibold tracking-[-.05em]">That page is not here.</h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">The address may be old or incomplete. Head back to the dues desk and start again.</p>
        <Link href="/" data-testid="link-not-found-home" className="mt-8 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-bold text-secondary-foreground"><ArrowLeft className="size-4" /> Back to DuesTrack</Link>
      </section>
    </SiteShell>
  );
}
