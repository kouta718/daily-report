import { useState, useEffect } from "react";
import { Trash2, Play, Coffee, FileDown, RotateCcw, Plus, ListTodo } from "lucide-react";

// --- データ型 ---
type Record = {
  id: string;
  time: string;
  work: string;
  product: string;
};

// --- 製品マスタ(ダミー) ---
const dummyProductCodes: { [key: string]: string } = {
  "製品A":"100000-01",
  "製品B":"100001-01",
  "製品C":"100002-01",
  "製品D":"100003-01",
  "製品E":"100004-01",
  "製品F":"100005-01",
  "製品G":"100006-01",
  "製品H":"100007-01",
  "製品I":"100008-01",
  "その他":"200001-01",
  "清掃":"200002-01",
  "休憩":"200003-01",
  "棚卸作業":"200004-01",
  "業務終了":"200005-01"
};

// --- 作業内容マスタ(ダミー) ---
const workPresets = ["作業A", "作業B", "作業C", "作業D", "作業E"];

// --- メインコンポーネント ---
export default function App() {
  // --- 履歴管理 ---
  const [records, setRecords] = useState<Record[]>(() => {
    const saved = localStorage.getItem("daily_report_records");
    return saved ? JSON.parse(saved) : [];
  });

  // --- 入力状態管理 ---
  const [timeInput, setTimeInput] = useState("");
  const [workInput, setWorkInput] = useState("");
  const [productInput, setProductInput] = useState("");

  // --- 履歴保存 ---
  useEffect(() => {
    localStorage.setItem("daily_report_records", JSON.stringify(records));
  }, [records]);

  // --- 現在時刻取得 ---
  const getCurrentTime = () => new Date().toTimeString().split(" ")[0];

  // --- 新規記録追加 ---
  const addRecord = (time: string, work: string, product: string) => {
    const newRecord: Record = {
      id: crypto.randomUUID(),
      time: time || getCurrentTime(),
      work: work ,
      product: product || "その他",
    };
    setRecords((prev) => [...prev, newRecord].sort((a, b) => a.time.localeCompare(b.time)));
    setTimeInput("");
    setWorkInput("");
    setProductInput("");
  };

  // --- 履歴更新 ---
  const updateRecord = (id: string, field: keyof Record, value: string) => {
    setRecords((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, [field]: value } : r));
      return field === "time" ? updated.sort((a, b) => a.time.localeCompare(b.time)) : updated;
    });
  };

  // --- CSV出力 ---
  const exportCSV = () => {
    if (records.length === 0) return alert("データがありません");
    const today = new Date();
    // YYYY/MM/DD 形式
    const dateStr = today.toLocaleDateString("ja-JP", {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    let csv = "\uFEFF"; // BOM (Excel文字化け防止)
    
    records.forEach((r, i) => {
      const serialNum = i + 1;
      const dateTimeStr = `${dateStr}  ${r.time}`; // 日付と時刻の間はスペース2つ
      
      // 製品マスタからコードを検索
      const code = dummyProductCodes[r.product];
      // マスタにあれば「コードのみ」、なければ「入力値」そのまま
      const prodOut = code ? `${code}` : r.product;

      // 各項目を結合
      const row = `${serialNum},${dateTimeStr},${r.work},${prodOut}`;
      csv += row + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    // ファイル名: report_YYYY-MM-DD.csv
    const timestamp = today.getFullYear().toString().slice(-2) +
      (today.getMonth() + 1).toString().padStart(2, '0') +
      today.getDate().toString().padStart(2, '0') +
      today.getHours().toString().padStart(2, '0') +
      today.getMinutes().toString().padStart(2, '0') +
      today.getSeconds().toString().padStart(2, '0');

    a.download = `${timestamp}.csv`;
    a.click();
    URL.revokeObjectURL(url); // メモリ解放
  };

  // --- レンダリング ---
  return (
    <div className="max-w-md mx-auto p-4 space-y-6 font-sans bg-white text-gray-900 min-h-screen dark:bg-slate-900 dark:text-gray-100">
      <header className="text-center border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-xl font-bold flex items-center justify-center gap-2">
          <ListTodo className="text-blue-600 dark:text-blue-400" /> 日報
        </h1>
      </header>

      {/* スマート入力エリア */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => addRecord("", "", "休憩")}
          className="border border-amber-200 dark:border-amber-800 p-4 rounded-xl bg-amber-50 text-amber-900 active:bg-amber-100 dark:bg-amber-900 dark:text-amber-100 dark:active:bg-amber-800 flex items-center justify-center gap-2 text-sm font-bold"
        >
          <Coffee size={18}/> 休憩
        </button>
        <button 
          onClick={() => {
            // 履歴が2つ以上ないと「最後から2番目」は取れないのでチェック
            if (records.length >= 2) {
              const targetRecord = records[records.length - 2]; // 最後から2番目を取得
              addRecord("", targetRecord.work, targetRecord.product);
            } else if (records.length === 1) {
              // 1つしかない場合は、その1つをコピー
              const targetRecord = records[0];
              addRecord("", targetRecord.work, targetRecord.product);
            }
          }}
          className="border border-blue-600 dark:border-blue-400 p-4 rounded-xl bg-blue-600 text-white active:bg-blue-700 dark:bg-blue-500 dark:active:bg-blue-600 flex items-center justify-center gap-2 text-sm font-bold shadow-blue-200 dark:shadow-blue-900 shadow-lg disabled:opacity-50"
          disabled={records.length === 0}
        >
          <Play size={18}/> 作業を再開
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => addRecord("", "朝礼", "")}
          className="border border-gray-200 dark:border-gray-700 py-4 rounded-xl bg-white active:bg-gray-100 dark:bg-slate-800 dark:active:bg-slate-700 shadow-sm text-xs"
        >
          朝礼
        </button>
        <button
          onClick={() => addRecord("", "", "清掃")}
          className="border border-gray-200 dark:border-gray-700 py-4 rounded-xl bg-white active:bg-gray-100 dark:bg-slate-800 dark:active:bg-slate-700 shadow-sm text-xs"
        >
          清掃
        </button>
        <button
          onClick={() => addRecord("", "", "棚卸作業")}
          className="border border-gray-200 dark:border-gray-700 py-4 rounded-xl bg-white active:bg-gray-100 dark:bg-slate-800 dark:active:bg-slate-700 shadow-sm text-xs"
        >
          棚卸作業
        </button>
        <button
          onClick={() => addRecord("", "", "業務終了")}
          className="border border-gray-200 dark:border-gray-700 py-4 rounded-xl bg-white active:bg-gray-100 dark:bg-slate-800 dark:active:bg-slate-700 shadow-sm text-xs"
        >
          業務終了
        </button>
      </div>

      {/* 手動入力エリア */}
      <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-2xl space-y-3">
        <div className="flex gap-2">
          <input
            type="time"
            step="1"
            value={timeInput}
            onChange={(e) => setTimeInput(e.target.value)}
            className="w-1/3 p-3 rounded-lg border border-gray-300 dark:border-slate-700 font-mono text-base focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-inherit"
          />
          <input 
            list="work-options"
            type="text"
            placeholder="作業内容"
            value={workInput}
            onChange={(e) => setWorkInput(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-slate-700 text-base focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 placeholder-gray-400 dark:placeholder-slate-400 text-inherit"
          />
          <datalist id="work-options">
            {workPresets.map((work) => (
              <option key={work} value={work} />
            ))}
          </datalist>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input 
              list="product-options" // 下のdatalistと紐付け
              type="text"
              placeholder="製品,作業レシピを選択または入力"
              value={productInput}
              onChange={(e) => setProductInput(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-slate-700 text-base focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 placeholder-gray-400 dark:placeholder-slate-400 text-inherit"
            />
            {/* ドロップダウンの選択肢定義 */}
            <datalist id="product-options">
              {Object.keys(dummyProductCodes).map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          
          <button
            onClick={() => addRecord(timeInput, workInput, productInput)}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-bold active:scale-95 transition-transform dark:bg-gray-100 dark:text-gray-900"
          >
            <Plus />
          </button>
        </div>
        <p className="text-[12px] text-center text-slate-400 dark:text-slate-500 italic">※時刻未入力の場合は現在時刻をセットします</p>
      </div>

      {/* 履歴リスト */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 uppercase tracking-wider">今日の記録</h2>
        {records.map((r) => (
          <div
            key={r.id}
            className="flex gap-1 items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 p-1 rounded-xl shadow-sm"
          >
            <input
              type="time"
              step="1"
              value={r.time}
              onChange={(e) => updateRecord(r.id, "time", e.target.value)}
              className="w-auto text-xs font-mono p-2 border-none focus:ring-0 bg-transparent"
            />
            <input
              type="text"
              value={r.work}
              onChange={(e) => updateRecord(r.id, "work", e.target.value)}
              className="w-16 flex-1 text-xs p-2 border-none focus:ring-0 bg-transparent"
            />
            <input
              type="text"
              value={r.product}
              onChange={(e) => updateRecord(r.id, "product", e.target.value)}
              className="w-20 text-xs p-2 border-none focus:ring-0 bg-transparent text-gray-500 dark:text-gray-300 text-right"
              placeholder="製品"
            />
            <button
              onClick={() => setRecords(records.filter(x => x.id !== r.id))}
              className="text-red-400 dark:text-red-300 p-2 active:text-red-600 dark:active:text-red-400"
            >
              <Trash2 size={18}/>
            </button>
          </div>
        ))}
      </div>

      {/* アクション */}
      <div className="grid grid-cols-2 gap-4 pt-6">
        <button
          onClick={() => window.confirm("全データを削除しますか？") && setRecords([])}
          className="p-4 rounded-xl border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 active:bg-red-50 dark:active:bg-red-950 flex items-center justify-center gap-2 font-medium"
        >
          <RotateCcw size={18}/> 全削除
        </button>
        <button
          onClick={exportCSV}
          className="p-4 rounded-xl bg-green-600 text-white active:bg-green-700 dark:bg-green-800 dark:active:bg-green-600 flex items-center justify-center gap-2 font-bold shadow-lg shadow-green-100 dark:shadow-green-900"
        >
          <FileDown size={18}/> CSV保存
        </button>
      </div>
    </div>
  );
}