// lib/autoRetryEngine.ts
// Automatic provider and pool selection with auto cancel/retry for number purchases

import dbConnect from '@/lib/mongodb';
import OtpOrder from '@/models/OtpOrder';
import { providerConfig } from '@/lib/providerConfig';
import { selectProviderAndPool, recordScoreboardAttempt, finalizeScoreboardAttempt } from '@/lib/scoreboard';
import {
  buySmsPoolNumber,
  checkSmsPoolStatus,
  cancelSmsPoolOrder,
  SMSPOOL_SERVICE_IDS,
  SMSPOOL_COUNTRY_IDS,
} from '@/lib/smspool';
import {
  buyNumber as buy5SimNumber,
  checkOrderStatus as check5SimStatus,
  cancelOrder as cancel5SimOrder,
  finishOrder as finish5SimOrder,
  getBest5SimOperator,
} from '@/lib/fiveSim';
import { refundPaystackTransaction } from '@/lib/paystack';

export interface EmitStatusFn {
  (orderId: string, payload: any): void;
}

/**
 * Execute OTP purchase with automatic provider/pool selection and auto cancel/retry.
 * Up to 3 attempts. Customer is charged only once.
 */
export async function executeOrderWithAutoRetry(
  orderId: string,
  emitStatus?: EmitStatusFn
): Promise<boolean> {
  await dbConnect();

  const order = await OtpOrder.findById(orderId);
  if (!order) {
    console.error(`[AUTO-RETRY] Order ${orderId} not found`);
    return false;
  }

  // Ensure order is in a processing state
  if (!['paid', 'purchasing'].includes(order.status)) {
    console.log(`[AUTO-RETRY] Order ${orderId} already processed (status: ${order.status})`);
    return false;
  }

  const service = order.service.toLowerCase().trim();
  const country = order.country.toLowerCase().trim();
  const maxRetries = providerConfig.maxRetries || 3;
  const timeoutSeconds = providerConfig.timeoutSeconds || 120; // 2 minutes

  console.log(
    `[AUTO-RETRY START] Order ${orderId}: Service '${service}', Country '${country}'. Max attempts: ${maxRetries}, Timeout per attempt: ${timeoutSeconds}s`
  );

  let lastDecision: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`\n--- [AUTO-RETRY] ORDER ${orderId} ATTEMPT ${attempt} of ${maxRetries} ---`);

    // 1. SELECT PROVIDER AND POOL
    let decision: any;

    if (attempt === 1) {
      // Pick best option using historical scoreboard / config
      decision = await selectProviderAndPool(service, country);
    } else {
      // Fallback logic for retry attempts:
      // If attempt 1 used SMSPool with US_V (country 22), retry with regular US (country 1)
      if (lastDecision?.provider === 'smspool' && lastDecision?.isUsV) {
        decision = {
          provider: 'smspool',
          poolOrOperator: '7',
          countryCode: 1, // Regular US fallback
          isUsV: false,
          reason: `Attempt ${attempt} fallback: switching from US_V to regular US pool on SMSPool.`,
        };
      } else if (lastDecision?.provider === 'smspool') {
        // Fallback from SMSPool to 5sim
        decision = {
          provider: '5sim',
          poolOrOperator: 'best_rate',
          reason: `Attempt ${attempt} fallback: switching from SMSPool to 5sim.`,
        };
      } else {
        // Fallback from 5sim to SMSPool
        decision = {
          provider: 'smspool',
          poolOrOperator: '7',
          countryCode: SMSPOOL_COUNTRY_IDS[country] || 1,
          reason: `Attempt ${attempt} fallback: switching from 5sim to SMSPool.`,
        };
      }
      console.log(
        `[PROVIDER & POOL PICKED] Order ${orderId} Attempt ${attempt} -> ${decision.provider} (${decision.poolOrOperator}). Reason: ${decision.reason}`
      );
    }

    lastDecision = decision;

    // 2. PURCHASE FROM CHOSEN PROVIDER
    let assignedPhone = '';
    let providerOrderId = '';
    let providerCostUsd = 0;
    let purchaseSuccess = false;

    try {
      if (decision.provider === 'smspool') {
        // Resolve SMSPool parameters
        const countryId = decision.countryCode || SMSPOOL_COUNTRY_IDS[country] || 1;
        const serviceId = SMSPOOL_SERVICE_IDS[service] || service;
        const pool = decision.poolOrOperator || 7;

        const smsPoolResult = await buySmsPoolNumber({
          country: countryId,
          service: serviceId,
          pool,
          maxPrice: providerConfig.maxPriceUsd,
          pricingOption: 1, // 1 for highest success rate
        });

        if (smsPoolResult.success === 1 && smsPoolResult.order_id) {
          purchaseSuccess = true;
          providerOrderId = String(smsPoolResult.order_id);
          assignedPhone = `+${smsPoolResult.cc || ''}${smsPoolResult.phonenumber}`;
          providerCostUsd = parseFloat(smsPoolResult.cost || '0');
        }
      } else {
        // 5sim purchase
        let operator = decision.poolOrOperator;
        if (!operator || operator === 'best_rate' || operator === 'any') {
          const bestOp = await getBest5SimOperator(country, service);
          operator = bestOp?.operator || 'virtual';
        }

        const fiveSimResult = await buy5SimNumber(country, service, operator);
        if (fiveSimResult && fiveSimResult.id) {
          purchaseSuccess = true;
          providerOrderId = String(fiveSimResult.id);
          assignedPhone = fiveSimResult.phone;
          providerCostUsd = fiveSimResult.price;
        }
      }
    } catch (buyError: any) {
      console.error(
        `[AUTO-RETRY] Purchase failed on attempt ${attempt} with ${decision.provider}:`,
        buyError.message
      );
      // If purchase failed immediately (e.g. out of stock), try next attempt right away
      continue;
    }

    if (!purchaseSuccess || !assignedPhone) {
      console.warn(`[AUTO-RETRY] Could not acquire number on attempt ${attempt}. Retrying...`);
      continue;
    }

    // 3. NUMBER ACQUIRED -> UPDATE ORDER AND RECORD IN SCOREBOARD
    const expiresAt = new Date(Date.now() + timeoutSeconds * 1000);

    order.status = 'awaiting_sms';
    order.phone_number = assignedPhone;
    order.expires_at = expiresAt;
    order.provider = decision.provider;
    order.pool_or_operator = decision.poolOrOperator;
    order.attempt_count = attempt;

    if (decision.provider === '5sim') {
      order.five_sim_order_id = parseInt(providerOrderId, 10);
      order.smspool_order_id = undefined;
    } else {
      order.smspool_order_id = providerOrderId;
      order.five_sim_order_id = undefined;
    }
    order.state_transitions.push({
      status: 'awaiting_sms',
      timestamp: new Date(),
      note: `Attempt ${attempt}/${maxRetries} using ${decision.provider} (${decision.poolOrOperator}). Phone: ${assignedPhone}`,
    });
    await order.save();

    // Record scoreboard entry
    const scoreboardDoc = await recordScoreboardAttempt({
      orderId: order._id,
      attemptNumber: attempt,
      provider: decision.provider,
      poolOrOperator: decision.poolOrOperator,
      service,
      country,
      isUsV: decision.isUsV,
      providerOrderId,
      phoneNumber: assignedPhone,
      costUsd: providerCostUsd,
    });

    // Notify client via callback or socket
    if (emitStatus) {
      emitStatus(orderId, {
        status: 'awaiting_sms',
        phone_number: assignedPhone,
        expires_at: expiresAt,
        attempt,
        max_attempts: maxRetries,
      });
    }

    // 4. WAIT & POLL FOR SMS CODE (up to timeoutSeconds)
    console.log(
      `[AUTO-RETRY] Polling for SMS on ${assignedPhone} (expires in ${timeoutSeconds}s)...`
    );

    let codeReceived = false;
    let smsCode = '';
    let fullSmsText = '';

    const pollStartTime = Date.now();
    const pollEndTime = pollStartTime + timeoutSeconds * 1000;

    while (Date.now() < pollEndTime) {
      await new Promise((r) => setTimeout(r, 3500)); // Poll every 3.5 seconds

      // Check if order was cancelled or modified elsewhere
      const fresh = await OtpOrder.findById(orderId).lean();
      if (!fresh || !['awaiting_sms', 'number_assigned', 'purchasing'].includes(fresh.status)) {
        return false;
      }

      try {
        if (decision.provider === 'smspool') {
          const checkRes = await checkSmsPoolStatus(providerOrderId);
          if (checkRes.status === 3 && checkRes.sms) {
            codeReceived = true;
            smsCode = checkRes.sms;
            fullSmsText = checkRes.full_sms || `SMS code: ${checkRes.sms}`;
            break;
          }
        } else {
          // 5sim check
          const checkRes = await check5SimStatus(parseInt(providerOrderId, 10));
          if (checkRes.sms && checkRes.sms.length > 0) {
            codeReceived = true;
            smsCode = checkRes.sms[0].code;
            fullSmsText = checkRes.sms[0].text;
            break;
          }
          if (['CANCELED', 'TIMEOUT', 'BANNED'].includes(checkRes.status)) {
            console.warn(`[5sim POLL] Order ${providerOrderId} was terminated early (${checkRes.status})`);
            break;
          }
        }
      } catch (pollErr: any) {
        console.error(`[AUTO-RETRY POLL ERROR] Order ${orderId}:`, pollErr.message);
      }
    }

    // 5. EVALUATE OUTCOME OF THIS ATTEMPT
    if (codeReceived && smsCode) {
      // SUCCESS! Complete order
      console.log(
        `[AUTO-RETRY SUCCESS] SMS Code received on Attempt ${attempt}: ${smsCode} for phone ${assignedPhone}`
      );

      order.status = 'code_delivered';
      order.otp_code = smsCode;
      order.full_sms_text = fullSmsText;
      order.state_transitions.push({
        status: 'code_delivered',
        timestamp: new Date(),
        note: `Code received on attempt ${attempt}/${maxRetries} via ${decision.provider}`,
      });
      await order.save();

      // Record success in scoreboard
      if (scoreboardDoc) {
        await finalizeScoreboardAttempt(
          scoreboardDoc._id,
          true,
          `Code received successfully in ${Math.round((Date.now() - pollStartTime) / 1000)}s`
        );
      }

      // Finish order on 5sim if applicable
      if (decision.provider === '5sim') {
        await finish5SimOrder(parseInt(providerOrderId, 10));
      }

      if (emitStatus) {
        emitStatus(orderId, {
          status: 'code_delivered',
          phone_number: assignedPhone,
          otp_code: smsCode,
          full_sms_text: fullSmsText,
        });
      }

      return true; // Successfully fulfilled!
    }

    // 6. TIMEOUT REACHED -> CANCEL ORDER AND VERIFY PROVIDER REFUND
    console.warn(
      `[AUTO-RETRY TIMEOUT] No code received for ${assignedPhone} within ${timeoutSeconds}s on Attempt ${attempt}. Cancelling order ${providerOrderId} with ${decision.provider}...`
    );

    let providerRefunded = false;

    if (decision.provider === 'smspool') {
      const cancelRes = await cancelSmsPoolOrder(providerOrderId);
      providerRefunded = cancelRes.refunded;
      if (!providerRefunded) {
        console.error(
          `[REFUND_ALERT] SMSPool order ${providerOrderId} cancel did NOT confirm refund: ${cancelRes.message}`
        );
      } else {
        console.log(`[REFUND_VERIFIED] SMSPool order ${providerOrderId} confirmed refunded.`);
      }
    } else {
      const cancelRes = await cancel5SimOrder(parseInt(providerOrderId, 10));
      providerRefunded = cancelRes.refunded;
      if (!providerRefunded) {
        console.error(
          `[REFUND_ALERT] 5sim order ${providerOrderId} cancel did NOT confirm refund: status=${cancelRes.status}`
        );
      } else {
        console.log(`[REFUND_VERIFIED] 5sim order ${providerOrderId} confirmed refunded.`);
      }
    }

    // Record failure in scoreboard
    if (scoreboardDoc) {
      await finalizeScoreboardAttempt(
        scoreboardDoc._id,
        false,
        `Timed out after ${timeoutSeconds}s without SMS`,
        providerRefunded
      );
    }

    if (attempt < maxRetries) {
      console.log(`[AUTO-RETRY] Proceeding to attempt ${attempt + 1} of ${maxRetries}...`);
      if (emitStatus) {
        emitStatus(orderId, {
          status: 'awaiting_sms',
          message: `Attempt ${attempt} timed out. Automatically switching to alternative provider/pool...`,
        });
      }
    }
  }

  // 7. ALL 3 ATTEMPTS FAILED -> REFUND CUSTOMER VIA PAYSTACK
  console.error(
    `[AUTO-RETRY FAILED] All ${maxRetries} attempts failed for Order ${orderId}. Issuing customer refund via Paystack.`
  );

  let paystackRefunded = false;
  if (order.paystack_reference) {
    const refundResult = await refundPaystackTransaction(
      order.paystack_reference,
      order.sell_price ? order.sell_price * 100 : undefined
    );
    paystackRefunded = refundResult.success;
  }

  order.status = 'failed_timeout';
  order.state_transitions.push({
    status: 'failed_timeout',
    timestamp: new Date(),
    note: `All ${maxRetries} attempts timed out. Customer auto-refund ${
      paystackRefunded ? 'succeeded' : 'failed or manual review required'
    }.`,
  });
  await order.save();

  if (emitStatus) {
    emitStatus(orderId, {
      status: 'failed_timeout',
      error: 'Unable to receive code across 3 separate provider routes. Your payment has been refunded.',
      refunded: paystackRefunded,
    });
  }

  return false;
}
