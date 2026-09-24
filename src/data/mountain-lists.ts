import { MountainListMeta, StageInfo } from "@/types/mountain";
import { HYAKUMEIZAN_LIST } from "./mountains-hyakumeizan";

export const MOUNTAIN_LISTS: MountainListMeta[] = [
  {
    id: "hyakumeizan",
    name: "日本百名山",
    nameKana: "にほんひゃくめいざん",
    count: 100,
    description: "作家・登山家の深田久弥が自ら登頂した山から選定した名峰100座。品格・歴史・個性を兼ね備える日本の山の最高峰コレクション。",
    available: true,
  },
  {
    id: "nihon_nihyakumeizan",
    name: "日本二百名山",
    nameKana: "にほんにひゃくめいざん",
    count: 100,
    description: "深田クラブが百名山に続く100座として選定。より野趣あふれる静穏な名山が揃う。（拡張対応準備中）",
    available: false,
  },
  {
    id: "kansai_hyakumeizan",
    name: "関西百名山",
    nameKana: "かんさいひゃくめいざん",
    count: 100,
    description: "近畿地方を中心に選定された親しみやすい名山リスト。関西在住ハイカーのステップアップに最適。（拡張対応準備中）",
    available: false,
  },
  {
    id: "flower_hyakumeizan",
    name: "花の百名山",
    nameKana: "はなのひゃくめいざん",
    count: 100,
    description: "田中澄江が代表する高山植物とともに選定した100山。季節ごとの花々を愛でる登山に。（拡張対応準備中）",
    available: false,
  },
];

export const STAGES: StageInfo[] = [
  {
    id: "stage1",
    name: "STEP 1: 手始め・足慣らしの近場ハイク",
    subtitle: "まずはここから！低山・ロープウェイ活用で自信をつける",
    description: "居住地から比較的アクセスしやすく、登山道が整備されている山やロープウェイ・リフトで標高差を抑えられる山。登山靴やウェアに慣れ、百名山ハイクの第1歩を踏み出すフェーズです。",
    color: "emerald",
  },
  {
    id: "stage2",
    name: "STEP 2: 標高と体力を上げる中級ステップ",
    subtitle: "標高2000m超・標準コースタイム5〜7時間の日帰り挑戦",
    description: "本格的な登山道や登りごたえのある標高差（800m〜1,200m程度）に挑戦。天候判断やペース配分、岩場・鎖場の基礎を身につけ、アルプス挑戦への足がかりとします。",
    color: "blue",
  },
  {
    id: "stage3",
    name: "STEP 3: 憧れのアルプス・名峰遠征",
    subtitle: "山小屋泊や遠征で挑む、日本屈指のスケールと絶景",
    description: "北アルプス・南アルプス・八ヶ岳・東北の深山など、遠征や山小屋1泊を伴う本格登山。高山植物や稜線の絶景、3,000m峰の雄大さを全身で堪能するフェーズです。",
    color: "purple",
  },
  {
    id: "stage4",
    name: "STEP 4: 百名山完登へ！難関・大縦走",
    subtitle: "険しい岩稜、長大な行程、孤高の最奥峰を制覇する",
    description: "剱岳のカニのタテバイ、幌尻岳の渡渉、南アルプス深南部の長大縦走、離島遠征（利尻岳・屋久島宮之浦岳）など、百名山完登のフィナーレを飾る最高峰・最難関ルート群です。",
    color: "amber",
  },
];
