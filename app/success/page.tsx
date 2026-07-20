'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function SuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    if (reference) {
      verifyTransaction(reference);
    } else {
      setError("No transaction reference found.");
      setLoading(false);
    }
  }, [reference]);

  const verifyTransaction = async (ref: string) => {
    try {
      const res = await fetch(`/api/verify-transaction?reference=${encodeURIComponent(ref)}`);
      const data = await res.json();
      
      if (res.ok && data.success) {
        setDetails(data);
      } else {
        setError(data.error || "Failed to verify transaction.");
      }
    } catch (err) {
      setError("A network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTxt = () => {
    if (!details) return;
    
    const creds = details.credentials;
    const textContent = `
--- ACCOUNT ACCESS DETAILS ---
Platform: ${details.platform} (${details.handle})

Account Username: ${creds.accountUsername || details.handle}
Account Password: ${creds.accountPassword || 'N/A'}
Associated Email: ${creds.accountEmail || 'N/A'}
Email Password: ${creds.emailPassword || 'N/A'}

Thank you for your purchase via Travis Pay!
------------------------------
    `.trim();

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${details.platform}_${details.handle}_credentials.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium text-foreground">Verifying payment...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-secondary/30 p-8 rounded-2xl border border-destructive/20 text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Verification Failed</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-secondary/30 p-8 rounded-2xl border border-border text-center backdrop-blur-xl">
        <CheckCircle2 className="h-16 w-16 text-status-green mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-8">
          Your account credentials are ready. We have also emailed a copy to you.
        </p>

        <div className="bg-background border border-border rounded-xl p-4 text-left mb-6 font-mono text-sm overflow-hidden">
          <p className="text-muted-foreground mb-4 font-sans text-xs uppercase tracking-wider">Secure Credentials</p>
          <div className="space-y-3">
            <div>
              <span className="text-muted-foreground">Username:</span>
              <p className="text-foreground break-all">{details.credentials.accountUsername || details.handle}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Password:</span>
              <p className="text-foreground break-all">{details.credentials.accountPassword || 'N/A'}</p>
            </div>
            <hr className="border-border/50" />
            <div>
              <span className="text-muted-foreground">Email:</span>
              <p className="text-foreground break-all">{details.credentials.accountEmail || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Email Password:</span>
              <p className="text-foreground break-all">{details.credentials.emailPassword || 'N/A'}</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleDownloadTxt}
          className="w-full bg-gradient-to-r from-primary to-chart-4 text-primary-foreground font-semibold py-6 rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
        >
          <Download className="h-5 w-5" />
          Download .txt File
        </Button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
