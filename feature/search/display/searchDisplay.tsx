import React from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Search, SignalHigh, BatteryCharging, Smile, Frown } from 'lucide-react';

interface TopItem {
  id: number;
  label: string;
  score: number;
}

const joyfulItems: TopItem[] = [
  { id: 1, label: '旅行', score: 10 },
  { id: 2, label: 'プレゼント', score: 8 },
  { id: 3, label: '手料理', score: 7 },
  { id: 4, label: 'メッセージ', score: 5 },
  { id: 5, label: 'ハグ', score: 4 },
  { id: 6, label: '映画鑑賞', score: 3 },
  { id: 7, label: '散歩', score: 2 },
  { id: 8, label: '手紙', score: 1 },
];

const unpleasantItems: TopItem[] = [
  { id: 1, label: '遅刻', score: -8 },
  { id: 2, label: '無視', score: -7 },
  { id: 3, label: '文句', score: -6 },
  { id: 4, label: '忘れ物', score: -5 },
  { id: 5, label: '予定破り', score: -4 },
  { id: 6, label: '約束破り', score: -3 },
  { id: 7, label: '不機嫌', score: -2 },
  { id: 8, label: '乱暴な言葉', score: -1 },
];

const SearchDisplay: React.FC = () => {
  return (
    <div
      className="max-w-sm mx-auto bg-black text-white min-h-screen flex flex-col"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 text-xs mt-2 mb-2">
        <span>9:41</span>
        <div className="flex items-center space-x-1">
          <SignalHigh className="w-4 h-4" />
          <span className="text-[10px]">LTE</span>
          <BatteryCharging className="w-4 h-4" />
        </div>
      </div>

      {/* Search Box */}
      <div className="px-4 mb-4">
        <div className="flex items-center bg-zinc-800 rounded-full px-3 py-2">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <Input
            placeholder="Search for items…"
            className="bg-transparent border-none focus:ring-0 placeholder-gray-500 flex-1 text-sm"
          />
        </div>
      </div>

      {/* Card Area */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="flex flex-col items-center justify-center py-6 rounded-lg">
            <Smile className="w-8 h-8 mb-2 text-green-400" />
            <span className="text-sm font-medium">嬉しいこと</span>
          </Card>
          <Card className="flex flex-col items-center justify-center py-6 rounded-lg">
            <Frown className="w-8 h-8 mb-2 text-red-400" />
            <span className="text-sm font-medium">嫌なこと</span>
          </Card>
        </div>
      </div>

      {/* Ranking Lists (2列表示、各リスト内スクロール可能) */}
      <div className="px-4 flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          {/* 嬉しいこと ランキング */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">嬉しいこと ランキング</CardTitle>
            </CardHeader>
            <CardContent className="p-2 max-h-48 overflow-y-auto">
              <ol className="list-decimal list-inside space-y-1 text-xs">
                {joyfulItems.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.label}</span>
                    <span>+{item.score}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* 嫌なこと ランキング */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">嫌なこと ランキング</CardTitle>
            </CardHeader>
            <CardContent className="p-2 max-h-48 overflow-y-auto">
              <ol className="list-decimal list-inside space-y-1 text-xs">
                {unpleasantItems.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.label}</span>
                    <span>{item.score}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="w-full flex justify-center py-2">
        <div className="w-16 h-1.5 bg-zinc-700 rounded-full" />
      </div>
    </div>
  );
};

export default SearchDisplay;
