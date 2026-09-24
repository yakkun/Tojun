"use client";

import React, { useState } from "react";
import { X, Key, Check, AlertCircle, ExternalLink, ShieldCheck } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  isUsingRealJev: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  isUsingRealJev,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setInputKey("");
    onSaveApiKey("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">推論API設定</h2>
            <p className="text-xs text-slate-400">外部スコアリングエンジン連携</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-300">
          <p className="text-xs leading-relaxed text-slate-300">
            Tojun (登順) は、登山順序の高度なパーソナライズ計算エンジンとして TypeSafe API を活用できます。お持ちの API Key を設定すると、クラウドの最適化エンジンと連携して動作します。
          </p>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>TypeSafe API Key</span>
              </label>
              {apiKey ? (
                <span className="text-[11px] text-emerald-400 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>設定済み（クラウド連携中）</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>未設定（ローカル推奨エンジン動作中）</span>
                </span>
              )}
            </div>

            <input
              type="password"
              placeholder="ts_live_..."
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 font-mono"
            />
            <p className="text-[11px] text-slate-400">
              ※APIキーはブラウザのLocalStorageまたは環境変数（
              <code className="text-emerald-300">TYPESAFE_API_KEY</code>）から安全に読み込まれます。
            </p>
          </div>

          <div className="text-xs space-y-1.5 text-slate-400 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
            <p className="font-medium text-slate-300">API Keyの設定方法：</p>
            <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px]">
              <li>TypeSafe AIのコンソールにサインイン</li>
              <li>「API Keys」から新しいキーを発行</li>
              <li>上記に入力して保存すると、クラウド推論エンジンと自動連携します</li>
              <li>未設定の場合でもローカル推奨ロジックで全機能をご利用いただけます</li>
            </ol>
            <a
              href="https://console.typesafe.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 text-xs font-medium pt-1"
            >
              <span>TypeSafe AI Console を開く</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={!inputKey}
              className="px-3 py-2 text-xs text-slate-400 hover:text-rose-400 disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
            >
              キーを消去 (ローカルに戻す)
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md shadow-emerald-900/30 flex items-center space-x-1.5 transition-all"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>保存完了！</span>
                  </>
                ) : (
                  <span>設定を保存</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
