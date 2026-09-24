import { TypeSafeClient, score, choice } from "@typesafe-ai/sdk";
import { Mountain, RecommendedMountain, StageId, UserPreferences } from "@/types/mountain";
import { PREFECTURES, findPrefecture } from "@/data/prefectures";

export interface JevEvaluationResult {
  score: number;
  confidence: number;
  reason: string;
  stage: StageId;
  distanceRank: "near" | "medium" | "far";
}

/**
 * ユーザーの都道府県（または長野市/松本市）と山の所在地から大まかな距離感 (near, medium, far) を算出
 */
export function calculateDistanceRank(
  userPrefName: string,
  mountainPrefs: string[],
  mountainLat?: number,
  mountainLng?: number
): "near" | "medium" | "far" {
  const userPref = findPrefecture(userPrefName);
  if (!userPref) return "medium";

  // 山の正確な緯度経度が提供されている場合、実距離（km）で高精度に判定
  if (typeof mountainLat === "number" && typeof mountainLng === "number") {
    // 緯度経度差からの概算km（日本付近: 緯度1度≈111km, 経度1度≈90km）
    const dLat = (userPref.lat - mountainLat) * 111;
    const dLng = (userPref.lng - mountainLng) * 90;
    const distKm = Math.sqrt(dLat * dLat + dLng * dLng);

    // 85km以内: 近郊・日帰り圏（長野市からは妙高・高妻・雨飾、松本市からは槍・穂高・常念・美ヶ原・霧ヶ峰）
    if (distKm <= 85) {
      return "near";
    }
    // 220km以内: 中距離圏
    if (distKm <= 220) {
      return "medium";
    }
    return "far";
  }

  // ユーザーの都道府県が山の所在地に含まれるか（「長野県（長野市）」と「長野県」の部分一致対応）
  const matchesDirect = mountainPrefs.some(
    (mp) => mp === userPref.name || userPref.name.startsWith(mp) || mp.startsWith(userPref.name)
  );
  if (matchesDirect) {
    return "near";
  }

  // 隣接地方定義
  const adjacentRegions: Record<string, string[]> = {
    北海道: [],
    東北: ["関東", "甲信越"],
    関東: ["東北", "甲信越", "東海"],
    甲信越: ["関東", "東北", "北陸", "東海"],
    北陸: ["甲信越", "東海", "近畿"],
    東海: ["関東", "甲信越", "北陸", "近畿"],
    近畿: ["北陸", "東海", "中国", "四国"],
    中国: ["近畿", "四国", "九州"],
    四国: ["中国", "近畿", "九州"],
    九州: ["中国", "四国"],
    沖縄: [],
  };

  let minDistance = Infinity;
  let isSameRegion = false;
  let isAdjacentRegion = false;

  for (const mPrefName of mountainPrefs) {
    const mPref = findPrefecture(mPrefName);
    if (!mPref) continue;

    if (userPref.region === mPref.region) {
      isSameRegion = true;
    } else if (adjacentRegions[userPref.region]?.includes(mPref.region)) {
      isAdjacentRegion = true;
    }

    const dx = userPref.lng - mPref.lng;
    const dy = userPref.lat - mPref.lat;
    const dist = Math.sqrt(dx * dx + dy * dy);
    minDistance = Math.min(minDistance, dist);
  }

  // 同一地方または距離が極めて近い場合
  if (isSameRegion || minDistance < 1.8) {
    return "near";
  }

  // 隣接地方かつ中距離
  if (isAdjacentRegion && minDistance < 3.8) {
    return "medium";
  }

  return "far";
}

/**
 * Jevの判断基準に基づいたフォールバック（シミュレータ）
 * APIキーがない環境やデモでもJevと同一の基準で高速に評価する
 */
