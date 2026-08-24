import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { setupLemonSqueezy } from "@/lib/lemonsqueezy";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized. Valid session with email is required." }, { status: 401 });
    }

    setupLemonSqueezy();

    const body = await req.json().catch(() => ({}));
    const { tier } = body;

    const storeId = String(process.env.LEMONSQUEEZY_STORE_ID);
    const variantIdRaw = tier === "PLUS" 
      ? process.env.NEXT_PUBLIC_LS_PLUS_VARIANT 
      : process.env.NEXT_PUBLIC_LS_PRO_VARIANT;
    const variantId = String(variantIdRaw);

    const redirectUrl = `${process.env.NEXTAUTH_URL}/saves`;

    // Construct the direct checkout URL since the .env uses domain and UUIDs
    // format: https://[store-domain]/checkout/buy/[variant-uuid]?checkout[email]=[email]&checkout[custom][userId]=[id]
    const url = new URL(`https://${storeId}/checkout/buy/${variantId}`);
    url.searchParams.append("checkout[email]", session.user.email);
    url.searchParams.append("checkout[custom][userId]", session.user.id);
    // Optional: add redirect after successful purchase
    // Note: To use redirectUrl with direct links, you can append it as a param depending on LS settings, 
    // but usually it's set in the product dashboard. We'll append it just in case.
    url.searchParams.append("checkout[custom][redirectUrl]", redirectUrl);

    return NextResponse.json({ url: url.toString() }, { status: 200 });
  } catch (catchErr) {
    console.error("Lemon Squeezy Checkout Error:", catchErr);
    return NextResponse.json({ error: catchErr.message || "Internal Server Error" }, { status: 500 });
  }
}
