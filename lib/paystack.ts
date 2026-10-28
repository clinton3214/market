// lib/paystack.ts
// Paystack refund and transaction verification utilities

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

export async function refundPaystackTransaction(
  reference: string,
  amountKobo?: number
): Promise<{ success: boolean; message?: string }> {
  if (!reference) {
    return { success: false, message: 'Missing transaction reference' };
  }

  try {
    const payload: Record<string, any> = { transaction: reference };
    if (amountKobo) {
      payload.amount = amountKobo;
    }

    console.log(`[PAYSTACK REFUND] Initiating refund for reference: ${reference}, amount (kobo): ${amountKobo}`);

    const res = await fetch('https://api.paystack.co/refund', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || !data.status) {
      console.error('[PAYSTACK REFUND FAILED]:', data);
      return { success: false, message: data.message || 'Refund failed' };
    }

    console.log(`[PAYSTACK REFUND SUCCESS] Reference ${reference}: ${data.message}`);
    return { success: true, message: data.message };
  } catch (err: any) {
    console.error('[PAYSTACK REFUND ERROR]:', err.message);
    return { success: false, message: err.message };
  }
}
