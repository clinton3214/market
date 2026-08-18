import dbConnect from './mongodb';
import ExchangeRate from '@/models/ExchangeRate';

export async function getExchangeRate(): Promise<number> {
  await dbConnect();
  
  let fallbackDoc = await ExchangeRate.findOne({ pair: 'USD_NGN' });
  const fallbackRate = fallbackDoc ? fallbackDoc.rate : null;

  try {
    // 30-minute cache using Next.js native fetch cache
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 1800 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from ER API: ${response.statusText}`);
    }

    const data = await response.json();
    const liveRate = data?.rates?.NGN;

    // Sanity check
    if (!liveRate || liveRate <= 0) {
      throw new Error('Fetched rate is 0, negative, or missing');
    }

    // Variance check against fallback (if we have a fallback)
    if (fallbackRate) {
      const difference = Math.abs(liveRate - fallbackRate);
      const percentDifference = difference / fallbackRate;
      
      // If deviation is > 50%, reject it
      if (percentDifference > 0.5) {
        throw new Error(`Fetched rate ${liveRate} deviates by >50% from fallback ${fallbackRate}`);
      }
    }

    // Save/update fallback
    if (fallbackDoc) {
      fallbackDoc.rate = liveRate;
      fallbackDoc.last_fetched = new Date();
      await fallbackDoc.save();
    } else {
      await ExchangeRate.create({
        pair: 'USD_NGN',
        rate: liveRate,
      });
    }

    return liveRate;

  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    
    // Fall back to DB if fetch/sanity check fails
    if (fallbackRate) {
      console.warn(`Falling back to stored exchange rate: ${fallbackRate}`);
      return fallbackRate;
    }

    // No fallback available!
    throw new Error('Exchange rate unavailable and no fallback exists');
  }
}
