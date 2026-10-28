import { NextResponse } from 'next/server';
import { getUnifiedLivePrice } from '@/lib/unifiedPricing';
import { getExchangeRate } from '@/lib/exchangeRate';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const country = url.searchParams.get('country');
    const service = url.searchParams.get('service');

    if (!country || !service) {
      return NextResponse.json({ error: "Missing country or service parameters" }, { status: 400 });
    }

    const cleanService = service.toLowerCase().replace(/\s+/g, '');
    if (cleanService === 'whatsapp' || cleanService.includes('whatsapp')) {
      return NextResponse.json({
        error: "WhatsApp numbers are currently unavailable due to carrier-level verification restrictions. Orders are temporarily paused to protect your funds.",
        unavailable: true,
        code: "WHATSAPP_UNAVAILABLE",
        platform: "WhatsApp"
      }, { status: 400 });
    }

    const priceResult = await getUnifiedLivePrice(country, service);

    if (!priceResult || priceResult.cost_price_usd === null) {
      return NextResponse.json({ error: "Out of stock across available providers" }, { status: 404 });
    }

    const cost_price = priceResult.cost_price_usd;

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
