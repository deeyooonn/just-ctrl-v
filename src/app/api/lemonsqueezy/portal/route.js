import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { setupLemonSqueezy } from "@/lib/lemonsqueezy";
import { getCustomer } from "@lemonsqueezy/lemonsqueezy.js";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !user.lemonSqueezyCustomerId) {
      return NextResponse.json({ error: "No active subscription found." }, { status: 400 });
    }

    setupLemonSqueezy();

    const { error, data } = await getCustomer(user.lemonSqueezyCustomerId);

    if (error) {
      console.error("Lemon Squeezy portal error:", error);
      return NextResponse.json({ error: "Failed to get customer portal" }, { status: 500 });
    }

    const portalUrl = data.data.attributes.urls.customer_portal;
    return NextResponse.json({ url: portalUrl }, { status: 200 });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
