"use client";

import React from "react";
import { RecommendedMountain } from "@/types/mountain";
import {
  Check,
  Clock,
  MapPin,
  Calendar,
  Compass,
  Sparkles,
} from "lucide-react";

interface MountainCardProps {
  mountain: RecommendedMountain;
  onToggleClimbed: (id: string) => void;
  isClimbed: boolean;
  onFocusMap?: (mountain: RecommendedMountain) => void;
}

export const MountainCard: React.FC<MountainCardProps> = ({
  mountain,
  onToggleClimbed,
  isClimbed,
  onFocusMap,
}) => {
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return {
          label: "初級",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
        };
      case "intermediate":
        return {
          label: "中級",
          bg: "bg-sky-50 text-sky-700 border-sky-200",
          dot: "bg-sky-500",
        };
      case "advanced":
        return {
          label: "上級",
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
        };
      case "expert":
        return {
          label: "難関",
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500",
        };
      default:
        return {
          label: difficulty,
          bg: "bg-slate-50 text-slate-700 border-slate-200",
          dot: "bg-slate-400",
        };
    }
  };

  const getDistanceBadge = (dist: "near" | "medium" | "far") => {
    switch (dist) {
      case "near":
        return { label: "近郊", bg: "bg-teal-50 text-teal-700 border-teal-200" };
      case "medium":
        return { label: "中距離", bg: "bg-slate-100 text-slate-600 border-slate-200" };
      case "far":
        return { label: "遠征", bg: "bg-purple-50 text-purple-700 border-purple-200" };
    }
  };

  const diffBadge = getDifficultyBadge(mountain.difficulty);
  const distBadge = getDistanceBadge(mountain.distanceFromUserRank);
  const matchPercent = Math.round(mountain.confidence * 100);

  return (
    <div
      className={`group relative bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
        isClimbed
          ? "border-emerald-300/80 bg-emerald-50/15 opacity-85"
          : "border-slate-200 hover:border-emerald-400/80 hover:shadow-xl hover:-translate-y-0.5"
      }`}
    >
      <div>
        {/* Cinematic Mountain Photo Header */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-950 overflow-hidden">
          {mountain.imageUrl ? (
            <img
              src={mountain.imageUrl}
              alt={mountain.name}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : null}

          {/* Emotional Alpine Gradient Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/25 pointer-events-none" />

          {/* Floating Rank Badge (Top Left) */}
          <div className="absolute top-3.5 left-3.5 z-10">
            <div
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold shadow-md backdrop-blur-md flex items-center space-x-1 ${
                mountain.rank === 1
                  ? "bg-amber-400 text-amber-950 ring-2 ring-amber-300/80"
                  : mountain.rank === 2
                  ? "bg-slate-200 text-slate-900"
                  : mountain.rank === 3
                  ? "bg-amber-600 text-white"
                  : "bg-slate-950/70 border border-white/20 text-white"
              }`}
            >
              <span className="text-[10px] opacity-75">#</span>
              <span>{mountain.rank}</span>
            </div>
          </div>

          {/* Floating Climbed Toggle (Top Right) */}
          <div className="absolute top-3.5 right-3.5 z-10">
            <button
              onClick={() => onToggleClimbed(mountain.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md backdrop-blur-md ${
                isClimbed
                  ? "bg-emerald-600 text-white shadow-emerald-600/40"
                  : "bg-slate-950/60 hover:bg-emerald-600 text-white border border-white/20"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                  isClimbed ? "border-white bg-emerald-500" : "border-slate-300 bg-white/20"
                }`}
              >
                {isClimbed && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
              </div>
              <span>{isClimbed ? "登頂済み" : "登った！"}</span>
            </button>
          </div>

          {/* Bottom Title & Elevation Overlay */}
          <div className="absolute bottom-3 left-4 right-4 z-10">
            <div className="text-[11px] text-white/70 font-medium tracking-wide drop-shadow">
              {mountain.yomi}
            </div>
            <div className="flex items-baseline justify-between gap-2 mt-0.5">
              <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-md truncate">
                {mountain.name}
              </h3>
              <span className="text-sm font-bold text-emerald-300 font-mono tracking-wide drop-shadow shrink-0">
                {mountain.elevation.toLocaleString()}m
              </span>
            </div>

            {/* Quick Metrics Icons over Photo */}
            <div className="flex items-center space-x-3 text-xs text-white/90 drop-shadow mt-1.5">
              <span className="flex items-center space-x-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{mountain.prefectures.join("・")}</span>
              </span>
              <span className="text-white/40">·</span>
              <span className="flex items-center space-x-1 font-medium shrink-0">
                <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{mountain.standardCourseTimeHours}h</span>
              </span>
            </div>
          </div>
        </div>

        {/* Card Body: Minimal Badges & Atmosphere */}
        <div className="p-4 space-y-3">
          {/* Icon-First Attribute Badges */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {/* Difficulty Badge */}
            <span
              className={`inline-flex items-center space-x-1 text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${diffBadge.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${diffBadge.dot}`} />
              <span>{diffBadge.label}</span>
            </span>

            {/* Distance Badge */}
            <span
              className={`inline-flex items-center space-x-1 text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${distBadge.bg}`}
            >
              <Compass className="w-3 h-3 text-slate-500" />
              <span>{distBadge.label}</span>
            </span>

            {/* Season Badge */}
            {mountain.recommendedMonths && mountain.recommendedMonths.length > 0 && (
              <span className="inline-flex items-center space-x-1 text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>
                  {mountain.recommendedMonths[0]}〜
                  {mountain.recommendedMonths[mountain.recommendedMonths.length - 1]}月
                </span>
              </span>
            )}
          </div>

          {/* Feature Tags */}
          <div className="flex flex-wrap gap-1">
            {mountain.features.slice(0, 3).map((feature, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100/80 text-slate-600 font-medium"
              >
                #{feature}
              </span>
            ))}
          </div>

          {/* Evocative Description */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {mountain.description}
          </p>

          {/* Clean Recommendation Insight */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-700 leading-relaxed">
                {mountain.recommendationReason}
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 shrink-0">
              {matchPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Map Focus Footer */}
      {onFocusMap && (
        <div className="p-2.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-center">
          <button
            onClick={() => onFocusMap(mountain)}
            className="text-slate-600 hover:text-emerald-700 font-semibold text-xs flex items-center space-x-1.5 transition-colors py-0.5"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>地図で位置を確認</span>
          </button>
        </div>
      )}
    </div>
  );
};
