import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Check, CircleAlert, ExternalLink, PlusCircle, Search, WalletCards } from 'lucide-react';
import { getGetStandingQueryKey, useGetStanding } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { SiteShell, PageIntro, TextField, ErrorPanel, SkeletonPanel } from '@/components/site-shell';

const demoStudents = [
  { matric: '2021/119842', name: 'Chinedu Okafor' },
  { matric: '2021/245678', name: 'Ada Okafor' },
  { matric: '2022/310944', name: 'Chinedu Eze' },
  { matric: '2023/418205', name: 'Fatima Bello' },
];

export default function Standing() {
  const [input, setInput] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const standingQuery = useGetStanding(matricNumber, {
    query: {
      enabled: Boolean(matricNumber),
      queryKey: getGetStandingQueryKey(matricNumber),
    },
  });
  const standing = standingQuery.data;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryMatric = params.get('matricNumber') || params.get('matric');
    if (queryMatric) {
      const clean = queryMatric.trim();
      setInput(clean);
      setMatricNumber(clean);
    }
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = input.trim();
    if (value) {
      if (value === matricNumber) {
        standingQuery.refetch();
      } else {
        setMatricNumber(value);
      }
    }
  };

  const selectDemoStudent = (matric: string) => {
    setInput(matric);
    setMatricNumber(matric);
  };

  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
        <PageIntro
          eyebrow="02 / check standing"
          title="Know exactly where you stand."
          description="Look up a matric number to see the sessions already covered, the total recorded, and what remains."
        />

        <div className="mt-8">
          <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <TextField
                label="Matric number"
                placeholder="e.g. 2021/12345"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                required
                data-testid="input-standing-matric"
              />
            </div>
            <button
              type="submit"
              data-testid="button-lookup-standing"
              className="mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-secondary px-5 text-sm font-bold text-secondary-foreground transition-transform hover:-translate-y-0.5"
            >
              <Search className="size-4" /> Look up
            </button>
          </form>

          {/* Quick test student pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-muted-foreground">Test with demo student:</span>
            {demoStudents.map((s) => (
              <button
                key={s.matric}
                type="button"
                onClick={() => selectDemoStudent(s.matric)}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/10"
              >
                {s.name} ({s.matric})
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12">
          {!matricNumber && (
            <div data-testid="empty-standing" className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
              <WalletCards className="mx-auto size-8 text-muted-foreground/60" />
              <p className="mt-4 font-display text-xl font-semibold">Your standing will appear here.</p>
              <p className="mt-2 text-sm text-muted-foreground">Enter a matric number above or pick a demo student to begin.</p>
            </div>
          )}
          {matricNumber && standingQuery.isLoading && <SkeletonPanel />}
          {matricNumber && standingQuery.isError && (
            <ErrorPanel title="No standing found for that matric number." detail="Check the number, including the slash, and try again." />
          )}
          {standing && (
            <div data-testid="status-standing-result" className="fade-up grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
              <div className="rounded-2xl bg-secondary p-6 text-secondary-foreground sm:p-8">
                <p className="font-mono-brand text-[10px] uppercase tracking-[.2em] text-primary">student standing</p>
                <h2 data-testid="text-standing-student" className="mt-4 font-display text-3xl font-semibold leading-tight">{standing.studentName}</h2>
                <p data-testid="text-standing-matric" className="mt-2 font-mono-brand text-xs text-secondary-foreground/60">{standing.matricNumber}</p>
                <div className="mt-10 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-secondary-foreground/10 p-4">
                    <p className="text-xs text-secondary-foreground/60">Total paid</p>
                    <p data-testid="text-total-paid" className="mt-2 font-display text-2xl font-semibold text-primary">₦{standing.totalPaid.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-secondary-foreground/10 p-4">
                    <p className="text-xs text-secondary-foreground/60">Total owed</p>
                    <p data-testid="text-total-owed" className="mt-2 font-display text-2xl font-semibold">₦{standing.totalOwed.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-2 text-sm text-secondary-foreground/70">
                  <CircleAlert className="size-4 text-primary" />
                  {standing.outstandingSessions.length ? `${standing.outstandingSessions.length} session${standing.outstandingSessions.length === 1 ? '' : 's'} outstanding` : 'You are completely up to date'}
                </div>

                {standing.outstandingSessions.length > 0 && (
                  <div className="mt-6 border-t border-secondary-foreground/20 pt-6">
                    <Link
                      href={`/pay?matricNumber=${encodeURIComponent(standing.matricNumber)}&session=${encodeURIComponent(standing.outstandingSessions[0])}&studentName=${encodeURIComponent(standing.studentName !== 'Student' ? standing.studentName : '')}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
                    >
                      <PlusCircle className="size-4" /> Record dues for {standing.outstandingSessions[0]}
                    </Link>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="flex items-end justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <p className="font-mono-brand text-[10px] uppercase tracking-[.2em] text-accent">payment history</p>
                    <h3 className="mt-2 font-display text-2xl font-semibold">Covered sessions</h3>
                  </div>
                  <span className="rounded-full bg-primary/20 px-3 py-1 font-mono-brand text-xs">{standing.paidSessions.length} paid</span>
                </div>
                <div className="divide-y divide-border">
                  {standing.paidSessions.map((session, index) => (
                    <div key={`${session.session}-${index}`} data-testid={`row-paid-session-${index}`} className="flex flex-wrap items-center justify-between gap-3 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-8 place-items-center rounded-full bg-primary/20 text-secondary">
                          <Check className="size-4" />
                        </span>
                        <div>
                          <p className="text-sm font-bold">{session.session}</p>
                          <Link
                            href={`/verify?code=${encodeURIComponent(session.code)}`}
                            className="group inline-flex items-center gap-1 font-mono-brand text-[11px] text-accent hover:underline"
                            title="Verify this payment code"
                          >
                            <span>{session.code}</span>
                            <ExternalLink className="size-3 opacity-60 group-hover:opacity-100" />
                          </Link>
                        </div>
                      </div>
                      <span className="font-mono-brand text-sm font-semibold">₦{session.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {!standing.paidSessions.length && (
                    <p className="py-8 text-sm text-muted-foreground">No paid sessions recorded yet.</p>
                  )}
                </div>

                {standing.outstandingSessions.length > 0 ? (
                  <div className="mt-5 rounded-xl bg-muted p-4">
                    <p className="text-xs font-bold text-muted-foreground">Outstanding sessions</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {standing.outstandingSessions.map((session) => (
                        <Link
                          key={session}
                          href={`/pay?matricNumber=${encodeURIComponent(standing.matricNumber)}&session=${encodeURIComponent(session)}&studentName=${encodeURIComponent(standing.studentName !== 'Student' ? standing.studentName : '')}`}
                          data-testid={`text-outstanding-${session}`}
                          className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-mono-brand text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-accent"
                          title={`Click to record payment for ${session}`}
                        >
                          <span>{session}</span>
                          <span className="text-[10px] text-muted-foreground group-hover:text-accent">+ Pay</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl bg-primary/10 p-4 text-xs font-medium text-foreground">
                    All departmental dues for registered academic sessions have been satisfied.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-7 text-sm text-muted-foreground lg:px-8">
          <span>Need a payment code checked?</span>
          <Link href="/verify" data-testid="link-standing-verify" className="inline-flex items-center gap-2 font-bold text-foreground hover:text-accent">
            Verify a code <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}