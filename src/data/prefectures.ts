export interface PrefectureInfo {
  code: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
}

export const PREFECTURES: PrefectureInfo[] = [
  { code: "01", name: "北海道", region: "北海道", lat: 43.064, lng: 141.346 },
  { code: "02", name: "青森県", region: "東北", lat: 40.824, lng: 140.74 },
  { code: "03", name: "岩手県", region: "東北", lat: 39.703, lng: 141.152 },
  { code: "04", name: "宮城県", region: "東北", lat: 38.268, lng: 140.871 },
  { code: "05", name: "秋田県", region: "東北", lat: 39.718, lng: 140.102 },
  { code: "06", name: "山形県", region: "東北", lat: 38.24, lng: 140.363 },
  { code: "07", name: "福島県", region: "東北", lat: 37.75, lng: 140.467 },
  { code: "08", name: "茨城県", region: "関東", lat: 36.341, lng: 140.446 },
  { code: "09", name: "栃木県", region: "関東", lat: 36.565, lng: 139.883 },
  { code: "10", name: "群馬県", region: "関東", lat: 36.391, lng: 139.06 },
  { code: "11", name: "埼玉県", region: "関東", lat: 35.857, lng: 139.648 },
  { code: "12", name: "千葉県", region: "関東", lat: 35.605, lng: 140.123 },
  { code: "13", name: "東京都", region: "関東", lat: 35.689, lng: 139.692 },
  { code: "14", name: "神奈川県", region: "関東", lat: 35.447, lng: 139.642 },
  { code: "15", name: "新潟県", region: "甲信越", lat: 37.902, lng: 139.023 },
  { code: "16", name: "富山県", region: "北陸", lat: 36.695, lng: 137.211 },
  { code: "17", name: "石川県", region: "北陸", lat: 36.594, lng: 136.625 },
  { code: "18", name: "福井県", region: "北陸", lat: 36.065, lng: 136.221 },
  { code: "20-nagano", name: "長野県（長野市）", region: "甲信越", lat: 36.6513, lng: 138.181 },
  { code: "20-matsumoto", name: "長野県（松本市）", region: "甲信越", lat: 36.2381, lng: 137.9719 },
  { code: "21", name: "岐阜県", region: "東海", lat: 35.391, lng: 136.722 },
  { code: "22", name: "静岡県", region: "東海", lat: 34.976, lng: 138.383 },
  { code: "23", name: "愛知県", region: "東海", lat: 35.18, lng: 136.906 },
  { code: "24", name: "三重県", region: "近畿", lat: 34.73, lng: 136.508 },
  { code: "25", name: "滋賀県", region: "近畿", lat: 35.004, lng: 135.868 },
  { code: "26", name: "京都府", region: "近畿", lat: 35.021, lng: 135.755 },
  { code: "27", name: "大阪府", region: "近畿", lat: 34.686, lng: 135.52 },
  { code: "28", name: "兵庫県", region: "近畿", lat: 34.691, lng: 135.183 },
  { code: "29", name: "奈良県", region: "近畿", lat: 34.685, lng: 135.832 },
  { code: "30", name: "和歌山県", region: "近畿", lat: 34.226, lng: 135.167 },
  { code: "31", name: "鳥取県", region: "中国", lat: 35.503, lng: 134.238 },
  { code: "32", name: "島根県", region: "中国", lat: 35.472, lng: 133.05 },
  { code: "33", name: "岡山県", region: "中国", lat: 34.661, lng: 133.935 },
  { code: "34", name: "広島県", region: "中国", lat: 34.396, lng: 132.459 },
  { code: "35", name: "山口県", region: "中国", lat: 34.186, lng: 131.471 },
  { code: "36", name: "徳島県", region: "四国", lat: 34.065, lng: 134.559 },
  { code: "37", name: "香川県", region: "四国", lat: 34.34, lng: 134.043 },
  { code: "38", name: "愛媛県", region: "四国", lat: 33.841, lng: 132.766 },
  { code: "39", name: "高知県", region: "四国", lat: 33.559, lng: 133.531 },
  { code: "40", name: "福岡県", region: "九州", lat: 33.606, lng: 130.418 },
  { code: "41", name: "佐賀県", region: "九州", lat: 33.249, lng: 130.298 },
  { code: "42", name: "長崎県", region: "九州", lat: 32.744, lng: 129.873 },
  { code: "43", name: "熊本県", region: "九州", lat: 32.789, lng: 130.741 },
  { code: "44", name: "大分県", region: "九州", lat: 33.238, lng: 131.612 },
  { code: "45", name: "宮崎県", region: "九州", lat: 31.911, lng: 131.423 },
  { code: "46", name: "鹿児島県", region: "九州", lat: 31.560, lng: 130.558 },
  { code: "47", name: "沖縄県", region: "沖縄", lat: 26.212, lng: 127.681 },
];

/**
 * 都道府県名（または長野市・松本市などの分割名）からPrefectureInfoを検索
 */
export function findPrefecture(name: string): PrefectureInfo | undefined {
  if (!name) return undefined;
  const exact = PREFECTURES.find((p) => p.name === name);
  if (exact) return exact;

  if (name.includes("松本")) {
    return PREFECTURES.find((p) => p.name.includes("松本市"));
  }
  if (name.includes("長野")) {
    return PREFECTURES.find((p) => p.name.includes("長野市"));
  }

  return PREFECTURES.find((p) => p.name.startsWith(name) || name.startsWith(p.name));
}

/**
 * 緯度・経度から最も近い都道府県（長野市・松本市含む）を判定
 */
export function findClosestPrefecture(lat: number, lng: number): PrefectureInfo {
  let closest = PREFECTURES[0];
  let minDistanceSq = Number.MAX_VALUE;

  for (const p of PREFECTURES) {
    // 緯度1度あたりの距離は約111km、経度1度は緯度latのcosに比例
    const latDiff = p.lat - lat;
    const lngDiff = (p.lng - lng) * Math.cos((lat * Math.PI) / 180);
    const distSq = latDiff * latDiff + lngDiff * lngDiff;
    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      closest = p;
    }
  }

  return closest;
}
