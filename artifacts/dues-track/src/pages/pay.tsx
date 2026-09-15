import { useState, type FormEvent } from 'react';
import { ArrowRight, BadgeCheck, Check, Copy, Info, RotateCcw } from 'lucide-react';
import { useCreatePayment, type Payment } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { SiteShell, TextField, SelectField, PageIntro, ErrorPanel } from '@/components/site-shell';

const sessions = [
  { value: '2024/2025', label: '2024 / 2025', amount: 2500 },
  { value: '2023/2024', label: '2023 / 2024', amount: 2500 },
  { value: '2022/2023', label: '2022 / 2023', amount: 2000 },
];

export default function Pay() {
  const [matricNumber, setMatricNumber] = useState('');
  const [studentName, setStudentName] = useState('');
  const [session, setSession] = useState(sessions[0].value);
  const [createdPayment, setCreatedPayment] = useState<Payment | null>(null);
  const [copied, setCopied] = useState(false);
  const createPayment = useCreatePayment();
  const chosenSession = sessions.find((item) => item.value === session) ?? sessions[0];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createPayment.mutate({ data: { matricNumber: matricNumber.trim(), studentName: studentName.trim(), session, amount: chosenSession.amount } }, {
      onSuccess: (payment) => setCreatedPayment(payment),
    });
  };

  const copyCode = async () => {
    if (!createdPayment) return;
    await navigator.clipboard?.writeText(createdPayment.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  if (createdPayment) {
    return (
      <SiteShell>
        <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="fade-up rounded-[26px] border border-border bg-card p-6 soft-shadow sm:p-10">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="size-7" strokeWidth={2.5} /></div>
            <p className="mt-8 font-mono-brand text-[10px] uppercase tracking-[.2em] text-accent">payment recorded</p>
            <h1 data-testid="text-payment-success" className="mt-3 font-display text-4xl font-semibold tracking-[-.05em]">Keep this proof code.</h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">Your simulated payment record is ready. Use this code whenever you need to verify it.</p>
            <div className="mt-8 rounded-2xl bg-secondary p-6 text-secondary-foreground sm:p-8">
              <p className="font-mono-brand text-[10px] uppercase tracking-[.2em] text-secondary-foreground/55">permanent proof code</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                <span data-testid="text-proof-code" className="font-mono-brand text-2xl tracking-[.16em] text-primary sm:text-3xl">{createdPayment.code}</span>
                <button type="button" data-testid="button-copy-code" onClick={copyCode} className="inline-flex items-center gap-2 rounded-full border border-secondary-foreground/25 px-3 py-2 text-xs font-bold transition-colors hover:bg-secondary-foreground/10">{copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}{copied ? 'Copied' : 'Copy code'}</button>
              </div>
            </div>
            <div className="mt-7 grid gap-4 border-b border-border pb-7 sm:grid-cols-2">
              <div><p className="text-xs text-muted-foreground">Student</p><p data-testid="text-payment-student" className="mt-1 font-semibold">{createdPayment.studentName}</p><p className="font-mono-brand text-xs text-muted-foreground">{createdPayment.matricNumber}</p></div>
              <div><p className="text-xs text-muted-foreground">Session / amount</p><p data-testid="text-payment-session" className="mt-1 font-semibold">{createdPayment.session}</p><p className="font-mono-brand text-xs text-muted-foreground">₦{createdPayment.amount.toLocaleString()}</p></div>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/verify?code=${createdPayment.code}`} data-testid="link-verify-created-code" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">Verify this record <ArrowRight className="size-4" /></Link>
              <button type="button" data-testid="button-record-another" onClick={() => { setCreatedPayment(null); setCopied(false); }} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-bold hover:bg-muted"><RotateCcw className="size-4" /> Record another</button>
            </div>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[.8fr_1.2fr] lg:px-8 lg:py-24">
        <PageIntro eyebrow="01 / record a payment" title="Put your session on the record." description="Enter your student details and select the session. This first release simulates the payment and creates a permanent proof code." />
        <div className="fade-up fade-up-delay-1 rounded-[24px] border border-border bg-card p-6 soft-shadow sm:p-8">
          <div className="mb-8 flex items-start gap-3 rounded-xl border border-primary/35 bg-primary/10 p-4 text-sm leading-6"><Info className="mt-0.5 size-4 shrink-0 text-secondary" /><p>Payments are simulated in this first release. No money moves through this form.</p></div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <TextField label="Matric number" placeholder="e.g. 2021/12345" value={matricNumber} onChange={(event) => setMatricNumber(event.target.value)} required data-testid="input-matric-number" />
            <TextField label="Student name" hint="As it appears on your record" placeholder="e.g. Chinedu Okafor" value={studentName} onChange={(event) => setStudentName(event.target.value)} required data-testid="input-student-name" />
            <SelectField label="Session" value={session} onChange={(event) => setSession(event.target.value)} data-testid="select-session">
              {sessions.map((item) => <option key={item.value} value={item.value}>{item.label} · ₦{item.amount.toLocaleString()}</option>)}
            </SelectField>
            <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-3"><span className="text-sm text-muted-foreground">Amount to record</span><span data-testid="text-payment-amount" className="font-display text-xl font-semibold">₦{chosenSession.amount.toLocaleString()}</span></div>
            {createPayment.isError && <ErrorPanel title="Payment could not be recorded." detail="Please check your details and try again." />}
            <button type="submit" data-testid="button-submit-payment" disabled={createPayment.isPending} className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3.5 text-sm font-bold text-secondary-foreground transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_hsl(var(--primary))] disabled:cursor-wait disabled:opacity-70">
              {createPayment.isPending ? <><span className="size-4 animate-spin rounded-full border-2 border-secondary-foreground/30 border-t-secondary-foreground" /> Recording payment...</> : <>Record simulated payment <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></>}
            </button>
          </form>
        </div>
      </section>
      <section className="border-t border-border bg-muted/40"><div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8"><span className="flex items-center gap-2"><BadgeCheck className="size-4 text-accent" /> One code is generated for each recorded session.</span><span className="font-mono-brand text-[10px] uppercase tracking-[.14em]">Keep it somewhere safe</span></div></section>
    </SiteShell>
  );
}