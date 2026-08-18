// lib/fiveSim.ts

const FIVESIM_API_KEY = process.env.FIVESIM_API_KEY || '';
const FIVESIM_BASE_URL = 'https://5sim.net/v1';

const getHeaders = () => ({
  'Authorization': `Bearer ${FIVESIM_API_KEY}`,
  'Accept': 'application/json',
});

// Fetch user balance
export async function getFiveSimBalance(): Promise<number> {
  const response = await fetch(`${FIVESIM_BASE_URL}/user/profile`, {
    headers: getHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch 5sim balance: ${response.statusText}`);
  }

  const data = await response.json();
  return data.balance;
}

// Fetch live price for a service/country
export async function getLivePrice(country: string, product: string): Promise<number | null> {
  // We use guest prices endpoint for general availability check
  const response = await fetch(`${FIVESIM_BASE_URL}/guest/prices?country=${country}&product=${product}`, {
    headers: { 'Accept': 'application/json' },
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`5sim prices API error details (URL: ${FIVESIM_BASE_URL}/guest/prices?country=${country}&product=${product}):`, errorText);
    throw new Error(`Failed to fetch 5sim prices: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  
  if (data[country] && data[country][product]) {
    // 5sim groups by operator (e.g., 'any', 'virtual', etc.)
    // We just find the cheapest or first available
    const operators = data[country][product];
    let cheapest = null;

    for (const op in operators) {
      if (operators[op].count > 0) {
        if (cheapest === null || operators[op].cost < cheapest) {
          cheapest = operators[op].cost;
        }
      }
    }
    return cheapest; // cheapest price if available, else null
  }

  return null; // Not available
}

// Buy a number
export async function buyNumber(country: string, product: string, operator: string = 'any') {
  const response = await fetch(`${FIVESIM_BASE_URL}/user/buy/activation/${country}/${operator}/${product}`, {
    method: 'GET', // 5sim uses GET for buy requests, oddly enough, but let's be careful. Wait, 5sim API v1 uses GET for buy.
    headers: getHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    let errorText = await response.text();
    throw new Error(`5sim Buy Failed: ${errorText}`);
  }

  return await response.json();
  // Returns: { id: 1234, phone: '+123456', operator: 'any', product: 'whatsapp', price: 10, status: 'PENDING', expires: '...', sms: [] }
}

// Check status
export async function checkOrderStatus(orderId: number) {
  const response = await fetch(`${FIVESIM_BASE_URL}/user/check/${orderId}`, {
    method: 'GET',
    headers: getHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to check 5sim order: ${response.statusText}`);
  }

  return await response.json();
}

// Cancel order
export async function cancelOrder(orderId: number) {
  const response = await fetch(`${FIVESIM_BASE_URL}/user/cancel/${orderId}`, {
    method: 'GET',
    headers: getHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    const text = await response.text();
    // It might return something like "Order not found" or "Order already finished"
    console.error(`Failed to cancel 5sim order ${orderId}: ${text}`);
    return null;
  }

  return await response.json();
}
