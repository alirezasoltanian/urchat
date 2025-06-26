import { db } from "@/db";
import { userKeys } from "@/db/schema";
import { currentUser } from "@/lib/actions/user";
import { PROVIDERS } from "@/lib/providers";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const SUPPORTED_PROVIDERS = PROVIDERS.map((p) => p.id);

export async function GET() {
  try {
    // const supabase = await createClient()
    // if (!supabase) {
    //   return NextResponse.json(
    //     { error: "Supabase not available" },
    //     { status: 500 }
    //   )
    // }

    // const { data: authData } = await supabase.auth.getUser()

    // if (!authData?.user?.id) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }
    const userData = await currentUser();
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userKeysData = await db
      .select()
      .from(userKeys)
      .where(eq(userKeys.userId, userData.id));

    // if (error) {
    //   return NextResponse.json({ error: error.message }, { status: 500 });
    // }

    // Create status object for all supported providers
    const userProviders = userKeysData?.map((k) => k.provider) || [];
    const providerStatus = SUPPORTED_PROVIDERS.reduce((acc, provider) => {
      acc[provider] = userProviders.includes(provider);
      return acc;
    }, {} as Record<string, boolean>);

    return NextResponse.json(providerStatus);
  } catch (err) {
    console.error("Key status error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
