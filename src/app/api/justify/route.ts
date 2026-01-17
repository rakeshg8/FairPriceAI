import { NextRequest, NextResponse } from "next/server";
import { justifySellerClaim } from "@/ai/flows/justify-seller-claim";  // we create this next

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const sellerClaim = body.seller_claim;
    const c_est = body.c_est;
    const breakdown = body.breakdown;
    const rag = body.rag;

    if (!sellerClaim || !c_est || !breakdown || !rag) {
      return NextResponse.json(
        { error: "Missing fields in request." },
        { status: 400 }
      );
    }

    const llmResponse = await justifySellerClaim({
      sellerClaim,
      c_est,
      breakdown,
      rag
    });

    return NextResponse.json({
      justification: llmResponse
    });
  } catch (e: any) {
    console.error("JUSTIFY API ERROR:", e.message, e.stack);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
