// lib/unifiedPricing.ts
import { selectProviderAndPool } from '@/lib/scoreboard';
import { getSmsPoolPrice, SMSPOOL_SERVICE_IDS, SMSPOOL_COUNTRY_IDS } from '@/lib/smspool';
import { getLivePrice as get5SimPrice } from '@/lib/fiveSim';

export interface UnifiedPriceResult {
  cost_price_usd: number;
  provider: '5sim' | 'smspool';
  pool_or_operator: string;
  country_id?: string | number;
  is_us_v?: boolean;
}

/**
 * Get live cost price from the best provider/pool according to configuration & scoreboard.
 */
export async function getUnifiedLivePrice(
  country: string,
  service: string
): Promise<UnifiedPriceResult | null> {
  const normCountry = country.toLowerCase().trim();
  const normService = service.toLowerCase().trim();

  // 1. Get current decision from scoreboard / config
  const decision = await selectProviderAndPool(normService, normCountry);

  if (decision.provider === 'smspool') {
    const serviceId = SMSPOOL_SERVICE_IDS[normService] || normService;
    const countryId = decision.countryCode || SMSPOOL_COUNTRY_IDS[normCountry] || 1;
    const pool = decision.poolOrOperator || 7;

    const smsPoolData = await getSmsPoolPrice(countryId, serviceId, pool);

    if (smsPoolData && smsPoolData.price > 0) {
      return {
        cost_price_usd: smsPoolData.price,
        provider: 'smspool',
        pool_or_operator: String(smsPoolData.pool || pool),
        country_id: countryId,
        is_us_v: decision.isUsV,
      };
    }

    // Fallback: If SMSPool is out of stock, try 5sim
    console.warn(`[PRICING] SMSPool price unavailable for ${normService}/${normCountry}, trying 5sim fallback...`);
    const fiveSimCost = await get5SimPrice(normCountry, normService);
    if (fiveSimCost !== null) {
      return {
        cost_price_usd: fiveSimCost,
        provider: '5sim',
        pool_or_operator: 'highest_rate',
      };
    }
    return null;
  } else {
    // 5sim is preferred
    const fiveSimCost = await get5SimPrice(normCountry, normService);
    if (fiveSimCost !== null) {
      return {
        cost_price_usd: fiveSimCost,
        provider: '5sim',
        pool_or_operator: 'highest_rate',
      };
    }

    // Fallback: If 5sim is out of stock, try SMSPool
    console.warn(`[PRICING] 5sim out of stock for ${normService}/${normCountry}, trying SMSPool fallback...`);
    const serviceId = SMSPOOL_SERVICE_IDS[normService] || normService;
    const countryId = SMSPOOL_COUNTRY_IDS[normCountry] || 1;
    const smsPoolData = await getSmsPoolPrice(countryId, serviceId, 7);

    if (smsPoolData && smsPoolData.price > 0) {
      return {
        cost_price_usd: smsPoolData.price,
        provider: 'smspool',
        pool_or_operator: String(smsPoolData.pool || '7'),
        country_id: countryId,
      };
    }
    return null;
  }
}
