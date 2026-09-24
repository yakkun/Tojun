import { NextRequest, NextResponse } from "next/server";
import { HYAKUMEIZAN_LIST } from "@/data/mountains-hyakumeizan";
import { MOUNTAIN_LISTS, STAGES } from "@/data/mountain-lists";
import { PREFECTURES } from "@/data/prefectures";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const listId = searchParams.get("listId") || "hyakumeizan";

  return NextResponse.json({
    lists: MOUNTAIN_LISTS,
    stages: STAGES,
    prefectures: PREFECTURES,
    mountains: HYAKUMEIZAN_LIST,
    currentListId: listId,
  });
}
