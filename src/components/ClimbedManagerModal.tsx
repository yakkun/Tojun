"use client";

import React, { useState, useMemo } from "react";
import { X, Search, CheckCircle2, RotateCcw, Check, Sparkles } from "lucide-react";
import { Mountain } from "@/types/mountain";

interface ClimbedManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  allMountains: Mountain[];
  climbedIds: string[];
  onToggleMountain: (id: string) => void;
  onClearAll: () => void;
  onBatchSelect: (ids: string[]) => void;
}

export const ClimbedManagerModal: React.FC<ClimbedManagerModalProps> = ({
  isOpen,
  onClose,
  allMountains,
  climbedIds,
  onToggleMountain,
  onClearAll,
  onBatchSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  const climbedSet = useMemo(() => new Set(climbedIds), [climbedIds]);

  const regions = useMemo(() => {
    const set = new Set<string>();
    allMountains.forEach((m) => set.add(m.region));
    return ["all", ...Array.from(set)];
  }, [allMountains]);

  const filteredMountains = useMemo(() => {
    return allMountains.filter((m) => {
      const matchesSearch =
        m.name.includes(searchQuery) ||
        m.yomi.includes(searchQuery) ||
        m.prefectures.some((p) => p.includes(searchQuery));
      const matchesRegion = selectedRegion === "all" || m.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [allMountains, searchQuery, selectedRegion]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-4 sm:p-6 text-white shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>登頂済みの山を登録・管理</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              既に登った山にチェックを入れると、おすすめロードマップから除外され、次の最適な山が計算されます。
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Counter and Filter Controls */}
        <div className="py-3 space-y-2 border-b border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">
              登頂記録: <strong className="text-emerald-400 font-bold">{climbedIds.length}</strong> /{" "}
              {allMountains.length} 座 (
              {Math.round((climbedIds.length / (allMountains.length || 100)) * 100)}%)
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClearAll}
                disabled={climbedIds.length === 0}
                className="text-[11px] text-slate-400 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-slate-400 flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>全解除</span>
              </button>
            </div>
          </div>

          {/* Search bar & Region Pills */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="山名・都道府県で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
              {regions.map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-colors ${
                    selectedRegion === reg
                      ? "bg-emerald-600 text-white font-medium"
                      : "bg-slate-800/70 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  {reg === "all" ? "全地域" : reg}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mountain List Grid */}
        <div className="flex-1 overflow-y-auto py-2 my-1 pr-1 space-y-1.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {filteredMountains.map((m) => {
              const isClimbed = climbedSet.has(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => onToggleMountain(m.id)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                    isClimbed
                      ? "bg-emerald-950/40 border-emerald-500/60 text-white"
                      : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                        isClimbed
                          ? "bg-emerald-500 border-emerald-400 text-white"
                          : "border-slate-700 bg-slate-900"
                      }`}
                    >
                      {isClimbed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    {m.imageUrl && (
                      <div className="w-9 h-9 rounded-md overflow-hidden bg-slate-800 shrink-0">
                        <img
                          src={m.imageUrl}
                          alt={m.name}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <div className="truncate">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] text-slate-500 font-mono">#{m.number}</span>
                        <span className="font-semibold text-xs text-white truncate">{m.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {m.prefectures.join("・")} · {m.elevation}m
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      m.difficulty === "beginner"
                        ? "bg-emerald-900/60 text-emerald-300"
                        : m.difficulty === "intermediate"
                        ? "bg-blue-900/60 text-blue-300"
                        : m.difficulty === "advanced"
                        ? "bg-amber-900/60 text-amber-300"
                        : "bg-rose-900/60 text-rose-300"
                    }`}
                  >
                    {m.difficulty === "beginner"
                      ? "初級"
                      : m.difficulty === "intermediate"
                      ? "中級"
                      : m.difficulty === "advanced"
                      ? "上級"
                      : "難関"}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredMountains.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">
              該当する山が見つかりませんでした。
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            {climbedIds.length > 0
              ? `${climbedIds.length}座を除外してロードマップを最適化中`
              : "山をチェックすると登順が即時再計算されます"}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
};
