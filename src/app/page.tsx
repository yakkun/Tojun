"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { PreferencesBar } from "@/components/PreferencesBar";
import { MountainCard } from "@/components/MountainCard";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { ClimbedManagerModal } from "@/components/ClimbedManagerModal";
import {
  Mountain,
  RecommendedMountain,
  StageId,
  UserPreferences,
} from "@/types/mountain";
import { HYAKUMEIZAN_LIST } from "@/data/mountains-hyakumeizan";
import { STAGES } from "@/data/mountain-lists";
import { findClosestPrefecture } from "@/data/prefectures";
import { evaluateMountainsWithJev } from "@/lib/typesafe";
import dynamic from "next/dynamic";
import {
  Compass,
  Mountain as MountainIcon,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ListOrdered,
  Layers,
  Map as MapIcon,
  ArrowRight,
  Filter,
  Search,
  RotateCcw,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";

const MountainMap = dynamic(
  () => import("@/components/MountainMap").then((mod) => mod.MountainMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[480px] rounded-3xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 text-xs">
        <MountainIcon className="w-8 h-8 text-slate-300 animate-pulse mb-2" />
        <span>日本地図を読み込み中...</span>
      </div>
    ),
  }
);

export default function Home() {
  const mapSectionRef = useRef<HTMLDivElement>(null);

  // ユーザー設定状態 (localStorageに保存)
  const [preferences, setPreferences] = useState<UserPreferences>({
    prefecture: "東京都",
    experienceLevel: "beginner",
    travelPreference: "daytrip_first",
    climbedMountainIds: [],
  });

  const [apiKey, setApiKey] = useState<string>("");
  const [targetListId, setTargetListId] = useState<string>("hyakumeizan");

  // レコメンドデータ
  const [recommendations, setRecommendations] = useState<RecommendedMountain[]>([]);
  const [isUsingRealJev, setIsUsingRealJev] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 表示モード
  const [activeView, setActiveView] = useState<"stages" | "ranking" | "climbed">("stages");
  const [selectedMountainId, setSelectedMountainId] = useState<string | null>(null);

  // フィルター
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  // モーダル・状態
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isClimbedModalOpen, setIsClimbedModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationToast, setLocationToast] = useState<string | null>(null);

  // 初回マウント時にlocalStorageから復元 & 未設定時はブラウザ現在地から初期居住地を取得
  useEffect(() => {
    let hasSavedCustomPrefecture = false;
    try {
      const savedPrefs = localStorage.getItem("tojun_preferences");
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.prefecture === "長野県") {
          parsed.prefecture = "長野県（松本市）";
        }
        setPreferences(parsed);
        if (parsed.isCustomPrefecture) {
          hasSavedCustomPrefecture = true;
        }
      }

      const savedKey = localStorage.getItem("tojun_typesafe_key");
      if (savedKey) {
        setApiKey(savedKey);
      }
    } catch (e) {
      console.error("Failed to load settings from localStorage:", e);
    } finally {
      setIsInitialized(true);
    }

    // 初期の居住地をブラウザ現在地から自動取得（手動変更されていない場合）
    if (!hasSavedCustomPrefecture && typeof window !== "undefined" && "geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const { latitude, longitude } = pos.coords;
          const closest = findClosestPrefecture(latitude, longitude);
          if (closest) {
            setPreferences((prev) => {
              if (prev.isCustomPrefecture) return prev;
              const updated: UserPreferences = {
                ...prev,
                prefecture: closest.name,
              };
              try {
                localStorage.setItem("tojun_preferences", JSON.stringify(updated));
              } catch {}
              return updated;
            });
            setLocationToast(`現在地（${closest.name}）を初期居住地に設定しました`);
            setTimeout(() => setLocationToast(null), 3500);
          }
        },
        (err) => {
          setIsLocating(false);
          console.info("Geolocation not available or permission denied:", err.message);
        },
        {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 300000, // 5分キャッシュ
        }
      );
    }
  }, []);

  // 設定変更時にレコメンド計算
  const fetchRecommendations = async (
    currentPrefs: UserPreferences,
    currentKey: string,
    listId: string
  ) => {
    setIsLoading(true);
    try {
      const climbedSet = new Set<string>(currentPrefs.climbedMountainIds);
      const unclimbed = HYAKUMEIZAN_LIST.filter((m) => !climbedSet.has(m.id));
      const recs = await evaluateMountainsWithJev(
        unclimbed,
        currentPrefs,
        currentKey || undefined
      );
      setRecommendations(recs);
      setIsUsingRealJev(Boolean(currentKey));
    } catch (err) {
      console.error("Error evaluating recommendations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) return; // 初回localStorage読み込み完了まで上書き・API呼び出しをガード

    fetchRecommendations(preferences, apiKey, targetListId);
    // localStorage に保存
    try {
      localStorage.setItem("tojun_preferences", JSON.stringify(preferences));
      if (apiKey) {
        localStorage.setItem("tojun_typesafe_key", apiKey);
      } else {
        localStorage.removeItem("tojun_typesafe_key");
      }
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }, [preferences, apiKey, targetListId, isInitialized]);

  // 設定更新ハンドラー
  const handleUpdatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
  };

  // 現在地手動検出ハンドラー
  const handleDetectCurrentLocation = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      alert("お使いのブラウザは位置情報取得に対応していません。");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        const closest = findClosestPrefecture(latitude, longitude);
        if (closest) {
          handleUpdatePreferences({ prefecture: closest.name, isCustomPrefecture: true });
          setLocationToast(`現在地（${closest.name}）を設定しました`);
          setTimeout(() => setLocationToast(null), 3500);
        }
      },
      (err) => {
        setIsLocating(false);
        let msg = "位置情報の取得に失敗しました。";
        if (err.code === 1) {
          msg = "位置情報の利用がブラウザで許可されていません。ブラウザのアドレスバー等で位置情報の許可をご確認ください。";
        }
        alert(msg);
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 0,
      }
    );
  };

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
  };

  const handleFocusMountainOnMap = (mountain: RecommendedMountain) => {
    setSelectedMountainId(mountain.id);
    mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // 登頂トグルハンドラー
  const handleToggleClimbed = (mountainId: string) => {
    setPreferences((prev) => {
      const exists = prev.climbedMountainIds.includes(mountainId);
      const newIds = exists
        ? prev.climbedMountainIds.filter((id) => id !== mountainId)
        : [...prev.climbedMountainIds, mountainId];
      return { ...prev, climbedMountainIds: newIds };
    });
  };

  const handleClearAllClimbed = () => {
    setPreferences((prev) => ({ ...prev, climbedMountainIds: [] }));
  };

  // 登頂済みの山リストオブジェクト
  const climbedMountains = useMemo(() => {
    const climbedSet = new Set(preferences.climbedMountainIds);
    return HYAKUMEIZAN_LIST.filter((m) => climbedSet.has(m.id));
  }, [preferences.climbedMountainIds]);

  // フィルター適用後のレコメンド山リスト
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((m) => {
      const matchesSearch =
        m.name.includes(searchQuery) ||
        m.yomi.includes(searchQuery) ||
        m.prefectures.some((p) => p.includes(searchQuery)) ||
        m.features.some((f) => f.includes(searchQuery));
      const matchesDiff = selectedDifficulty === "all" || m.difficulty === selectedDifficulty;
      const matchesRegion = selectedRegion === "all" || m.region === selectedRegion;
      return matchesSearch && matchesDiff && matchesRegion;
    });
  }, [recommendations, searchQuery, selectedDifficulty, selectedRegion]);

  // ステージ別にグループ化
  const stageGroups = useMemo(() => {
    const groups: Record<StageId, RecommendedMountain[]> = {
      stage1: [],
      stage2: [],
      stage3: [],
      stage4: [],
    };

    filteredRecommendations.forEach((m) => {
      if (groups[m.stage]) {
        groups[m.stage].push(m);
      }
    });

    return groups;
  }, [filteredRecommendations]);

  // 現在のスポットライト山（マップ選択中または第1位の推奨山）
  const spotlightMountain = useMemo(() => {
    if (selectedMountainId) {
      const found = filteredRecommendations.find((m) => m.id === selectedMountainId);
      if (found) return found;
    }
    return filteredRecommendations[0] || null;
  }, [selectedMountainId, filteredRecommendations]);

  // 次に控えるおすすめ山（スポットライト以外の直近2山）
  const nextRecommendations = useMemo(() => {
    if (!spotlightMountain) return [];
    return filteredRecommendations
      .filter((m) => m.id !== spotlightMountain.id)
      .slice(0, 2);
  }, [filteredRecommendations, spotlightMountain]);

  const totalCount = HYAKUMEIZAN_LIST.length;
  const climbedCount = preferences.climbedMountainIds.length;
  const unclimbedCount = totalCount - climbedCount;
  const progressPercent = Math.round((climbedCount / totalCount) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navbar */}
      <Navbar
        climbedCount={climbedCount}
        totalCount={totalCount}
        isUsingRealJev={isUsingRealJev}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenClimbedModal={() => setIsClimbedModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Service Header & Quick Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>日本百名山 最適登順ナビゲーター</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-xs text-slate-600 self-end sm:self-auto font-medium">
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{climbedCount}/{totalCount}座 ({progressPercent}%)</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center space-x-1">
              <MountainIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>未登頂 {unclimbedCount}座</span>
            </span>
          </div>
        </div>

        {/* User Preferences Form */}
        <PreferencesBar
          preferences={preferences}
          targetListId={targetListId}
          onChangePreferences={handleUpdatePreferences}
          onChangeTargetList={setTargetListId}
          isLoading={isLoading}
          onDetectLocation={handleDetectCurrentLocation}
          isLocating={isLocating}
        />

        {/* First View: Interactive Map & Spotlight Mountain */}
        <div ref={mapSectionRef} className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
          {/* Left Column (Desktop: Left Spotlight, Mobile: Below Map) */}
          <div className="order-2 lg:order-1 lg:col-span-4 flex flex-col gap-4">
            {/* Spotlight Mountain Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                    <Compass className="w-4 h-4 text-emerald-600" />
                    <span>
                      {selectedMountainId
                        ? "マップ選択中の山"
                        : "最初におすすめの山"}
                    </span>
                  </div>
                  {selectedMountainId && (
                    <button
                      onClick={() => setSelectedMountainId(null)}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-lg transition-colors"
                    >
                      第1位に戻す
                    </button>
                  )}
                </div>

                {spotlightMountain ? (
                  <div>
                    {/* Cinematic Mountain Photo */}
                    <div className="relative h-64 sm:h-72 lg:h-80 rounded-2xl overflow-hidden mb-3.5 bg-slate-950 group">
                      <img
                        src={spotlightMountain.imageUrl}
                        alt={spotlightMountain.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="eager"
                      />
                      {/* Alpine Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/25 pointer-events-none" />

                      {/* Floating Top Left Rank & Difficulty */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-400 text-amber-950 shadow-md backdrop-blur-md">
                          #{spotlightMountain.rank}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/50 text-white backdrop-blur-md border border-white/20">
                          {spotlightMountain.difficulty === "beginner"
                            ? "初級"
                            : spotlightMountain.difficulty === "intermediate"
                            ? "中級"
                            : "上級"}
                        </span>
                      </div>

                      {/* Bottom Title & Specs over Photo */}
                      <div className="absolute bottom-3 left-3.5 right-3.5 z-10 text-white">
                        <div className="text-[11px] text-white/70 font-medium tracking-wide drop-shadow">
                          {spotlightMountain.yomi}
                        </div>
                        <div className="flex items-baseline justify-between gap-2 mt-0.5">
                          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md truncate">
                            {spotlightMountain.name}
                          </h3>
                          <span className="text-base font-bold text-emerald-300 font-mono tracking-wide drop-shadow shrink-0">
                            {spotlightMountain.elevation.toLocaleString()}m
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 text-xs text-white/90 drop-shadow mt-1.5">
                          <span className="flex items-center space-x-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{spotlightMountain.prefectures.join("・")}</span>
                          </span>
                          <span className="text-white/40">·</span>
                          <span className="flex items-center space-x-1 font-medium shrink-0">
                            <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{spotlightMountain.standardCourseTimeHours}h</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Clean Recommendation Insight */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 mb-3 flex items-start space-x-2.5">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {spotlightMountain.recommendationReason}
                        </p>
                      </div>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                        {Math.round(spotlightMountain.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400">
                    条件に該当する山がありません
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {spotlightMountain && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleToggleClimbed(spotlightMountain.id)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                      preferences.climbedMountainIds.includes(spotlightMountain.id)
                        ? "bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 border border-slate-200"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {preferences.climbedMountainIds.includes(spotlightMountain.id)
                        ? "登頂済み（取消）"
                        : "登頂済みにする"}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Next Recommendations Mini Cards */}
            {nextRecommendations.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 hidden lg:block">
                <div className="text-xs font-bold text-slate-700 mb-2.5 flex items-center justify-between">
                  <span>次に控えるおすすめ山</span>
                </div>
                <div className="space-y-2">
                  {nextRecommendations.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMountainId(m.id)}
                      className="w-full text-left p-2 rounded-2xl hover:bg-slate-50 transition-colors flex items-center space-x-3 group border border-transparent hover:border-slate-100"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-900 relative">
                        <img
                          src={m.imageUrl}
                          alt={m.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded-md bg-black/60 text-white text-[9px] font-mono font-bold backdrop-blur-xs">
                          #{m.rank}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between">
                          <span className="font-bold text-xs text-slate-800 truncate">{m.name}</span>
                          <span className="text-[11px] font-mono font-bold text-emerald-700">{m.elevation}m</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1 truncate">
                          <span className="flex items-center space-x-0.5 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{m.prefectures.join("・")}</span>
                          </span>
                          <span>·</span>
                          <span className="flex items-center space-x-0.5 shrink-0">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{m.standardCourseTimeHours}h</span>
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Map (Desktop: Right, Mobile: Top) */}
          <div className="order-1 lg:order-2 lg:col-span-8">
            <MountainMap
              mountains={filteredRecommendations}
              climbedIds={preferences.climbedMountainIds}
              userPrefecture={preferences.prefecture}
              onToggleClimbed={handleToggleClimbed}
              selectedMountainId={selectedMountainId}
              onSelectMountain={(m) => setSelectedMountainId(m.id)}
              heightClassName="h-[380px] sm:h-[460px] lg:h-[620px]"
            />
          </div>
        </div>

        {/* View Switcher & Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
          {/* View Mode Tabs */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveView("stages")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeView === "stages"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>4段階ロードマップ</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                {unclimbedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveView("ranking")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeView === "ranking"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ListOrdered className="w-4 h-4 text-blue-600" />
              <span>全山おすすめ順</span>
            </button>

            <button
              onClick={() => setActiveView("climbed")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeView === "climbed"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>登頂済み ({climbedCount})</span>
            </button>
          </div>

          {/* Search & Difficulty Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="山名・特徴で絞り込み..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            >
              <option value="all">難易度: 全て</option>
              <option value="beginner">初級のみ</option>
              <option value="intermediate">中級のみ</option>
              <option value="advanced">上級のみ</option>
              <option value="expert">難関のみ</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 mb-4 animate-bounce">
              <MountainIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              あなたに最適な登順を計算中...
            </h3>
            <p className="text-xs text-slate-500">
              {preferences.prefecture}からの距離・難易度・ステップアップ性を評価しています
            </p>
          </div>
        ) : activeView === "climbed" ? (
          /* Climbed View */
          <div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-emerald-950 text-base flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>登頂済みの山コレクション ({climbedMountains.length}座)</span>
                </h3>
                <p className="text-xs text-emerald-800 mt-1">
                  すでに登った山はロードマップから除外され、残りの未登頂の山で最適な順序が組まれています。
                </p>
              </div>
              <button
                onClick={() => setIsClimbedModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap self-start sm:self-auto"
              >
                一括登録・編集する
              </button>
            </div>

            {climbedMountains.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                <MountainIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-700 text-sm mb-1">
                  まだ登頂済みの山が登録されていません
                </p>
                <p className="text-xs text-slate-400 mb-4">
                  ロードマップの山カードにある「登った！」ボタンや、右上の「登頂済み」ボタンから登録できます。
                </p>
                <button
                  onClick={() => setIsClimbedModalOpen(true)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  登った山を登録する
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {climbedMountains.map((m) => (
                  <div
                    key={m.id}
                    className="group relative bg-white rounded-3xl border border-emerald-200/70 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                      {m.imageUrl ? (
                        <img
                          src={m.imageUrl}
                          alt={m.name}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-sm backdrop-blur-md">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>登頂済</span>
                        </span>
                      </div>

                      <div className="absolute top-2.5 right-2.5 z-10">
                        <button
                          onClick={() => handleToggleClimbed(m.id)}
                          className="px-2.5 py-1 bg-black/40 hover:bg-rose-600/90 backdrop-blur-md text-white/80 hover:text-white rounded-full text-[10px] font-semibold transition-colors border border-white/20"
                          title="登頂済みを解除してロードマップに戻す"
                        >
                          解除
                        </button>
                      </div>

                      {/* Bottom Info over Photo */}
                      <div className="absolute bottom-2.5 left-3 right-3 z-10 text-white">
                        <div className="text-[10px] text-white/70 font-mono">No.{m.number}</div>
                        <div className="flex items-baseline justify-between gap-1">
                          <h4 className="font-black text-lg text-white truncate drop-shadow">{m.name}</h4>
                          <span className="text-xs font-mono font-bold text-emerald-300 drop-shadow shrink-0">
                            {m.elevation.toLocaleString()}m
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-[11px] text-white/80 mt-1">
                          <span className="flex items-center space-x-0.5 truncate">
                            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate">{m.prefectures.join("・")}</span>
                          </span>
                          <span className="text-white/40">·</span>
                          <span className="shrink-0 font-medium">
                            {m.difficulty === "beginner" ? "初級" : m.difficulty === "intermediate" ? "中級" : "上級"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeView === "ranking" ? (
          /* Ranking List View */
          <div>
            <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
              <span>
                全 <strong className="text-slate-800 font-bold">{filteredRecommendations.length}</strong> 座
                （登順おすすめ順）
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecommendations.map((mountain) => (
                <MountainCard
                  key={mountain.id}
                  mountain={mountain}
                  onToggleClimbed={handleToggleClimbed}
                  isClimbed={preferences.climbedMountainIds.includes(mountain.id)}
                  onFocusMap={handleFocusMountainOnMap}
                />
              ))}
            </div>

            {filteredRecommendations.length === 0 && (
              <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                該当する山がありませんでした。絞り込み条件を変更してください。
              </div>
            )}
          </div>
        ) : (
          /* 4-Stage Roadmap View */
          <div className="space-y-8">

            {STAGES.map((stage) => {
              const stageMountains = stageGroups[stage.id as StageId] || [];

              return (
                <section
                  key={stage.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs relative overflow-hidden"
                >
                  {/* Stage Header */}
                  <div className="border-b border-slate-100/80 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
                          {stage.name.split(":")[0]}
                        </span>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900">
                          {stage.name.split(":")[1] || stage.name}
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500">
                        {stage.subtitle}
                      </p>
                    </div>

                    <div className="self-start sm:self-auto">
                      <span className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1 bg-slate-100/90 text-slate-700 rounded-full">
                        <MountainIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{stageMountains.length}座</span>
                      </span>
                    </div>
                  </div>

                  {/* Stage Mountains Grid */}
                  {stageMountains.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      このステージの山はすべて登頂済み、またはフィルター条件に一致しません。
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {stageMountains.map((mountain) => (
                        <MountainCard
                          key={mountain.id}
                          mountain={mountain}
                          onToggleClimbed={handleToggleClimbed}
                          isClimbed={preferences.climbedMountainIds.includes(mountain.id)}
                          onFocusMap={handleFocusMountainOnMap}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <MountainIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Tojun (登順)</p>
              <p className="text-[11px] text-slate-400">
                Tojun (登順) · 日本百名山ステップアップ・ロードマップ
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 text-slate-400 text-xs">
            <div className="flex items-center space-x-4">
              <span>百名山100座対応</span>
              <button
                onClick={() => setIsApiKeyModalOpen(true)}
                className="text-slate-400 hover:text-white font-medium transition-colors"
              >
                API設定
              </button>
            </div>
            <span className="text-[11px] text-slate-400">
              写真: Wikimedia Commons (CC/PD) · 地図: 国土地理院 / OSM
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        isUsingRealJev={isUsingRealJev}
      />

      <ClimbedManagerModal
        isOpen={isClimbedModalOpen}
        onClose={() => setIsClimbedModalOpen(false)}
        allMountains={HYAKUMEIZAN_LIST}
        climbedIds={preferences.climbedMountainIds}
        onToggleMountain={handleToggleClimbed}
        onClearAll={handleClearAllClimbed}
        onBatchSelect={(ids) =>
          setPreferences((prev) => ({ ...prev, climbedMountainIds: ids }))
        }
      />

      {/* Toast Notification */}
      {locationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-500/40 text-xs font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{locationToast}</span>
        </div>
      )}
    </div>
  );
}
