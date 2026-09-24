# Tojun (登順)

> **居住地・体力・スタイルに合わせて挫折しない最適な登順を提案する、日本百名山ナビゲーター**

🔗 **Webサイト**: [https://tojun.yaklimber.com](https://tojun.yaklimber.com)

「百名山に挑戦したいけれど、どの山から登ればいいか分からない」「自分の住んでいる場所から無理なくステップアップできる順序を知りたい」「すでに登った山は除外して、残りの山を最適化したい」――
**Tojun (登順)** は、ユーザーの居住都道府県、登山経験レベル、登山スタイルを入力するだけで、日本百名山（100座）を**「どの順序で登ると挫折せず最高に楽しめるか」**をスコアリングして4段階のロードマップとして提案するWebサービスです。

---

## 🌟 主な特徴

1. **アクセス性と体力に合わせた最適登順スコアリング**
   - ユーザーの居住地（現在地GPS自動取得対応）からのアクセス性、山の標高・難易度・コースタイム、ユーザーの経験度を総合評価し、最適な登順スコアとマッチ率を算出。

2. **インタラクティブな全国登順マップ（Leaflet & 国土地理院/OSM対応）**
   - 日本百名山100座の位置を日本地図上にプロット。
   - ピンには**おすすめ登順（#1, #2...）**が印字され、4つのステップごとに色分け（STEP 1: 緑, STEP 2: 青, STEP 3: 紫, STEP 4: 橙、登頂済み: グレー）。
   - ユーザーの居住地（🏠 現在地）も同時に表示され、山域との距離感やアクセス性が視覚的に一目瞭然。
   - 標準地図と**国土地理院（淡色地図）**の切り替え、ピンをクリックしての山詳細ポップアップ、カードからピンへのスムーズなジャンプに対応。

3. **4段階のステップアップ・ロードマップ**
   - **STAGE 1**: 手始め・足慣らしの近場ハイク（低山・ロープウェイ活用）
   - **STAGE 2**: 標高と体力を上げる中級ステップ（2,000m超・登りごたえのある日帰り）
   - **STAGE 3**: 憧れのアルプス・名峰遠征（山小屋泊・連休での本格登山）
   - **STAGE 4**: 百名山完登へ！難関・大縦走（剱岳・幌尻岳などの最高難度）

4. **登頂済み山の除外・再計算機能**
   - 登った山にチェックを入れるだけで、即座にロードマップから除外され、残りの未登頂の山で最適な順序が再計算されます。
   - 一括管理モーダルから検索や地域別フィルターで既登山をまとめて登録可能。

5. **山岳写真を中心としたエモーショナルなデザイン**
   - 山の魅力を伝える大迫力の写真と、直感的なアイコン主体のUIを採用。

6. **設定の自動保存 & API連携**
   - 居住地や登頂済みリストはブラウザのlocalStorageに自動保存。
   - 必要に応じてTypeSafe API Keyを設定してリアルタイム判定モデルを利用可能。

---

## 🚀 クイックスタート

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定 (任意)

サーバー側でAPI Keyを設定したい場合は `.env` を作成します（ブラウザ画面上からも入力可能です）。

```bash
cp .env.example .env
# .env の TYPESAFE_API_KEY にキーを設定
```

> **TypeSafe API Keyの取得方法:**
> [TypeSafe AI Console](https://console.typesafe.ai) からサインアップしてAPIキーを取得できます。

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

### 4. 本番ビルド（静的エクスポート）

```bash
npm run build
```

`out/` ディレクトリに完全静的ファイル（HTML/CSS/JS）が生成されます。

---

## ☁️ Cloudflare Pages での公開手順

完全静的エクスポート構成（`output: 'export'`）に対応しているため、Cloudflare Pages の無料枠（転送量無制限）で即時公開できます。

1. **Cloudflare Dashboard** にログイン
2. **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**
3. `yakkun/Tojun` リポジトリを選択
4. **ビルド設定**：
   - **Framework preset**: `None` または `Next.js (Static HTML Export)`
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
5. **Save and Deploy** をクリック（約1分で本番URLが発行されます）

---

## 🛠 技術スタック

- **Framework**: Next.js 16 (App Router / Static Export), React 19, TypeScript
- **Hosting Target**: Cloudflare Pages
- **Styling**: Tailwind CSS
- **AI Engine**: TypeSafe AI Jev SDK (`@typesafe-ai/sdk`) [BYOK対応]
- **Icons**: Lucide Icons
- **Dataset**: 日本百名山100座マスタ（標高、山域、難易度、コースタイム、適期月、特徴タグ、アクセス情報）
