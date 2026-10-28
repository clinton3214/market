// lib/smspool.ts
// Official SMSPool API client verified against api.smspool.net OpenAPI spec

const SMSPOOL_API_KEY = process.env.SMSPOOL_API_KEY || '11LrpV8nk3xUPBlflnykrEbytST8snuG';
const SMSPOOL_BASE_URL = 'https://api.smspool.net';

export interface SmsPoolPurchaseParams {
  country: string | number; // Country ID (e.g. 22 for US_V, 1 for US)
  service: string | number; // Service ID or name (e.g. 907 for Telegram)
  pool: string | number; // Pool ID or name (always provided as instructed)
  maxPrice?: number;
  pricingOption?: number; // 0 for cheapest, 1 for highest success rate
}

export interface SmsPoolPurchaseResponse {
  success: number;
  number?: string | number;
  phonenumber?: string;
  cc?: string;
  order_id?: string;
  country?: string;
  service?: string;
  pool?: number | string;
  cost?: string;
  cost_in_cents?: number;
  message?: string;
  type?: string;
}

export interface SmsPoolCheckResponse {
  status: number; // 1 = pending, 3 = complete (code received), 6 = refunded
  sms?: string;
  full_sms?: string;
  time_left?: number;
  expiration?: number;
  message?: string;
}

export interface SmsPoolCancelResponse {
  success: number;
  message: string;
}

// Map service names to SMSPool service IDs
export const SMSPOOL_SERVICE_IDS: Record<string, number> = {
  telegram: 907,
  microsoft: 1072,
  whatsapp: 1012,
  openai: 489,
  google: 395,
  discord: 398,
  twitter: 400,
  tiktok: 405,
  facebook: 397,
  instagram: 410,
};

// Map country names to SMSPool country IDs
export const SMSPOOL_COUNTRY_IDS: Record<string, number> = {
  usa: 1,
  us: 1,
  'united states': 1,
  us_v: 22,
  'united states (virtual)': 22,
  england: 2,
  uk: 2,
  'united kingdom': 2,
  canada: 3,
  netherlands: 5,
  germany: 7,
  france: 6,
  spain: 8,
  sweden: 9,
  india: 10,
  indonesia: 11,
  nigeria: 24,
};

function getHeaders() {
  return {
    Authorization: `Bearer ${SMSPOOL_API_KEY}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
  };
}

/**
 * Fetch user balance from SMSPool
 */
export async function getSmsPoolBalance(): Promise<number> {
  const res = await fetch(`${SMSPOOL_BASE_URL}/request/balance`, {
    method: 'GET',
    headers: getHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`SMSPool balance check failed: ${res.statusText}`);
  }

  const data = await res.json();
  return parseFloat(data.balance || '0');
}

/**
 * Query price and official success rate from SMSPool
 */
export async function getSmsPoolPrice(
  country: string | number,
  service: string | number,
  pool?: string | number
): Promise<{ price: number; success_rate?: number; pool?: number } | null> {
  try {
    const params = new URLSearchParams({
      country: String(country),
      service: String(service),
    });
    if (pool !== undefined && pool !== null) {
      params.append('pool', String(pool));
    }

    const res = await fetch(`${SMSPOOL_BASE_URL}/request/price`, {
      method: 'POST',
      headers: getHeaders(),
      body: params.toString(),
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return {
      price: parseFloat(data.price || '0'),
      success_rate: data.success_rate !== undefined ? parseInt(data.success_rate, 10) : undefined,
      pool: data.pool,
    };
  } catch (err) {
    console.error('Error fetching SMSPool price:', err);
    return null;
  }
}

/**
 * Purchase a number from SMSPool
 * ALWAYS sends pool and max_price as strictly instructed
 */
export async function buySmsPoolNumber(
  params: SmsPoolPurchaseParams
): Promise<SmsPoolPurchaseResponse> {
  const form = new URLSearchParams();
  form.append('country', String(params.country));
  form.append('service', String(params.service));

  // Mandatory: Always send pool parameter
  if (params.pool !== undefined && params.pool !== null) {
    form.append('pool', String(params.pool));
  } else {
    // Default fallback pool: 7 (Foxtrot)
    form.append('pool', '7');
  }

  // Mandatory: Send max_price so we never pay more than limit
  if (params.maxPrice !== undefined) {
    form.append('max_price', String(params.maxPrice));
  }

  if (params.pricingOption !== undefined) {
    form.append('pricing_option', String(params.pricingOption));
  }

  console.log(
    `[SMSPool BUY REQUEST] Country: ${params.country}, Service: ${params.service}, Pool: ${params.pool}, MaxPrice: ${params.maxPrice}`
  );

  const res = await fetch(`${SMSPOOL_BASE_URL}/purchase/sms`, {
    method: 'POST',
    headers: getHeaders(),
    body: form.toString(),
    cache: 'no-store',
  });

  const data: SmsPoolPurchaseResponse = await res.json();

  if (!res.ok || data.success !== 1) {
    const errMsg = data.message || JSON.stringify(data);
    console.error(`[SMSPool BUY FAILED] Status ${res.status}:`, errMsg);
    throw new Error(`SMSPool purchase failed: ${errMsg}`);
  }

  console.log(
    `[SMSPool BUY SUCCESS] OrderID: ${data.order_id}, Phone: +${data.cc}${data.phonenumber}, Pool: ${data.pool}, Cost: $${data.cost}`
  );
  return data;
}

/**
 * Check order status on SMSPool
 * Status: 1 = pending, 3 = complete (code ready), 6 = refunded
 */
export async function checkSmsPoolStatus(orderId: string): Promise<SmsPoolCheckResponse> {
  const form = new URLSearchParams({ orderid: orderId });
  const res = await fetch(`${SMSPOOL_BASE_URL}/sms/check`, {
    method: 'POST',
    headers: getHeaders(),
    body: form.toString(),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`SMSPool check failed for order ${orderId}: ${res.statusText}`);
  }

  return await res.json();
}

/**
 * Cancel an order on SMSPool
 * Returns refund confirmation. Retries if temporarily locked ("order cannot be cancelled yet").
 */
export async function cancelSmsPoolOrder(
  orderId: string,
  retries = 3
): Promise<{ success: boolean; refunded: boolean; message: string }> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const form = new URLSearchParams({ orderid: orderId });
      const res = await fetch(`${SMSPOOL_BASE_URL}/sms/cancel`, {
        method: 'POST',
        headers: getHeaders(),
        body: form.toString(),
        cache: 'no-store',
      });

      const data: SmsPoolCancelResponse = await res.json();

      if (data && data.success === 1) {
        console.log(`[SMSPool CANCEL SUCCESS] Order ${orderId}: ${data.message}`);
        return {
          success: true,
          refunded: true,
          message: data.message,
        };
      }

      // Check if order cannot be cancelled yet (cooldown active)
      if (data && data.message && data.message.includes('cannot be cancelled yet')) {
        console.warn(
          `[SMSPool CANCEL COOLDOWN] Order ${orderId} cannot be cancelled yet (Attempt ${attempt}/${retries}). Waiting 5 seconds...`
        );
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 5000));
          continue;
        }
      }

      console.warn(`[SMSPool CANCEL FAILED] Order ${orderId}: ${data.message || JSON.stringify(data)}`);
      return {
        success: false,
        refunded: false,
        message: data.message || 'Cancel failed',
      };
    } catch (err: any) {
      console.error(`[SMSPool CANCEL ERROR] Order ${orderId} Attempt ${attempt}:`, err.message);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  return {
    success: false,
    refunded: false,
    message: 'Max cancellation retries reached',
  };
}
