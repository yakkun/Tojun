"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { RecommendedMountain, StageId } from "@/types/mountain";
import { PREFECTURES, findPrefecture } from "@/data/prefectures";
import {
  Layers,
  MapPin,
  CheckCircle2,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface MountainMapProps {
  mountains: RecommendedMountain[];
  climbedIds: string[];
  userPrefecture: string;
  onToggleClimbed: (id: string) => void;
  selectedMountainId?: string | null;
  onSelectMountain?: (mountain: RecommendedMountain) => void;
  className?: string;
  heightClassName?: string;
}

export const MountainMap: React.FC<MountainMapProps> = ({
  mountains,
  climbedIds,
  userPrefecture,
  onToggleClimbed,
  selectedMountainId,
  onSelectMountain,
  className = "",
  heightClassName,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const [activeStageFilter, setActiveStageFilter] = useState<string>("all");
  const [showClimbed, setShowClimbed] = useState<boolean>(true);
  const [mapTileType, setMapTileType] = useState<"osm" | "gsi">("osm");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const climbedSet = useMemo(() => new Set(climbedIds), [climbedIds]);

  // ステージカラー定義
  const stageColors: Record<StageId, { bg: string; text: string; hex: string }> = useMemo(
    () => ({
      stage1: { bg: "bg-emerald-600", text: "text-white", hex: "#059669" },
      stage2: { bg: "bg-blue-600", text: "text-white", hex: "#2563eb" },
      stage3: { bg: "bg-purple-600", text: "text-white", hex: "#7c3aed" },
      stage4: { bg: "bg-amber-600", text: "text-white", hex: "#d97706" },
    }),
    []
  );

  // マーカー描画関数
  const renderMarkers = useCallback(
    (L: any, map: any) => {
      if (!map || !mapContainerRef.current) return;

      // 既存マーカークリア
      markersRef.current.forEach((m) => {
        try {
          m.remove();
        } catch {
          // ignore
        }
      });
      markersRef.current = [];

      if (userMarkerRef.current) {
        try {
          userMarkerRef.current.remove();
        } catch {
          // ignore
        }
        userMarkerRef.current = null;
      }

      // 1. ユーザーの居住地マーカー（HOME）
      const userPref = findPrefecture(userPrefecture);
      if (userPref && typeof userPref.lat === "number" && typeof userPref.lng === "number") {
        const homeHtml = `
          <div style="background-color: #0f172a; color: #38bdf8; border: 2px solid #38bdf8; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
            🏠
          </div>
        `;
        const homeIcon = L.divIcon({
          html: homeHtml,
          className: "custom-home-pin",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const userMarker = L.marker([userPref.lat, userPref.lng], {
          icon: homeIcon,
          zIndexOffset: 1000,
        }).addTo(map);

        userMarker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; padding: 4px;">
            <strong style="color: #0f172a; font-size: 14px;">📍 現在地（居住地）</strong><br/>
            <span style="color: #475569;">${userPref.name} (${userPref.region})</span>
          </div>
        `);
        userMarkerRef.current = userMarker;
      }

      // 2. 山マーカー
      mountains.forEach((m) => {
        if (typeof m.lat !== "number" || typeof m.lng !== "number") return;
        const isClimbed = climbedSet.has(m.id);

        // 登頂済み非表示フィルター
        if (isClimbed && !showClimbed) return;

        // ステージフィルター
        if (activeStageFilter !== "all" && m.stage !== activeStageFilter) return;

        const stageInfo = stageColors[m.stage] || { hex: "#64748b", bg: "bg-slate-600" };
        const pinColor = isClimbed ? "#64748b" : stageInfo.hex;
        const rankLabel = isClimbed ? "✓" : `#${m.rank}`;

        // カスタムピン HTML
        const pinHtml = `
          <div style="
            background-color: ${pinColor};
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: ${isClimbed ? "13px" : "10px"};
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            ${rankLabel}
          </div>
        `;

        const customIcon = L.divIcon({
          html: pinHtml,
          className: "custom-mountain-pin",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
        });

        const marker = L.marker([m.lat, m.lng], { icon: customIcon }).addTo(map);

        // ポップアップ内容
        const imgHtml = m.imageUrl
          ? `<div style="width: 100%; height: 125px; border-radius: 12px; overflow: hidden; margin-bottom: 8px; background-color: #0f172a; position: relative;">
               <img src="${m.imageUrl}" alt="${m.name}" style="width: 100%; height: 100%; object-fit: cover;" referrerpolicy="no-referrer" onerror="this.parentElement.style.display='none'" />
               <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(15,23,42,0.75) 0%, transparent 60%); pointer-events: none;"></div>
               <div style="position: absolute; bottom: 6px; left: 8px; right: 8px; display: flex; justify-content: space-between; align-items: baseline; color: white;">
                 <span style="font-size: 16px; font-weight: 900; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">${m.name}</span>
                 <span style="font-size: 12px; font-weight: 700; color: #6ee7b7; font-family: monospace; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">${m.elevation.toLocaleString()}m</span>
               </div>
             </div>`
          : `<div style="font-size: 16px; font-weight: 900; color: #0f172a; margin-bottom: 4px;">${m.name} <span style="font-size: 12px; color: #059669; font-weight: 700;">${m.elevation}m</span></div>`;

        const popupContent = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; min-width: 220px; max-width: 260px; padding: 2px;">
            ${imgHtml}
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="background: ${isClimbed ? "#059669" : pinColor}; color: white; padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 11px;">
                ${isClimbed ? "✓ 登頂済" : `#${m.rank}`}
              </span>
              <div style="font-size: 11px; color: #64748b; font-weight: 500;">
                📍 ${m.prefectures.join("・")} · ⏱ ${m.standardCourseTimeHours}h
              </div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 7px 9px; border-radius: 10px; font-size: 11px; color: #334155; line-height: 1.45;">
              ${m.recommendationReason}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on("click", () => {
          if (onSelectMountain) {
            onSelectMountain(m);
          }
        });

        markersRef.current.push(marker);
      });
    },
    [mountains, climbedSet, showClimbed, activeStageFilter, userPrefecture, stageColors, onSelectMountain]
  );

  // Leafletの初期化
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;
      const L = (await import("leaflet")).default;
      if (!isMounted || !mapContainerRef.current) return;

      leafletRef.current = L;

      // 既存のマップがあれば破棄
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // ignore
        }
        mapInstanceRef.current = null;
      }

      // Leafletコンテナ重複初期化ガード
      if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      // 日本全体を見渡せる中央座標
      const map = L.map(mapContainerRef.current, {
        center: [36.2048, 138.2529],
        zoom: 6,
        scrollWheelZoom: false,
      });

      // タイルレイヤー
      const tileUrl =
        mapTileType === "gsi"
          ? "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

      const attribution =
        mapTileType === "gsi"
          ? '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">国土地理院</a>'
          : '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

      L.tileLayer(tileUrl, { attribution, maxZoom: 18 }).addTo(map);

      if (isMounted) {
        mapInstanceRef.current = map;
        renderMarkers(L, map);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // ignore
        }
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }
    };
  }, [mapTileType, renderMarkers]);

  // フィルターや山データ更新時にマーカー再描画
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (leafletRef.current) {
      renderMarkers(leafletRef.current, mapInstanceRef.current);
    } else {
      import("leaflet").then((L) => {
        leafletRef.current = L.default;
        if (mapInstanceRef.current) {
          renderMarkers(L.default, mapInstanceRef.current);
        }
      });
    }
  }, [renderMarkers]);

  // マップサイズ変更時の再計算
  useEffect(() => {
    if (mapInstanceRef.current) {
      const timer = setTimeout(() => {
        try {
          mapInstanceRef.current?.invalidateSize();
        } catch {
          // ignore
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  // 選択された山にマップをフォーカス
  useEffect(() => {
    if (!selectedMountainId || !mapInstanceRef.current) return;
    const target = mountains.find((m) => m.id === selectedMountainId);
    if (target && typeof target.lat === "number" && typeof target.lng === "number") {
      try {
        mapInstanceRef.current.flyTo([target.lat, target.lng], 9, {
          duration: 1.2,
        });
      } catch {
        // ignore
      }
    }
  }, [selectedMountainId, mountains]);

  return (
    <div
      className={`relative bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 ${
        isExpanded ? "h-[750px]" : heightClassName || "h-[480px]"
      } ${className}`}
    >
      {/* Map Control Header */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-md pointer-events-auto text-xs">
          <button
            onClick={() => setActiveStageFilter("all")}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
              activeStageFilter === "all"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            全ピン ({mountains.length})
          </button>
          <button
            onClick={() => setActiveStageFilter("stage1")}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center space-x-1 ${
              activeStageFilter === "stage1"
                ? "bg-emerald-600 text-white"
                : "text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>STEP 1</span>
          </button>
          <button
            onClick={() => setActiveStageFilter("stage2")}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center space-x-1 ${
              activeStageFilter === "stage2"
                ? "bg-blue-600 text-white"
                : "text-blue-700 hover:bg-blue-50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            <span>STEP 2</span>
          </button>
          <button
            onClick={() => setActiveStageFilter("stage3")}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center space-x-1 ${
              activeStageFilter === "stage3"
                ? "bg-purple-600 text-white"
                : "text-purple-700 hover:bg-purple-50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
            <span>STEP 3</span>
          </button>
          <button
            onClick={() => setActiveStageFilter("stage4")}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center space-x-1 ${
              activeStageFilter === "stage4"
                ? "bg-amber-600 text-white"
                : "text-amber-700 hover:bg-amber-50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span>STEP 4</span>
          </button>

          {/* Toggle Climbed */}
          <button
            onClick={() => setShowClimbed(!showClimbed)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-colors flex items-center space-x-1 ${
              showClimbed
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-slate-300 text-slate-400"
            }`}
            title="登頂済みの山をマップ上に表示するか切り替え"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>登頂済</span>
          </button>
        </div>

        {/* Right Map Style and Expand Controls */}
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-md pointer-events-auto text-xs">
          {/* Tile Toggle */}
          <button
            onClick={() => setMapTileType(mapTileType === "osm" ? "gsi" : "osm")}
            className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center space-x-1"
            title="標準地図 / 国土地理院淡色地図"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>{mapTileType === "osm" ? "標準" : "地形"}</span>
          </button>

          {/* Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            title={isExpanded ? "マップを縮小" : "マップを拡大"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 shadow-md text-[11px] text-slate-600 flex items-center gap-2.5">
        <span className="flex items-center space-x-1 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
          <span>初級</span>
        </span>
        <span className="flex items-center space-x-1 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
          <span>中級</span>
        </span>
        <span className="flex items-center space-x-1 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
          <span>遠征</span>
        </span>
        <span className="flex items-center space-x-1 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
          <span>難関</span>
        </span>
        <span className="flex items-center space-x-1 font-medium text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
          <span>登頂済</span>
        </span>
      </div>
    </div>
  );
};