export function simulateJevEvaluation(
  mountain: Mountain,
  user: UserPreferences,
  distanceRank: "near" | "medium" | "far"
): JevEvaluationResult {
  let scoreValue = 1.5;
  let reason = "";

  // 1. 距離感による配点 (最重要)
  if (distanceRank === "near") {
    scoreValue += 0.95;
  } else if (distanceRank === "medium") {
    scoreValue += 0.2;
  } else {
    scoreValue -= 0.85;
  }

  // 2. 難易度と経験レベルの適合性
  if (user.experienceLevel === "beginner") {
    if (mountain.difficulty === "beginner") {
      scoreValue += 0.55;
    } else if (mountain.difficulty === "intermediate") {
      scoreValue += 0.05;
    } else if (mountain.difficulty === "advanced") {
      scoreValue -= 0.65;
    } else if (mountain.difficulty === "expert") {
      scoreValue -= 1.3;
    }
  } else if (user.experienceLevel === "intermediate") {
    if (mountain.difficulty === "intermediate") {
      scoreValue += 0.55;
    } else if (mountain.difficulty === "beginner") {
      scoreValue += 0.35;
    } else if (mountain.difficulty === "advanced") {
      scoreValue += 0.15;
    } else if (mountain.difficulty === "expert") {
      scoreValue -= 0.6;
    }
  } else {
    // advanced
    if (mountain.difficulty === "advanced" || mountain.difficulty === "expert") {
      scoreValue += 0.6;
    } else {
      scoreValue += 0.2;
    }
  }

  // 3. 体力度・コースタイムの適合
  if (user.experienceLevel === "beginner") {
    if (mountain.physicalLevel === 1) scoreValue += 0.2;
    if (mountain.physicalLevel >= 4) scoreValue -= 0.4;
    if (mountain.standardCourseTimeHours <= 4) scoreValue += 0.15;
    if (mountain.standardCourseTimeHours >= 8) scoreValue -= 0.35;
  } else if (user.experienceLevel === "intermediate") {
    if (mountain.physicalLevel >= 2 && mountain.physicalLevel <= 4) scoreValue += 0.15;
  }

  // 4. 旅行スタイル（日帰り優先など）
  if (user.travelPreference === "daytrip_first") {
    if (distanceRank === "near" && mountain.standardCourseTimeHours <= 6) {
      scoreValue += 0.2;
    }
    if (distanceRank === "far" || mountain.accessType === "expedition") {
      scoreValue -= 0.4;
    }
  }

  // 微細なタイブレーク用の揺らぎ (同スコアを防ぎ、より標高やコースタイムで自然な順位にする)
  const tieBreaker = (100 - mountain.standardCourseTimeHours * 2) * 0.001;
  scoreValue += tieBreaker;

  // 0.0 〜 3.0 の範囲に収める
  const clampedScore = Math.max(0.05, Math.min(2.98, Number(scoreValue.toFixed(2))));

  // 確信度 (0.75 - 0.98)
  const confidence = Number((0.82 + (distanceRank === "near" ? 0.1 : 0.05)).toFixed(2));

  // ステージ決定
  let stage: StageId = "stage2";
  const isExpeditionForUser = distanceRank === "far" || (mountain.accessType === "expedition" && distanceRank !== "near");

  if (distanceRank === "near" && (mountain.difficulty === "beginner" || mountain.standardCourseTimeHours <= 5)) {
    stage = "stage1";
  } else if (clampedScore >= 2.3 && mountain.difficulty === "beginner") {
    stage = "stage1";
  } else if (mountain.difficulty === "expert" || mountain.physicalLevel >= 5 || (isExpeditionForUser && mountain.difficulty === "advanced")) {
    stage = "stage4";
  } else if (distanceRank === "far" || mountain.difficulty === "advanced" || mountain.elevation >= 2800) {
    stage = "stage3";
  } else {
    stage = "stage2";
  }

  // 推薦理由の生成
  if (stage === "stage1") {
    reason = `${user.prefecture}から日帰り圏内でアクセスしやすく、${
      mountain.features[0] || "登山道が整備"
    }。体力づくりや百名山第1歩の足慣らしに最もおすすめです。`;
  } else if (stage === "stage2") {
    reason = `標高${mountain.elevation}m、コースタイム約${mountain.standardCourseTimeHours}時間。適度な登りごたえがあり、アルプス挑戦へ向けた中級ステップアップに最適です。`;
  } else if (stage === "stage3") {
    reason = `${mountain.region}を代表する名峰。${mountain.features.slice(0, 2).join("・")}が楽しめ、週末の宿泊や連休遠征として最高の充実感を味わえます。`;
  } else {
    reason = `百名山屈指の難関・長大コース。${mountain.features[0] || "険しい岩稜"}が待ち受け、十分な経験と体力を積んでから完登を目指すフィナーレにふさわしい山です。`;
  }

  return {
    score: clampedScore,
    confidence,
    reason,
    stage,
    distanceRank,
  };
}

