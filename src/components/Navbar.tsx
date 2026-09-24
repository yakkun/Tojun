"use client";

import React from "react";
import { Mountain as MountainIcon, Key, CheckCircle2 } from "lucide-react";

interface NavbarProps {
  climbedCount: number;
  totalCount: number;
  isUsingRealJev: boolean;
  onOpenApiKeyModal: () => void;
  onOpenClimbedModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  climbedCount,
  totalCount,
  isUsingRealJev,
  onOpenApiKeyModal,
  onOpenClimbedModal,
}) => {
  const percentage = Math.round((climbedCount / (totalCount || 100)) * 100);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/40">
            <MountainIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-white">Tojun</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                登順
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              日本百名山 最適登順ナビゲーター
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* API Settings Button */}
          <button
            onClick={onOpenApiKeyModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/60 transition-colors"
            title="外部API連携設定"
          >
            <Key className="w-3.5 h-3.5 text-slate-400" />
            <span>API設定</span>
            {isUsingRealJev && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="API連携中" />
            )}
          </button>

          {/* Climbed Mountains Counter */}
          <button
            onClick={onOpenClimbedModal}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 text-xs font-medium transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              登頂済み: <strong className="text-white font-bold">{climbedCount}</strong>/{totalCount}
            </span>
            <span className="text-[10px] bg-emerald-600/40 px-1.5 py-0.5 rounded text-emerald-300 hidden sm:inline">
              {percentage}%
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
