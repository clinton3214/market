// lib/scoreboard.ts
import dbConnect from '@/lib/mongodb';
import ProviderScoreboard from '@/models/ProviderScoreboard';
import { providerConfig, getDefaultProvider, ProviderPoolConfig } from '@/lib/providerConfig';

export interface SelectionDecision {
  provider: '5sim' | 'smspool';
  poolOrOperator: string;
  countryCode?: string | number; // e.g. 22 for US_V, 1 for US on SMSPool
  isUsV?: boolean;
  reason: string;
}

/**
 * Intelligent Provider and Pool Selector
 * Evaluates the last 50 historical order results for the given service.
 */
export async function selectProviderAndPool(
  service: string,
  country: string
): Promise<SelectionDecision> {
  await dbConnect();

  const normService = service.toLowerCase().trim();
  const normCountry = country.toLowerCase().trim();

  // Check if there is a specific route defined in providerConfig
  const customRoute = providerConfig.routes[normService]?.[normCountry];

  // 1. Fetch the last 50 completed results for this service
  const recentRecords = await ProviderScoreboard.find({
    service: normService,
    code_arrived: { $ne: null },
  })
    .sort({ time_bought: -1 })
    .limit(providerConfig.scoreboardThreshold)
    .lean();

  const totalResults = recentRecords.length;

  // Handle Telegram on United States (US_V vs Fallback rule)
  if (normService === 'telegram' && (normCountry === 'usa' || normCountry === 'us' || normCountry === 'unitedstates')) {
    const defaultPrimary = customRoute?.primary || {
      provider: 'smspool',
      countryCode: 22,
      pool: 7,
    };
    const defaultFallback = customRoute?.fallback || {
      provider: 'smspool',
      countryCode: 1,
      pool: 7,
    };

    // "The scoreboard can switch away from US_V for Telegram only if the last 50 results show it doing clearly worse than the fallback. Log every switch."
    if (totalResults >= providerConfig.scoreboardThreshold) {
      const usVirtualRecords = recentRecords.filter((r) => r.is_us_v === true);
      const usFallbackRecords = recentRecords.filter((r) => r.is_us_v === false && (r.country === 'usa' || r.country === 'us'));

      if (usVirtualRecords.length >= 15 && usFallbackRecords.length >= 10) {
        const virtualSuccesses = usVirtualRecords.filter((r) => r.code_arrived === true).length;
        const virtualRate = (virtualSuccesses / usVirtualRecords.length) * 100;

        const fallbackSuccesses = usFallbackRecords.filter((r) => r.code_arrived === true).length;
        const fallbackRate = (fallbackSuccesses / usFallbackRecords.length) * 100;

        // Clearly worse: fallback success rate exceeds virtual by more than 15 percentage points
        if (virtualRate < fallbackRate - 15) {
          console.warn(
            `[SCOREBOARD SWITCH] Switching Telegram US from US_V to fallback US: US_V success rate ${virtualRate.toFixed(1)}% (${virtualSuccesses}/${usVirtualRecords.length}) is clearly worse than fallback ${fallbackRate.toFixed(1)}% (${fallbackSuccesses}/${usFallbackRecords.length})`
          );
          return {
            provider: defaultFallback.provider,
            poolOrOperator: String(defaultFallback.pool || '7'),
            countryCode: defaultFallback.countryCode,
            isUsV: false,
            reason: `Scoreboard switch: US_V (${virtualRate.toFixed(1)}%) doing clearly worse than fallback (${fallbackRate.toFixed(1)}%) over recent history.`,
          };
        }
      }
    }

    // Default to US_V
    const decision: SelectionDecision = {
      provider: defaultPrimary.provider,
      poolOrOperator: String(defaultPrimary.pool || '7'),
      countryCode: defaultPrimary.countryCode,
      isUsV: true,
      reason: `Default US_V route for Telegram US (Pool: ${defaultPrimary.pool || '7'}, CountryID: 22). US_V has not shown clearly worse performance.`,
    };
    console.log(`[PROVIDER & POOL PICKED] Order for ${service}/${country} -> ${decision.provider} (US_V, Pool: ${decision.poolOrOperator}). Reason: ${decision.reason}`);
    return decision;
  }

  // 2. Until there are enough results (50), use the default config
  if (totalResults < providerConfig.scoreboardThreshold) {
    let provider: '5sim' | 'smspool';
    let poolOrOperator = 'default';
    let countryCode: string | number | undefined;

    if (customRoute) {
      provider = customRoute.primary.provider;
      poolOrOperator = String(customRoute.primary.pool || customRoute.primary.operator || '7');
      countryCode = customRoute.primary.countryCode;
    } else {
      provider = getDefaultProvider(normService);
      poolOrOperator = provider === 'smspool' ? '7' : 'best_rate';
    }

    const decision: SelectionDecision = {
      provider,
      poolOrOperator,
      countryCode,
      reason: `Default configuration used (${totalResults}/${providerConfig.scoreboardThreshold} historical results for ${normService}).`,
    };
    console.log(`[PROVIDER & POOL PICKED] Order for ${service}/${country} -> ${decision.provider} (${decision.poolOrOperator}). Reason: ${decision.reason}`);
    return decision;
  }

  // 3. 50+ results available: Calculate success rates per provider
  const stats: Record<string, { total: number; success: number }> = {};

  for (const record of recentRecords) {
    const key = `${record.provider}::${record.pool_or_operator}`;
    if (!stats[key]) {
      stats[key] = { total: 0, success: 0 };
    }
    stats[key].total += 1;
    if (record.code_arrived === true) {
      stats[key].success += 1;
    }
  }

  const options = Object.keys(stats).map((key) => {
    const [p, poolOp] = key.split('::');
    const item = stats[key];
    const rate = (item.success / item.total) * 100;
    return { provider: p as '5sim' | 'smspool', poolOrOperator: poolOp, rate, total: item.total };
  });

  options.sort((a, b) => b.rate - a.rate);

  // 4. Exploration (1 in 10 orders = 10%)
  const isExploration = Math.random() < providerConfig.explorationRate;
  if (isExploration && options.length > 1) {
    // Pick the alternative option to keep fresh telemetry
    const alternate = options[options.length - 1];
    const decision: SelectionDecision = {
      provider: alternate.provider,
      poolOrOperator: alternate.poolOrOperator,
      reason: `Exploration pick (1 in 10 orders) to keep provider stats fresh. Alternate ${alternate.provider} (${alternate.poolOrOperator}) selected with historical rate ${alternate.rate.toFixed(1)}%.`,
    };
    console.log(`[PROVIDER & POOL PICKED] Order for ${service}/${country} -> ${decision.provider} (${decision.poolOrOperator}). Reason: ${decision.reason}`);
    return decision;
  }

  // 5. Exploitation: Pick option with highest historical success rate
  const best = options[0];
  const decision: SelectionDecision = {
    provider: best.provider,
    poolOrOperator: best.poolOrOperator,
    reason: `Scoreboard winner: ${best.provider} (${best.poolOrOperator}) has best success rate of ${best.rate.toFixed(1)}% across ${best.total} recent orders.`,
  };
  console.log(`[PROVIDER & POOL PICKED] Order for ${service}/${country} -> ${decision.provider} (${decision.poolOrOperator}). Reason: ${decision.reason}`);
  return decision;
}

