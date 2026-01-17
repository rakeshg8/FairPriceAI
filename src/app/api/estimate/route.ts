import { analyzeProductCost } from '@/ai/flows/analyze-product-cost';
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
 const body = await req.json(); // ✅ define `body` from request
 const productName = body.product_name;
    const mrp = body.mrp;
    if (!productName || !mrp) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const aiResponse = await analyzeProductCost({
      productName,
      mrp,
       photoDataUri: typeof body.photoDataUri === "string" && body.photoDataUri.length > 0
  ? body.photoDataUri
  : undefined,


    });

    return NextResponse.json({
      fair_price: aiResponse.totalEstimatedCost,
      verdict: aiResponse.verdict,
      price_trend: [aiResponse.totalEstimatedCost], // Basic history mimic
      explanation: aiResponse.priceAnalysis,
      components: aiResponse.components
    });
  } catch (e: any) {
     console.error('API error:', e.message, e.stack); // 👈 log full error
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