/**
 * TypeSafe AI (Jev) APIを呼び出して山の適合度を評価
 */
export async function evaluateMountainsWithJev(
  mountains: Mountain[],
  user: UserPreferences,
  apiKey?: string
): Promise<RecommendedMountain[]> {
  const effectiveApiKey = apiKey || process.env.TYPESAFE_API_KEY;

  // API Keyがない場合は高精度シミュレーションを使用
  if (!effectiveApiKey) {
    return runSimulatedPipeline(mountains, user);
  }

  try {
    const client = new TypeSafeClient({
      apiKey: effectiveApiKey,
    });

    // 候補山を事前フィルタ＆距離計算
    const evaluatedItems: Array<{
      mountain: Mountain;
      distanceRank: "near" | "medium" | "far";
      jevScore: number;
      confidence: number;
      reason: string;
      stage: StageId;
    }> = [];

    // Jev APIのクエリを構築
    // Jevは複数の質問を並列で高速評価可能
    // 効率のために上位バッチまたは全候補を評価
    // 1回のAPI呼び出しでバッチ化、あるいは個別呼び出し
    // TypeSafe AIの推奨パターン: stateにユーザー情報と山情報を渡し、Score質問で適合度を取得
    const batchSize = 10; // 並列度
    for (let i = 0; i < mountains.length; i += batchSize) {
      const chunk = mountains.slice(i, i + batchSize);
      await Promise.all(
        chunk.map(async (mountain) => {
          const distanceRank = calculateDistanceRank(user.prefecture, mountain.prefectures, mountain.lat, mountain.lng);

          try {
            const state = {
              user_profile: {
                residence: user.prefecture,
                experience_level: user.experienceLevel,
                travel_style: user.travelPreference,
                climbed_mountains_count: user.climbedMountainIds.length,
              },
              target_mountain: {
                name: mountain.name,
                elevation_m: mountain.elevation,
                prefectures: mountain.prefectures.join(", "),
                region: mountain.region,
                difficulty: mountain.difficulty,
                physical_level: mountain.physicalLevel,
                course_hours: mountain.standardCourseTimeHours,
                geographic_proximity: distanceRank,
                features: mountain.features.join(", "),
              },
            };

            const response = await client.systemOne({
              state,
              questions: {
                suitability: score(
                  "Evaluate how suitable and high-priority this mountain is for the user's next climbing step, based on geographic proximity from residence, physical difficulty, and user experience.",
                  [
                    "Level 0: Not recommended now. Far expedition or dangerously difficult for user's level.",
                    "Level 1: Mid-to-late milestone. Worth tackling after building stamina or during a long holiday.",
                    "Level 2: Good stepping stone. Balanced difficulty and accessible for steady progression.",
                    "Level 3: Top priority! Closest access, perfect difficulty match, ideal starting or next mountain.",
                  ]
                ),
              },
            });

            const answer = response.answers.suitability;
            const jevScore = Number(answer.score.toFixed(2));
            const confidence = Number((answer.confidence || 0.85).toFixed(2));

            // ステージ判定
            let stage: StageId = "stage2";
            if (jevScore >= 2.3 && (mountain.difficulty === "beginner" || distanceRank === "near")) {
              stage = "stage1";
            } else if (jevScore >= 1.6 && mountain.difficulty !== "expert") {
              stage = "stage2";
            } else if (mountain.difficulty === "expert" || mountain.accessType === "expedition" || mountain.physicalLevel >= 5) {
              stage = "stage4";
            } else {
              stage = "stage3";
            }

            // 理由
            const sim = simulateJevEvaluation(mountain, user, distanceRank);
            evaluatedItems.push({
              mountain,
              distanceRank,
              jevScore,
              confidence,
              reason: sim.reason,
              stage,
            });
          } catch (err) {
            console.warn(`Jev call failed for ${mountain.name}, fallback to simulation:`, err);
            const sim = simulateJevEvaluation(mountain, user, distanceRank);
            evaluatedItems.push({
              mountain,
              distanceRank,
              jevScore: sim.score,
              confidence: sim.confidence,
              reason: sim.reason,
              stage: sim.stage,
            });
          }
        })
      );
    }

    // スコア順にソート (Jevスコア降順、僅差時は距離近い順、コースタイム短い順、標高低い順)
    const distWeight = { near: 3, medium: 2, far: 1 };
    evaluatedItems.sort((a, b) => {
      if (Math.abs(b.jevScore - a.jevScore) > 0.05) {
        return b.jevScore - a.jevScore;
      }
      if (distWeight[b.distanceRank] !== distWeight[a.distanceRank]) {
        return distWeight[b.distanceRank] - distWeight[a.distanceRank];
      }
      if (a.mountain.standardCourseTimeHours !== b.mountain.standardCourseTimeHours) {
        return a.mountain.standardCourseTimeHours - b.mountain.standardCourseTimeHours;
      }
      return a.mountain.elevation - b.mountain.elevation;
    });

    return evaluatedItems.map((item, index) => ({
      ...item.mountain,
      rank: index + 1,
      stage: item.stage,
      jevScore: item.jevScore,
      confidence: item.confidence,
      recommendationReason: item.reason,
      distanceFromUserRank: item.distanceRank,
    }));
  } catch (error) {
    console.error("TypeSafe Client error, falling back to simulated pipeline:", error);
    return runSimulatedPipeline(mountains, user);
  }
}

