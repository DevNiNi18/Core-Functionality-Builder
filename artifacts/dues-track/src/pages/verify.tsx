import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, BadgeCheck, Check, CheckCircle2, Copy, FileSearch, ScanLine, ShieldAlert, UserCheck } from 'lucide-react';
import { getVerifyPaymentQueryKey, useVerifyPayment } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { SiteShell, PageIntro, TextField, SkeletonPanel } from '@/components/site-shell';

const sampleCodes = [
  { code: 'NAC-7F2K-91QX', label: 'Chinedu (2024/25)' },
  { code: 'NACOS241', label: 'Ada (2025/26)' },
  { code: 'NACOS243', label: 'Chinedu E. (2025/26)' },
  { code: 'NACOS244', label: 'Fatima (2025/26)' },
];

export default function Verify() {
  const [input, setInput] = useState('');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const paymentQuery = useVerifyPayment(code, {
    query: {
      enabled: Boolean(code),
      queryKey: getVerifyPaymentQueryKey(code),
    },
  });
  const payment = paymentQuery.data;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryCode = params.get('code');
    if (queryCode) {
      const clean = queryCode.trim().toUpperCase();
      setInput(clean);
      setCode(clean);
    }
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = input.trim().toUpperCase();
    if (value) {
      if (value === code) {
        paymentQuery.refetch();
      } else {
        setCode(value);
      }
    }
  };

  const selectSampleCode = (sample: string) => {
    setInput(sample);
    setCode(sample);
  };

  const copyCodeToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          <PageIntro
            eyebrow="03 / verify a code"
            title="A code should answer clearly."
            description="Enter a DuesTrack proof code to confirm the full payment record attached to it."
          />
          <div className="fade-up fade-up-delay-1 rounded-[24px] border border-border bg-card p-6 soft-shadow sm:p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="grid size-11 place-items-center rounded-xl bg-primary/20 text-secondary">
                <ScanLine className="size-5" />
              </div>
              <div>
                <p className="font-semibold">Payment proof lookup</p>
                <p className="mt-1 text-sm text-muted-foreground">Codes look like NAC-7F2K-91QX or NACOS241.</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                label="Proof code"
                placeholder="NAC-7F2K-91QX"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                required
                data-testid="input-proof-code"
              />
              <button
                type="submit"
                data-testid="button-verify-code"
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-5 text-sm font-bold text-secondary-foreground transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_hsl(var(--primary))]"
              >
                <FileSearch className="size-4" /> Verify payment
              </button>
            </form>

            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs font-semibold text-muted-foreground">Quick test demo codes:</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {sampleCodes.map((s) => (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => selectSampleCode(s.code)}
                    className="rounded-lg border border-border bg-muted/60 px-2.5 py-1 font-mono-brand text-xs transition-colors hover:border-primary hover:bg-card"
                  >
                    {s.code} <span className="font-sans text-[10px] text-muted-foreground">({s.label})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 max-w-3xl lg:ml-auto">
          {!code && (
            <div data-testid="empty-verification" className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
              <FileSearch className="mx-auto size-8 text-muted-foreground/60" />
              <p className="mt-4 font-display text-xl font-semibold">Nothing to verify yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">Enter a proof code above or pick a demo code to see its record.</p>
            </div>
          )}
          {code && paymentQuery.isLoading && <SkeletonPanel />}
          {code && paymentQuery.isError && (
            <div data-testid="status-invalid-code" className="rounded-2xl border border-accent/30 bg-accent/5 p-6 sm:p-8">
              <div className="flex size-11 items-center justify-center rounded-full bg-accent/15 text-accent">
                <ShieldAlert className="size-5" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-semibold">That code is not valid.</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                We could not match <span className="font-mono-brand font-semibold text-foreground">{code}</span> to an official payment record. Check the code and try again.
              </p>
            </div>
          )}
          {payment && (
            <div data-testid="status-verified-payment" className="fade-up overflow-hidden rounded-2xl border border-secondary bg-card soft-shadow">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-secondary px-6 py-5 text-secondary-foreground sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Payment verified</p>
                    <p className="text-xs text-secondary-foreground/60">Official Departmental Record Confirmed</p>
                  </div>
                </div>
                <BadgeCheck className="size-7 text-primary" />
              </div>
              <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
                <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/50 p-3.5">
                  <div>
                    <p className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-muted-foreground">proof code</p>
                    <p data-testid="text-verified-code" className="mt-1 font-mono-brand text-xl font-bold tracking-[.14em] text-foreground">{payment.code}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyCodeToClipboard(payment.code)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    {copied ? <Check className="size-3.5 text-secondary" /> : <Copy className="size-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy code'}</span>
                  </button>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Student name</p>
                  <p data-testid="text-verified-student" className="mt-1 text-base font-bold">{payment.studentName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Matric number</p>
                  <p data-testid="text-verified-matric" className="mt-1 font-mono-brand text-sm">{payment.matricNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Session</p>
                  <p data-testid="text-verified-session" className="mt-1 text-base font-bold">{payment.session}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount recorded</p>
                  <p data-testid="text-verified-amount" className="mt-1 font-display text-2xl font-semibold">₦{payment.amount.toLocaleString()}</p>
                </div>
                <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
                  <div>
                    <p className="text-xs text-muted-foreground">Recorded on</p>
                    <p data-testid="text-verified-timestamp" className="mt-1 text-sm font-semibold">
                      {new Date(payment.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <Link
                    href={`/standing?matricNumber=${encodeURIComponent(payment.matricNumber)}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold text-secondary-foreground transition-transform hover:-translate-y-0.5"
                  >
                    <UserCheck className="size-4 text-primary" /> View all standing for this student
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>Need to record your own dues?</span>
          <Link href="/pay" data-testid="link-verify-pay" className="inline-flex items-center gap-2 font-bold text-foreground hover:text-accent">
            Record a payment <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}