'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BalisongLogo } from '@/components/icons';
import { Mail } from 'lucide-react';

/** Supabase returns this when a user tries to sign in before confirming. */
function isUnconfirmedEmailError(message: string | null | undefined): boolean {
  if (!message) return false;
  return /not confirmed|email_not_confirmed|email.*not.*verified/i.test(message);
}

export default function AuthPage() {
  const { signIn, signUp, resendConfirmation } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') ?? '/';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  // Email-confirmation reminder state.
  // - `pendingEmail`: address waiting for verification (drives both banner + dialog).
  // - `unconfirmedOpen`: triggers the modal when sign-in fails because of it.
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [unconfirmedOpen, setUnconfirmedOpen] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (!error) { router.push(next); router.refresh(); return; }
        if (isUnconfirmedEmailError(error.message)) {
          setPendingEmail(email);
          setUnconfirmedOpen(true);
          return;
        }
        setErr(error.message);
      } else {
        const { error, needsConfirmation } = await signUp(email, password);
        if (error) { setErr(error.message); return; }
        if (needsConfirmation) {
          setPendingEmail(email);
          setMode('signin'); // so they're set up to come back after clicking the link
          return;
        }
        router.push(next);
        router.refresh();
      }
    } catch (x) {
      setErr(x instanceof Error ? x.message : 'Unexpected error');
    } finally {
      setBusy(false);
    }
  };

  const resend = async (target: string) => {
    const { error } = await resendConfirmation(target);
    if (error) toast.error(`Couldn't resend: ${error.message}`);
    else toast.success(`Confirmation link sent to ${target}`);
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-[radial-gradient(circle_at_30%_20%,color-mix(in_oklab,var(--blade)_18%,transparent),transparent_60%)]">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-soft">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-3">
          <BalisongLogo className="h-3.5 w-3.5 text-blade" />
          Flip Tracker
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === 'signin' ? 'Sign in to log a session' : 'Sign up to start tracking tricks'}
        </p>

        {/* Post-signup reminder — sticks around so they can resend if needed. */}
        {pendingEmail && (
          <div className="mt-5 rounded-lg border border-status-mastered/40 bg-status-mastered/10 px-3 py-3 text-sm">
            <div className="flex items-start gap-2.5">
              <Mail className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'var(--status-mastered)' }} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold" style={{ color: 'var(--status-mastered)' }}>
                  Check your email
                </div>
                <p className="mt-1 text-foreground/80 leading-relaxed">
                  We sent a confirmation link to <span className="font-medium">{pendingEmail}</span>.
                  Click it, then sign in.
                </p>
                <button
                  type="button"
                  onClick={() => resend(pendingEmail)}
                  className="mt-2 text-xs font-medium text-blade hover:underline"
                >
                  Resend confirmation email
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="mt-3 grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <Button type="submit" disabled={busy} className="mt-6 w-full bg-blade hover:bg-blade-soft text-background">
          {busy ? '…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
        </Button>

        {err && (
          <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {err}
          </div>
        )}

        <button
          type="button"
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setErr(''); }}
          className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </form>

      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        or continue as guest — data saves locally, sync later by signing in →
      </Link>

      {/* Sign-in-blocked popup: fires when Supabase rejects a sign-in because
          the email hasn't been confirmed yet. */}
      <Dialog open={unconfirmedOpen} onOpenChange={setUnconfirmedOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blade" />
              Confirm your email first
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We sent a confirmation link to <span className="font-medium text-foreground">{pendingEmail ?? email}</span>.
            Click it to verify your account, then come back here to sign in.
          </p>
          <div className="mt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setUnconfirmedOpen(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={async () => { await resend(pendingEmail ?? email); setUnconfirmedOpen(false); }}
              className="bg-blade hover:bg-blade-soft text-white"
            >
              Resend link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
