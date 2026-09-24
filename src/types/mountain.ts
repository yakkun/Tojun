export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type AccessType = "car_convenient" | "public_transit_ok" | "expedition";

export interface Mountain {
  id: string;
  number: number; // 百名山の番号 (1-100)
  name: string;
  yomi: string;
  elevation: number; // メートル
  prefectures: string[]; // 所在都道府県
  region: string; // 北海道, 東北, 関東, 甲信越, 北アルプス, 八ヶ岳, 中央アルプス, 南アルプス, 北陸・東海, 近畿, 中国・四国, 九州
  difficulty: DifficultyLevel;
  physicalLevel: 1 | 2 | 3 | 4 | 5; // 体力度 (1: 低 〜 5: 高)
  standardCourseTimeHours: number; // 標準往復または縦走コースタイム (時間)
  recommendedMonths: number[]; // 推奨月 (1-12)
  features: string[]; // 特徴タグ (例: "鎖場あり", "高山植物", "ロープウェイあり", "日帰り可", "山小屋泊推奨")
  description: string;
  accessType: AccessType;
  lat: number; // 緯度
  lng: number; // 経度
  imageUrl?: string; // 山の写真画像URL (Wikimedia Commons等)
}

export interface MountainListMeta {
  id: string;
  name: string;
  nameKana: string;
  count: number;
  description: string;
  available: boolean;
}

export type StageId = "stage1" | "stage2" | "stage3" | "stage4";

export interface StageInfo {
  id: StageId;
  name: string;
  subtitle: string;
  description: string;
  color: string;
}

export interface RecommendedMountain extends Mountain {
  rank: number;
  stage: StageId;
  jevScore: number;
  confidence: number;
  recommendationReason: string;
  distanceFromUserRank: "near" | "medium" | "far";
}

export interface UserPreferences {
  prefecture: string;
  experienceLevel: "beginner" | "intermediate" | "advanced";
  travelPreference: "daytrip_first" | "stay_ok" | "any";
  climbedMountainIds: string[];
  isCustomPrefecture?: boolean;
}

