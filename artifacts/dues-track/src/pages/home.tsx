import { ArrowDownRight, ArrowRight, BadgeCheck, BookOpenCheck, CircleCheck, FileCheck2, LockKeyhole, Search, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';
import { SiteShell } from '@/components/site-shell';

const actions = [
  { href: '/pay', number: '01', icon: BookOpenCheck, title: 'Pay dues', text: 'Record your session dues and receive a permanent proof code.' },
  { href: '/standing', number: '02', icon: Search, title: 'Check standing', text: 'See paid sessions, total paid, and what is still outstanding.' },
  { href: '/verify', number: '03', icon: FileCheck2, title: 'Verify a code', text: 'Confirm a payment record before you rely on it or share it.' },
];

export default function Home() {
  return (
    <SiteShell>
      <section className="paper-grid relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full border-[26px] border-primary/20 sm:size-[30rem]" />
        <div className="pointer-events-none absolute -bottom-24 left-[43%] size-52 rounded-full bg-accent/10 blur-3xl" />
        <div className="mx-auto grid max-w-6xl gap-14 px-5 pb-20 pt-16 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-24">
          <div className="relative z-10">
            <div className="fade-up inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 font-mono-brand text-[10px] uppercase tracking-[.18em] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-accent" /> NACOS dues desk · UNN
            </div>
            <h1 data-testid="text-home-title" className="fade-up fade-up-delay-1 mt-7 max-w-3xl font-display text-5xl font-semibold leading-[.96] tracking-[-.065em] sm:text-7xl lg:text-[6.4rem]">
              Your dues.<br /><span className="text-accent">Sorted.</span>
            </h1>
            <p className="fade-up fade-up-delay-2 mt-7 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              A clear, reliable place for Computer Science students at the University of Nigeria, Nsukka to record and verify their dues standing.
            </p>
            <div className="fade-up fade-up-delay-3 mt-9 flex flex-wrap items-center gap-3">
              <Link href="/pay" data-testid="link-home-pay" className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5">
                Record a payment <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/standing" data-testid="link-home-standing" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3.5 text-sm font-bold transition-colors hover:border-secondary hover:bg-secondary hover:text-secondary-foreground">
                Check my standing
              </Link>
            </div>
            <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3.5" /> Payments are simulated in this first release.</p>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:ml-auto">
            <div className="float-slow relative rotate-2 rounded-[26px] border border-secondary/70 bg-secondary p-5 text-secondary-foreground shadow-[12px_14px_0_hsl(var(--primary)/.85)] sm:p-7">
              <div className="flex items-start justify-between border-b border-secondary-foreground/20 pb-5">
                <div>
                  <p className="font-mono-brand text-[10px] uppercase tracking-[.2em] text-primary">payment record</p>
                  <p className="mt-2 font-display text-2xl font-semibold">NACOS / UNN</p>
                </div>
                <BadgeCheck className="size-9 text-primary" strokeWidth={1.5} />
              </div>
              <div className="grid grid-cols-2 gap-5 py-6">
                <div><p className="font-mono-brand text-[9px] uppercase tracking-[.15em] text-secondary-foreground/55">student</p><p className="mt-1 text-sm font-semibold">CHINEDU OKAFOR</p></div>
                <div><p className="font-mono-brand text-[9px] uppercase tracking-[.15em] text-secondary-foreground/55">session</p><p className="mt-1 text-sm font-semibold">2024 / 25</p></div>
                <div><p className="font-mono-brand text-[9px] uppercase tracking-[.15em] text-secondary-foreground/55">amount</p><p className="mt-1 font-display text-2xl font-semibold text-primary">₦2,500</p></div>
                <div><p className="font-mono-brand text-[9px] uppercase tracking-[.15em] text-secondary-foreground/55">status</p><p className="mt-1 flex items-center gap-1.5 text-sm font-semibold"><CircleCheck className="size-4 text-primary" /> recorded</p></div>
              </div>
              <div className="rounded-xl border border-dashed border-secondary-foreground/25 px-4 py-3">
                <p className="font-mono-brand text-[9px] uppercase tracking-[.15em] text-secondary-foreground/55">proof code</p>
                <p data-testid="text-example-code" className="mt-1 font-mono-brand text-lg tracking-[.18em] text-primary">NAC-7F2K-91QX</p>
              </div>
              <Link
                href="/verify?code=NAC-7F2K-91QX"
                className="mt-4 flex items-center justify-between rounded-xl bg-secondary-foreground/10 px-3.5 py-2 text-xs font-bold text-secondary-foreground transition-colors hover:bg-secondary-foreground/20"
              >
                <span>Test verify this code</span>
                <ArrowRight className="size-3.5 text-primary" />
              </Link>
              <p className="mt-4 font-mono-brand text-[9px] uppercase tracking-[.14em] text-secondary-foreground/45">official proof code example</p>
            </div>
            <div className="absolute -bottom-9 -left-8 hidden -rotate-6 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-xs font-bold shadow-lg sm:flex"><ShieldCheck className="size-5 text-accent" /> Easy to verify</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono-brand text-[10px] uppercase tracking-[.2em] text-accent">three simple moves</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Everything important, in one place.</h2>
          </div>
          <ArrowDownRight className="hidden size-7 text-accent sm:block" />
        </div>
        <div className="grid gap-4 pt-8 md:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} data-testid={`card-action-${action.number}`} className="group relative min-h-64 rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-secondary hover:shadow-[6px_7px_0_hsl(var(--primary)/.65)]">
                <div className="flex items-start justify-between"><span className="font-mono-brand text-xs text-accent">{action.number}</span><Icon className="size-6 text-secondary transition-transform group-hover:rotate-[-8deg]" strokeWidth={1.7} /></div>
                <h3 className="mt-14 font-display text-2xl font-semibold">{action.title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">{action.text}</p>
                <ArrowRight className="absolute bottom-6 right-6 size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-secondary text-secondary-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[.75fr_1.25fr] lg:items-center lg:px-8 lg:py-20">
          <div><p className="font-mono-brand text-[10px] uppercase tracking-[.2em] text-primary">built for the desk</p><h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-[-.04em] sm:text-4xl">Less back-and-forth.<br />More certainty.</h2></div>
          <div className="grid gap-7 sm:grid-cols-3">
            {[['01', 'One proof code', 'Every recorded payment gets a permanent code you can keep.'], ['02', 'A readable standing', 'No guesswork: paid sessions and outstanding sessions are separated.'], ['03', 'Straight answers', 'Find a code or record without digging through messages.']].map(([number, title, text]) => (
              <div key={number} className="border-l border-secondary-foreground/20 pl-4"><span className="font-mono-brand text-xs text-primary">{number}</span><h3 className="mt-6 text-sm font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-secondary-foreground/65">{text}</p></div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}