/**
 * シミュレータによる全山評価パイプライン
 */
function runSimulatedPipeline(mountains: Mountain[], user: UserPreferences): RecommendedMountain[] {
  const evaluated = mountains.map((mountain) => {
    const distanceRank = calculateDistanceRank(user.prefecture, mountain.prefectures, mountain.lat, mountain.lng);
    const evalResult = simulateJevEvaluation(mountain, user, distanceRank);

    return {
      ...mountain,
      stage: evalResult.stage,
      jevScore: evalResult.score,
      confidence: evalResult.confidence,
      recommendationReason: evalResult.reason,
      distanceFromUserRank: evalResult.distanceRank,
    };
  });

  // スコア順にソート (Jevスコア降順、僅差時は距離近い順、コースタイム短い順、標高低い順)
  const distWeight = { near: 3, medium: 2, far: 1 };
  evaluated.sort((a, b) => {
    if (Math.abs(b.jevScore - a.jevScore) > 0.05) {
      return b.jevScore - a.jevScore;
    }
    if (distWeight[b.distanceFromUserRank] !== distWeight[a.distanceFromUserRank]) {
      return distWeight[b.distanceFromUserRank] - distWeight[a.distanceFromUserRank];
    }
    if (a.standardCourseTimeHours !== b.standardCourseTimeHours) {
      return a.standardCourseTimeHours - b.standardCourseTimeHours;
    }
    return a.elevation - b.elevation;
  });

  return evaluated.map((m, idx) => ({
    ...m,
    rank: idx + 1,
  }));
}
