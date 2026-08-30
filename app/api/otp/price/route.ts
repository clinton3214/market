import { NextResponse } from 'next/server';
import { getLivePrice } from '@/lib/fiveSim';
import { getExchangeRate } from '@/lib/exchangeRate';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const country = url.searchParams.get('country');
    const service = url.searchParams.get('service');

    if (!country || !service) {
      return NextResponse.json({ error: "Missing country or service parameters" }, { status: 400 });
    }

    const cost_price = await getLivePrice(country, service);

    if (cost_price === null) {
      return NextResponse.json({ error: "Out of stock on 5sim" }, { status: 404 });
    }

    let exchangeRate: number;
    try {
      exchangeRate = await getExchangeRate();
    } catch (err: any) {
      // Exchange rate completely unavailable
      return NextResponse.json({ error: "Pricing currently unavailable. Please try again shortly." }, { status: 503 });
    }
    
    const cost_price_ngn = cost_price * exchangeRate;
    const base_sell = cost_price_ngn + 6500;
    // Round to nearest 50 NGN
    const sell_price = Math.ceil(base_sell / 50) * 50; 

    return NextResponse.json({
      country,
      service,
      cost_price_usd: cost_price,
      cost_price_ngn,
      sell_price,
      available: true
    });
  } catch (error) {
    console.error('Price fetch error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
