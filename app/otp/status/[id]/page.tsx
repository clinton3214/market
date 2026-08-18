'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Loader2, CheckCircle2, XCircle, Clock, Smartphone, Copy } from 'lucide-react';

export default function OtpStatusPage() {
  const { id } = useParams() as { id: string };
  const [status, setStatus] = useState('pending_payment');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [fullSms, setFullSms] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!id) return;
    
    // Retrieve the token saved before checkout
    const wsToken = localStorage.getItem(`otp_order_${id}`);
    if (!wsToken) {
      setError("No authorization token found for this order. It may have been started on another device.");
      return;
    }

    // Connect to WebSocket server (server.js on port 5000)
    // If NEXT_PUBLIC_BACKEND_URL is set, use that, else assume same host on port 5000
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL 
      ? `https://${process.env.NEXT_PUBLIC_BACKEND_URL}` 
      : 'http://localhost:5000';

    const socket = io(backendUrl);
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_order', { orderId: id, wsToken });
    });

    socket.on('status_update', (data) => {
      if (data.error) setError(data.error);
      if (data.status) setStatus(data.status);
      if (data.phone_number) setPhoneNumber(data.phone_number);
      if (data.otp_code) setOtpCode(data.otp_code);
      if (data.full_sms_text) setFullSms(data.full_sms_text);
      if (data.expires_at) setExpiresAt(data.expires_at);
      
      if (['code_delivered', 'completed', 'failed_no_stock', 'failed_timeout', 'refunded'].includes(data.status)) {
        socket.disconnect(); // Terminate connection if terminal state
      }
    });

    socket.on('error', (msg) => {
      setError(msg);
      // Fallback to REST API if WS fails auth but REST might work (e.g., token ok but WS blocked)
      fetchStatusFallback(wsToken);
    });

    socket.on('disconnect', () => {
      // WS dropped, let's poll fallback once just to be sure we have latest state
      fetchStatusFallback(wsToken);
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const fetchStatusFallback = async (token: string) => {
    try {
      const res = await fetch(`/api/otp/status/${id}?wsToken=${token}`);
      const data = await res.json();
      if (res.ok) {
        setStatus(data.status);
        if (data.phone_number) setPhoneNumber(data.phone_number);
        if (data.otp_code) setOtpCode(data.otp_code);
        if (data.full_sms_text) setFullSms(data.full_sms_text);
        if (data.expires_at) setExpiresAt(data.expires_at);
      }
    } catch (err) {
      console.error("Fallback fetch failed", err);
    }
  };

  useEffect(() => {
    if (!expiresAt) return;
    
    const interval = setInterval(() => {
      const expiry = new Date(expiresAt).getTime();
      const now = new Date().getTime();
      const distance = expiry - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("Expired");
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const isTerminal = ['code_delivered', 'completed', 'failed_no_stock', 'failed_timeout', 'refunded'].includes(status);
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
              {status === 'pending_payment' && 'Awaiting Payment...'}
              {status === 'paid' && 'Payment Received'}
              {status === 'purchasing' && 'Buying Number...'}
              {['number_assigned', 'awaiting_sms'].includes(status) && 'Waiting for SMS'}
              {status === 'code_delivered' && 'Code Received!'}
              {isFailed && 'Order Failed'}
            </h1>
            
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
                    onClick={() => copyToClipboard(phoneNumber)}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors text-xs font-semibold"
                  >
                    <Copy className="w-4 h-4" />
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
                      <span className="text-4xl font-black text-white tracking-widest">{otpCode}</span>
                    </div>
                  )}
                  <div className="bg-black/50 p-4 rounded font-mono text-sm text-zinc-300 break-words">
                    {fullSms}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
