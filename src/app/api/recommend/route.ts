import { NextRequest, NextResponse } from "next/server";
import { HYAKUMEIZAN_LIST } from "@/data/mountains-hyakumeizan";
import { evaluateMountainsWithJev } from "@/lib/typesafe";
import { UserPreferences, Mountain } from "@/types/mountain";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prefecture = "東京都",
      experienceLevel = "beginner",
      travelPreference = "daytrip_first",
      climbedMountainIds = [],
      targetListId = "hyakumeizan",
      apiKey: customApiKey,
    } = body;

    // ヘッダーまたはボディからAPIキーを取得
    const headerApiKey = req.headers.get("x-typesafe-api-key");
    const effectiveApiKey = customApiKey || headerApiKey || process.env.TYPESAFE_API_KEY || "";

    // リスト取得 (将来の二百名山などの分岐)
    let mountainPool: Mountain[] = HYAKUMEIZAN_LIST;
    if (targetListId !== "hyakumeizan") {
      // 現在は百名山のみ完全サポート
      mountainPool = HYAKUMEIZAN_LIST;
    }

    const climbedSet = new Set<string>(climbedMountainIds);

    // 未登頂の山と登頂済みの山を分離
    const unclimbedMountains = mountainPool.filter((m) => !climbedSet.has(m.id));
    const climbedMountains = mountainPool.filter((m) => climbedSet.has(m.id));

    const userPrefs: UserPreferences = {
      prefecture,
      experienceLevel,
      travelPreference,
      climbedMountainIds,
    };

    // Jev による登順レコメンド評価
    const recommendations = await evaluateMountainsWithJev(
      unclimbedMountains,
      userPrefs,
      effectiveApiKey || undefined
    );

    return NextResponse.json({
      success: true,
      usingRealJev: Boolean(effectiveApiKey),
      totalCount: mountainPool.length,
      climbedCount: climbedMountains.length,
      unclimbedCount: unclimbedMountains.length,
      recommendations,
      climbedMountains,
      targetListId,
      userPreferences: userPrefs,
    });
  } catch (error: any) {
    console.error("API /api/recommend error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
