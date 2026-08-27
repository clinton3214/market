'use client';

import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Loader2, CheckCircle2, XCircle, Clock, Smartphone, Copy, Check } from 'lucide-react';

function OtpStatusContent() {
  const { id } = useParams() as { id: string };
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('pending_payment');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [fullSms, setFullSms] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [copied, setCopied] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const verifyAttemptedRef = useRef(false);

  // Extract Paystack reference from callback URL
  const paystackReference = searchParams.get('reference') || searchParams.get('trxref') || '';

  const applyUpdate = useCallback((data: any) => {
    if (data.status) setStatus(data.status);
    if (data.phone_number) setPhoneNumber(data.phone_number);
    if (data.otp_code) setOtpCode(data.otp_code);
    if (data.full_sms_text) setFullSms(data.full_sms_text);
    if (data.expires_at) setExpiresAt(data.expires_at);
    if (data.error) setError(data.error);
  }, []);

  const isTerminalStatus = useCallback((s: string) => {
    return ['code_delivered', 'completed', 'failed_no_stock', 'failed_timeout', 'refunded'].includes(s);
  }, []);

  // Verify payment with Paystack via our backend and activate the order
  const verifyAndActivate = useCallback(async () => {
    if (verifyAttemptedRef.current || !paystackReference) return;
    verifyAttemptedRef.current = true;

    try {
      const res = await fetch(`/api/otp/verify-and-activate/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: paystackReference }),
      });

      const data = await res.json();

      if (res.ok) {
        applyUpdate(data);
      }
      // If 402 (payment not confirmed yet), the webhook will handle it, or polling will catch up
    } catch (err) {
      console.error('Verify-and-activate failed:', err);
    }
  }, [id, paystackReference, applyUpdate]);

  // Poll the status API as a fallback
  const pollStatus = useCallback(async () => {
    try {
      const localWsToken = localStorage.getItem(`otp_order_${id}`);
      const fetchUrl = localWsToken
        ? `/api/otp/status/${id}?wsToken=${localWsToken}`
        : `/api/otp/status/${id}`;

      const res = await fetch(fetchUrl);
      if (!res.ok) return;

      const data = await res.json();
      applyUpdate(data);

      // Stop polling if we reached a terminal state
      if (isTerminalStatus(data.status)) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }
    } catch (err) {
      // Silently ignore polling errors
    }
  }, [id, applyUpdate, isTerminalStatus]);

  useEffect(() => {
    if (!id) return;

    let socket: Socket | null = null;

    const initialize = async () => {
      try {
        // 1. Fetch initial status
        const localWsToken = localStorage.getItem(`otp_order_${id}`);
        const fetchUrl = localWsToken
          ? `/api/otp/status/${id}?wsToken=${localWsToken}`
          : `/api/otp/status/${id}`;

        const res = await fetch(fetchUrl);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to load order.');
          return;
        }

        applyUpdate(data);

        // 2. If still pending_payment and we have a Paystack reference, verify it
        if (data.status === 'pending_payment' && paystackReference) {
          await verifyAndActivate();
        }

        // 3. Connect WebSocket for live updates
        const wsToken = data.wsToken || localWsToken;
        if (wsToken) {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
            ? `https://${process.env.NEXT_PUBLIC_BACKEND_URL}`
            : 'http://localhost:5000';

          socket = io(backendUrl, {
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
          });
          socketRef.current = socket;

          socket.on('connect', () => {
            socket?.emit('join_order', { orderId: id, wsToken });
          });

          socket.on('status_update', (updateData) => {
            applyUpdate(updateData);

            if (isTerminalStatus(updateData.status)) {
              socket?.disconnect();
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
            }
          });

          socket.on('error', (msg) => {
            setError(typeof msg === 'string' ? msg : 'Connection error');
          });

          socket.on('disconnect', () => {
            // On WS disconnect, start faster polling as fallback (if not terminal)
            if (!pollIntervalRef.current) {
              pollIntervalRef.current = setInterval(pollStatus, 5000);
            }
          });
        }

        // 4. Start a background poll as safety net (every 8s)
        // This catches cases where WebSocket fails entirely
        if (!isTerminalStatus(data.status)) {
          pollIntervalRef.current = setInterval(pollStatus, 8000);
        }
      } catch (err) {
        console.error('Initialization failed', err);
        setError('Network error loading status.');
      }
    };

    initialize();

    return () => {
      if (socket) socket.disconnect();
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const expiry = new Date(expiresAt).getTime();
      const now = Date.now();
      const distance = expiry - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft('Expired');
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const isFailed = ['failed_no_stock', 'failed_timeout', 'refunded'].includes(status);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans flex items-center justify-center">
      <div className="max-w-xl w-full">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-8 text-center space-y-4 bg-zinc-950 border-b border-zinc-800">
            {status === 'code_delivered' ? (
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            ) : isFailed ? (
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            ) : (
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
            )}

            <h1 className="text-2xl font-bold">
              {status === 'pending_payment' && 'Confirming Payment...'}
              {status === 'paid' && 'Payment Confirmed!'}
              {status === 'purchasing' && 'Buying Number...'}
              {['number_assigned', 'awaiting_sms'].includes(status) && 'Waiting for SMS'}
              {status === 'code_delivered' && 'Code Received!'}
              {isFailed && 'Order Failed'}
            </h1>

            {status === 'pending_payment' && (
              <p className="text-zinc-500 text-sm">Verifying your payment with Paystack. This usually takes a few seconds...</p>
            )}

            <p className="text-zinc-400 text-sm">Order ID: {id}</p>
          </div>

          <div className="p-8 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            {phoneNumber && (
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Phone Number</label>
                <div className="flex items-center gap-3 bg-black border border-zinc-800 rounded-lg p-4">
                  <Smartphone className="text-zinc-500" />
                  <span className="text-xl font-mono tracking-widest flex-1">{phoneNumber}</span>
                  <button
                    onClick={() => copyToClipboard(phoneNumber, 'phone')}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors text-xs font-semibold"
                  >
                    {copied === 'phone' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {status === 'awaiting_sms' && (
              <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 animate-pulse" />
                  <span>Time remaining:</span>
                </div>
                <span className="font-mono font-bold text-lg">{timeLeft}</span>
              </div>
            )}

            {fullSms && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4">
                <label className="text-sm text-zinc-400">Received Message</label>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 space-y-4">
                  {otpCode && (
                    <div className="text-center">
                      <span className="text-xs text-green-400 uppercase font-bold tracking-wider mb-1 block">Extracted Code</span>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-4xl font-black text-white tracking-widest">{otpCode}</span>
                        <button
                          onClick={() => copyToClipboard(otpCode, 'otp')}
                          className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                        >
                          {copied === 'otp' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="bg-black/50 p-4 rounded font-mono text-sm text-zinc-300 break-words">
                    {fullSms}
                  </div>
                </div>
              </div>
            )}

            {isFailed && (
              <div className="text-center pt-2">
                <p className="text-zinc-400 text-sm mb-4">Your payment has been automatically refunded.</p>
                <a href="/otp" className="inline-block bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg transition-colors font-medium">
                  Try Again
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OtpStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
        </div>
      }
    >
      <OtpStatusContent />
    </Suspense>
  );
}
