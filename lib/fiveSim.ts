// lib/fiveSim.ts
// 5sim API Client with smart operator selection based on highest delivery rate

const FIVESIM_API_KEY = process.env.FIVESIM_API_KEY || '';
const FIVESIM_BASE_URL = 'https://5sim.net/v1';

const getHeaders = () => ({
  'Authorization': `Bearer ${FIVESIM_API_KEY}`,
  'Accept': 'application/json',
});

export interface FiveSimOperatorOption {
  operator: string;
  cost: number;
  count: number;
  rate: number; // Historical SMS delivery success rate percentage (0-100%)
}

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

/**
 * Inspect guest prices and pick the operator with the highest success rate that has stock.
 * As strictly instructed: DO NOT USE "any".
 */
export async function getBest5SimOperator(
  country: string, 
  product: string, 
  minStock = 1
): Promise<FiveSimOperatorOption | null> {
  const response = await fetch(`${FIVESIM_BASE_URL}/guest/prices?country=${country}&product=${product}`, {
    headers: { 'Accept': 'application/json' },
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`5sim prices API error details:`, errorText);
    return null;
  }

  const data = await response.json();
  if (!data[country] || !data[country][product]) {
    return null;
  }

  const operators = data[country][product];
  const candidates: FiveSimOperatorOption[] = [];

  for (const op in operators) {
    // Strictly do not use 'any'
    if (op.toLowerCase() === 'any') continue;

    const info = operators[op];
    if (info.count >= minStock) {
      candidates.push({
        operator: op,
        cost: info.cost,
        count: info.count,
        rate: info.rate !== undefined ? info.rate : 0, // rate = success rate %
      });
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  // Sort by highest rate (success rate), then lowest cost as tie-breaker
  candidates.sort((a, b) => {
    if (b.rate !== a.rate) {
      return b.rate - a.rate; // Descending by rate
    }
    return a.cost - b.cost; // Ascending by price
  });

  const best = candidates[0];
  console.log(
    `[5sim OPERATOR SELECTION] Country: ${country}, Product: ${product} -> Picked '${best.operator}' (Rate: ${best.rate}%, Stock: ${best.count}, Cost: $${best.cost})`
  );
  return best;
}

// Fetch live price for a service/country
export async function getLivePrice(country: string, product: string): Promise<number | null> {
  const best = await getBest5SimOperator(country, product);
  if (best) {
    return best.cost;
  }
  return null;
}

// Buy a number from 5sim using the highest-rate operator (NEVER 'any')
export async function buyNumber(country: string, product: string, operator?: string) {
  let targetOperator = operator;

  if (!targetOperator || targetOperator.toLowerCase() === 'any') {
    const best = await getBest5SimOperator(country, product);
    if (!best) {
      throw new Error(`No 5sim stock available for ${country} / ${product} with verified operator`);
    }
    targetOperator = best.operator;
  }

  console.log(
    `[5sim BUY REQUEST] Buying ${product} in ${country} from operator '${targetOperator}'`
  );

  const response = await fetch(
    `${FIVESIM_BASE_URL}/user/buy/activation/${country}/${targetOperator}/${product}`,
    {
      method: 'GET',
      headers: getHeaders(),
      cache: 'no-store'
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`5sim Buy Failed: ${errorText}`);
  }

  const result = await response.json();
  console.log(
    `[5sim BUY SUCCESS] Order ID: ${result.id}, Phone: ${result.phone}, Operator: ${result.operator}, Price: $${result.price}`
  );
  return result;
}

// Check status of order
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

// Finalize/finish 5sim order upon receiving SMS
export async function finishOrder(orderId: number) {
  try {
    const response = await fetch(`${FIVESIM_BASE_URL}/user/finish/${orderId}`, {
      method: 'GET',
      headers: getHeaders(),
      cache: 'no-store'
    });
    return response.ok;
  } catch (err) {
    console.error(`Error finishing 5sim order ${orderId}:`, err);
    return false;
  }
}

// Cancel 5sim order and confirm refund
export async function cancelOrder(orderId: number): Promise<{ success: boolean; status?: string; refunded: boolean }> {
  try {
    const response = await fetch(`${FIVESIM_BASE_URL}/user/cancel/${orderId}`, {
      method: 'GET',
      headers: getHeaders(),
      cache: 'no-store'
    });

    if (!response.ok) {
      console.warn(`[5sim CANCEL FAILED] Status: ${response.statusText}`);
      return { success: false, refunded: false };
    }

    const data = await response.json();
    const isCanceled = data.status === 'CANCELED';
    console.log(
      `[5sim CANCEL RESULT] Order ${orderId}: status=${data.status}, refunded=${isCanceled}`
    );
    return {
      success: true,
      status: data.status,
      refunded: isCanceled
    };
  } catch (err: any) {
    console.error(`[5sim CANCEL ERROR] Order ${orderId}:`, err.message);
    return { success: false, refunded: false };
  }
}
