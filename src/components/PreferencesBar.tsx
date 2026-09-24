"use client";

import React from "react";
import { PREFECTURES } from "@/data/prefectures";
import { MOUNTAIN_LISTS } from "@/data/mountain-lists";
import { UserPreferences } from "@/types/mountain";
import { MapPin, Compass, Shield, Mountain as MountainIcon, Check, LocateFixed } from "lucide-react";

interface PreferencesBarProps {
  preferences: UserPreferences;
  targetListId: string;
  onChangePreferences: (newPrefs: Partial<UserPreferences>) => void;
  onChangeTargetList: (listId: string) => void;
  isLoading: boolean;
  onDetectLocation?: () => void;
  isLocating?: boolean;
}

export const PreferencesBar: React.FC<PreferencesBarProps> = ({
  preferences,
  targetListId,
  onChangePreferences,
  onChangeTargetList,
  isLoading,
  onDetectLocation,
  isLocating = false,
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs p-3 sm:p-3.5 mb-4 sm:mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        {/* Controls Group */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 flex-1">
          {/* Residence Prefecture */}
          <div className="flex items-center space-x-1.5" title="居住地を設定（移動距離の計算基準）">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <select
              value={preferences.prefecture}
              onChange={(e) =>
                onChangePreferences({ prefecture: e.target.value, isCustomPrefecture: true })
              }
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all cursor-pointer"
            >
              {PREFECTURES.map((p) => (
                <option key={p.code} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            {onDetectLocation && (
              <button
                type="button"
                onClick={onDetectLocation}
                disabled={isLocating}
                className="px-2 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-xl text-xs transition-colors flex items-center space-x-1 disabled:opacity-50"
                title="現在地（GPS）から居住地を自動設定"
              >
                <LocateFixed
                  className={`w-3.5 h-3.5 ${isLocating ? "animate-spin text-emerald-600" : ""}`}
                />
              </button>
            )}
          </div>

          <div className="hidden sm:block w-px h-4 bg-slate-200" />

          {/* Experience Level */}
          <div className="flex items-center space-x-1.5" title="登山レベル">
            <Shield className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="inline-flex bg-slate-100/80 p-0.5 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => onChangePreferences({ experienceLevel: "beginner" })}
                className={`py-1 px-2.5 rounded-lg text-xs font-medium transition-all ${
                  preferences.experienceLevel === "beginner"
                    ? "bg-white text-emerald-700 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                初級
              </button>
              <button
                type="button"
                onClick={() => onChangePreferences({ experienceLevel: "intermediate" })}
                className={`py-1 px-2.5 rounded-lg text-xs font-medium transition-all ${
                  preferences.experienceLevel === "intermediate"
                    ? "bg-white text-blue-700 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                中級
              </button>
              <button
                type="button"
                onClick={() => onChangePreferences({ experienceLevel: "advanced" })}
                className={`py-1 px-2.5 rounded-lg text-xs font-medium transition-all ${
                  preferences.experienceLevel === "advanced"
                    ? "bg-white text-purple-700 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                健脚
              </button>
            </div>
          </div>

          <div className="hidden sm:block w-px h-4 bg-slate-200" />

          {/* Travel Style */}
          <div className="flex items-center space-x-1.5" title="山行スタイル">
            <Compass className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="inline-flex bg-slate-100/80 p-0.5 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => onChangePreferences({ travelPreference: "daytrip_first" })}
                className={`py-1 px-2.5 rounded-lg text-xs font-medium transition-all ${
                  preferences.travelPreference === "daytrip_first"
                    ? "bg-white text-amber-700 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                日帰り優先
              </button>
              <button
                type="button"
                onClick={() => onChangePreferences({ travelPreference: "stay_ok" })}
                className={`py-1 px-2.5 rounded-lg text-xs font-medium transition-all ${
                  preferences.travelPreference === "stay_ok"
                    ? "bg-white text-teal-700 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                遠征OK
              </button>
            </div>
          </div>
        </div>

        {/* Target Mountain List */}
        <div className="flex items-center space-x-2 self-start lg:self-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center space-x-1.5">
            {MOUNTAIN_LISTS.map((list) => {
              const isSelected = targetListId === list.id;
              return (
                <button
                  key={list.id}
                  onClick={() => list.available && onChangeTargetList(list.id)}
                  disabled={!list.available}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all flex items-center space-x-1 ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-xs font-bold"
                      : list.available
                      ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      : "bg-slate-50 text-slate-400 cursor-not-allowed border border-dashed border-slate-200"
                  }`}
                  title={list.description}
                >
                  <MountainIcon className="w-3 h-3" />
                  <span>{list.name}</span>
                </button>
              );
            })}
          </div>

          <span
            className="inline-flex items-center text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200/80"
            title="設定はブラウザに自動保存されています"
          >
            <Check className="w-3 h-3 text-emerald-600 mr-1" />
            保存済
          </span>
        </div>
      </div>
    </div>
  );
};
