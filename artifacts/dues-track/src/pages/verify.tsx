import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, BadgeCheck, CheckCircle2, FileSearch, ScanLine, ShieldAlert } from 'lucide-react';
import { getVerifyPaymentQueryKey, useVerifyPayment } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { SiteShell, PageIntro, TextField, ErrorPanel, SkeletonPanel } from '@/components/site-shell';

export default function Verify() {
  const [input, setInput] = useState('');
  const [code, setCode] = useState('');
  const paymentQuery = useVerifyPayment(code, { query: { enabled: Boolean(code), queryKey: getVerifyPaymentQueryKey(code) } });
  const payment = paymentQuery.data;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryCode = params.get('code');
    if (queryCode) { setInput(queryCode); setCode(queryCode); }
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = input.trim().toUpperCase();
    if (value) setCode(value);
  };

  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          <PageIntro eyebrow="03 / verify a code" title="A code should answer clearly." description="Enter a DuesTrack proof code to confirm the full payment record attached to it." />
          <div className="fade-up fade-up-delay-1 rounded-[24px] border border-border bg-card p-6 soft-shadow sm:p-8">
            <div className="mb-8 flex items-start gap-4"><div className="grid size-11 place-items-center rounded-xl bg-primary/20 text-secondary"><ScanLine className="size-5" /></div><div><p className="font-semibold">Payment proof lookup</p><p className="mt-1 text-sm text-muted-foreground">Codes look like NAC-7F2K-91QX.</p></div></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField label="Proof code" placeholder="NAC-7F2K-91QX" value={input} onChange={(event) => setInput(event.target.value)} required data-testid="input-proof-code" />
              <button type="submit" data-testid="button-verify-code" className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-5 text-sm font-bold text-secondary-foreground transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_hsl(var(--primary))]"><FileSearch className="size-4" /> Verify payment</button>
            </form>
          </div>
        </div>

        <div className="mt-12 max-w-3xl lg:ml-auto">
          {!code && <div data-testid="empty-verification" className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center"><FileSearch className="mx-auto size-8 text-muted-foreground/60" /><p className="mt-4 font-display text-xl font-semibold">Nothing to verify yet.</p><p className="mt-2 text-sm text-muted-foreground">Enter a proof code to see its payment record.</p></div>}
          {code && paymentQuery.isLoading && <SkeletonPanel />}
          {code && paymentQuery.isError && <div data-testid="status-invalid-code" className="rounded-2xl border border-accent/30 bg-accent/5 p-6 sm:p-8"><div className="flex size-11 items-center justify-center rounded-full bg-accent/15 text-accent"><ShieldAlert className="size-5" /></div><h2 className="mt-5 font-display text-2xl font-semibold">That code is not valid.</h2><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">We could not match <span className="font-mono-brand text-foreground">{code}</span> to a payment record. Check the code and try again.</p></div>}
          {payment && <div data-testid="status-verified-payment" className="fade-up overflow-hidden rounded-2xl border border-secondary bg-card soft-shadow"><div className="flex flex-wrap items-center justify-between gap-4 bg-secondary px-6 py-5 text-secondary-foreground sm:px-8"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground"><CheckCircle2 className="size-5" /></div><div><p className="font-semibold">Payment verified</p><p className="text-xs text-secondary-foreground/60">This record exists in DuesTrack.</p></div></div><BadgeCheck className="size-7 text-primary" /></div><div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8"><div className="sm:col-span-2"><p className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-muted-foreground">proof code</p><p data-testid="text-verified-code" className="mt-2 font-mono-brand text-xl tracking-[.14em]">{payment.code}</p></div><div><p className="text-xs text-muted-foreground">Student name</p><p data-testid="text-verified-student" className="mt-1 text-base font-bold">{payment.studentName}</p></div><div><p className="text-xs text-muted-foreground">Matric number</p><p data-testid="text-verified-matric" className="mt-1 font-mono-brand text-sm">{payment.matricNumber}</p></div><div><p className="text-xs text-muted-foreground">Session</p><p data-testid="text-verified-session" className="mt-1 text-base font-bold">{payment.session}</p></div><div><p className="text-xs text-muted-foreground">Amount recorded</p><p data-testid="text-verified-amount" className="mt-1 font-display text-2xl font-semibold">₦{payment.amount.toLocaleString()}</p></div><div className="sm:col-span-2 border-t border-border pt-5"><p className="text-xs text-muted-foreground">Recorded on</p><p data-testid="text-verified-timestamp" className="mt-1 text-sm font-semibold">{new Date(payment.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p></div></div></div>}
        </div>
      </section>
      <section className="border-t border-border bg-muted/40"><div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>Need to record your own dues?</span><Link href="/pay" data-testid="link-verify-pay" className="inline-flex items-center gap-2 font-bold text-foreground hover:text-accent">Record a payment <ArrowRight className="size-4" /></Link></div></section>
    </SiteShell>
  );
}