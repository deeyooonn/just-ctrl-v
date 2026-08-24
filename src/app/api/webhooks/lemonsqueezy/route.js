import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature") || "";
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "";

    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");

    if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
      console.error("Lemon Squeezy Webhook: Invalid signature.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    const data = payload.data;
    const customData = payload.meta.custom_data || {};

    const userId = customData.userId || customData.user_id;
    
    if (!userId) {
      console.log("Lemon Squeezy Webhook: No userId found in custom_data. Ignoring.");
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const customerId = data.attributes.customer_id ? String(data.attributes.customer_id) : null;
    
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) return; 

      if (customerId && !user.lemonSqueezyCustomerId) {
        await tx.user.update({
          where: { id: userId },
          data: { lemonSqueezyCustomerId: customerId }
        });
      }

      if (eventName === "subscription_created" || eventName === "subscription_updated") {
        const subscriptionId = String(data.id);
        const status = data.attributes.status;

        const updateData = {
          lemonSqueezySubscriptionId: subscriptionId
        };

        if (status === "active") {
          updateData.planTier = "PRO";
        } else if (status === "past_due" || status === "expired") {
          if (status === "expired") {
            updateData.planTier = "FREE";
          }
        }

        await tx.user.update({
          where: { id: userId },
          data: updateData
        });
      }

      if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
        await tx.user.update({
          where: { id: userId },
          data: { planTier: "FREE" }
        });
      }

      if (eventName === "order_created") {
        // Assuming order_created implies a successful one-time purchase or initial sub
        await tx.user.update({
          where: { id: userId },
          data: { planTier: "PRO" }
        });
      }
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