/**
 * Record a new order purchase attempt in the scoreboard
 */
export async function recordScoreboardAttempt(data: {
  orderId: any;
  attemptNumber: number;
  provider: '5sim' | 'smspool';
  poolOrOperator: string;
  service: string;
  country: string;
  isUsV?: boolean;
  providerOrderId?: string;
  phoneNumber?: string;
  costUsd?: number;
}): Promise<any> {
  await dbConnect();
  try {
    const doc = await ProviderScoreboard.create({
      order_id: data.orderId,
      attempt_number: data.attemptNumber,
      provider: data.provider,
      pool_or_operator: data.poolOrOperator,
      service: data.service.toLowerCase(),
      country: data.country.toLowerCase(),
      is_us_v: !!data.isUsV,
      time_bought: new Date(),
      code_arrived: null, // Pending
      provider_order_id: data.providerOrderId,
      phone_number: data.phoneNumber,
      cost_usd: data.costUsd,
    });
    return doc;
  } catch (err: any) {
    console.error('[SCOREBOARD] Failed to record attempt:', err.message);
    return null;
  }
}

/**
 * Update the attempt outcome when code arrives or times out
 */
export async function finalizeScoreboardAttempt(
  attemptId: any,
  success: boolean,
  notes?: string,
  cancellationRefunded = false
) {
  if (!attemptId) return;
  await dbConnect();
  try {
    await ProviderScoreboard.findByIdAndUpdate(attemptId, {
      $set: {
        code_arrived: success,
        code_arrived_at: success ? new Date() : undefined,
        cancellation_refunded: cancellationRefunded,
        notes: notes || '',
      },
    });
  } catch (err: any) {
    console.error('[SCOREBOARD] Failed to update attempt outcome:', err.message);
  }
}
