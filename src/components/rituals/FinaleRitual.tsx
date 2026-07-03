import React, { useState } from 'react';
import { motion } from 'motion/react';
import { sound } from '../../utils/sound';
import { RefreshCw } from 'lucide-react';

interface GameProps {
  merit: number;
  hellMoney: number;
  karma: number;
  activeIncenseCount: number;
  onUpdateResources: (changes: { merit?: number; hellMoney?: number; karma?: number }) => void;
  onLog: (text: string, type: 'info' | 'success' | 'warn' | 'error' | 'divine') => void;
  onResetGame: () => void;
}

export const UltimateDivination: React.FC<GameProps> = ({
  merit,
  hellMoney,
  karma,
  activeIncenseCount,
  onUpdateResources,
  onLog,
  onResetGame
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [finalState, setFinalState] = useState<'betting' | 'throwing' | 'victory' | 'damn' | 'completed'>('betting');
  const [, setBlocks] = useState<{ b1: 'flat' | 'round'; b2: 'flat' | 'round' } | null>(null);

  const calculateWinChance = () => {
    let chance = 50;
    chance -= karma * 0.15; 
    chance += activeIncenseCount * 12; 
    return Math.max(10, Math.min(95, chance));
  };

  const handleFinaleThrow = () => {
    if (merit <= 0 && hellMoney <= 0) {
      onLog('❌ 兩袖清風！你沒有任何功德或冥紙可以作為賭注，靈魂不配叩問天意！', 'error');
      sound.playFail();
      return;
    }

    setFinalState('throwing');
    setIsPlaying(true);
    sound.playGong();

    onLog(`🔥 終極獻祭！傾盡一生財富功名（功德: ${merit}, 冥紙: ${hellMoney}），奉天承運，大帝裁決...`, 'divine');

    setTimeout(() => {
      const winChance = calculateWinChance();
      const isWinner = Math.random() * 100 < winChance;

      let b1: 'flat' | 'round' = 'flat';
      let b2: 'flat' | 'round' = 'flat';

      if (isWinner) {
        b1 = Math.random() < 0.5 ? 'flat' : 'round';
        b2 = b1 === 'flat' ? 'round' : 'flat';
      } else {
        const isAngry = Math.random() < 0.6;
        if (isAngry) {
          b1 = 'round';
          b2 = 'round';
        } else {
          b1 = 'flat';
          b2 = 'flat';
        }
      }

      setBlocks({ b1, b2 });
      setIsPlaying(false);

      if (isWinner) {
        setFinalState('victory');
        sound.playSuccess();
        sound.playBell();
        onLog(`😇 【天官賜福 · 聖筊】！玉皇大帝開恩，你的生生世世業障天債一筆勾銷，靈魂即刻飛升極樂天宮！`, 'divine');
      } else {
        setFinalState('damn');
        sound.playFail();
        onLog(`👹 【神明震怒 · 哭筊】！玉皇大帝搖頭拂袖。你被判入九幽冥界，靈魂即刻化作永恆虛無！`, 'error');
      }
    }, 2500);
  };

  const winChance = calculateWinChance();

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-black relative overflow-hidden">
      
      <div className="text-center space-y-4 relative z-10">
        <span className="text-[10px] bg-black text-white border-2 border-black px-4 py-1.5 rounded-full uppercase tracking-widest font-mono font-bold">
          🏆 第 17 關：大結局 (THE FINALE)
        </span>
        <h2 className="text-3xl font-black text-black tracking-tight font-serif">
          終極天命擲筊 (The Ultimate Divination)
        </h2>
        <p className="text-zinc-600 text-sm max-w-lg mx-auto leading-relaxed font-serif">
          你終於站在了玉皇大帝與太上老君面前。欲一舉洗淨十生十世的靈魂業債，你必須將你擁有的<strong className="text-black font-bold">所有功德與冥紙</strong>全部作為賭注，進行最後一次生死聖筊天命審判！
        </p>
      </div>

      <div className="my-8 relative z-10 bg-white p-6 rounded-2xl border-2 border-black max-w-md mx-auto space-y-6 shadow-[4px_4px_0px_0px_#000000]">
        {finalState === 'betting' && (
          <div className="space-y-6 text-center">
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-zinc-50 p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                <span className="text-zinc-500 uppercase font-serif font-bold">傾巢獻祭功德</span>
                <span className="text-black font-black block text-base mt-1">{merit} 功德</span>
              </div>
              <div className="bg-zinc-50 p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                <span className="text-zinc-500 uppercase font-serif font-bold">傾巢獻祭冥紙</span>
                <span className="text-black font-black block text-base mt-1">${hellMoney}</span>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 border-2 border-black rounded-xl space-y-2">
              <span className="text-xs text-black font-bold font-serif uppercase block">聖筊飛升成功率</span>
              <span className="text-4xl font-black font-mono text-black">{winChance.toFixed(1)}%</span>
              <p className="text-[10px] text-zinc-500 font-serif leading-relaxed mt-2">
                * 初始機率 50%，受你當前極高的 <b className="text-red-600">業障 ({karma})</b> 扣減，但可通過供奉點燃的 <b className="text-black underline">神香 (+{activeIncenseCount * 12}%)</b> 獲得逆天神明加持。
              </p>
            </div>

            <button
              onClick={handleFinaleThrow}
              className="w-full py-4 bg-black text-white hover:bg-zinc-900 font-black rounded-2xl transition-all shadow-[4px_4px_0px_0px_#52525b] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] uppercase tracking-widest text-sm flex items-center justify-center gap-2 border-2 border-black cursor-pointer"
            >
              ☯️ 孤注一擲 · 叩問生死天命
            </button>
          </div>
        )}

        {finalState === 'throwing' && (
          <div className="text-center py-8 space-y-6">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              className="w-16 h-16 border-4 border-black border-t-transparent rounded-full mx-auto"
            />
            <div className="space-y-1">
              <span className="text-xs text-black font-serif uppercase tracking-wider block animate-pulse font-black">筊杯凌空狂舞中...</span>
              <span className="text-zinc-500 text-xs font-serif block">滿天神佛正俯瞰你的功德本紀...</span>
            </div>
          </div>
        )}

        {finalState === 'victory' && (
          <div className="text-center py-6 space-y-6">
            <div className="flex gap-4 justify-center">
              <div className="w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center text-xs font-bold text-black font-serif shadow-[2px_2px_0px_0px_#000000]">
                凸 (突起)
              </div>
              <div className="w-16 h-16 bg-zinc-100 border-2 border-zinc-400 rounded-xl flex items-center justify-center text-xs font-bold text-zinc-500 font-serif shadow-sm">
                平 (平面)
              </div>
            </div>

            <div className="p-4 bg-zinc-50 border-4 border-black rounded-xl space-y-2">
              <h3 className="text-xl font-black text-black uppercase tracking-wider font-serif">🌟 【天降聖筊 · 飛升成功】</h3>
              <p className="text-xs text-zinc-600 font-serif leading-relaxed">
                玉皇大帝面露慈悲笑容。你的多生多世業障盡數消退。七彩佛光普照，你的法身飛升至極樂淨土，與天地同壽！
              </p>
            </div>

            <button
              onClick={onResetGame}
              className="w-full py-4 bg-black text-white hover:bg-zinc-900 font-black rounded-2xl font-serif text-sm uppercase tracking-widest transition-all cursor-pointer border-2 border-black shadow-[3px_3px_0px_0px_#000000] active:scale-95"
            >
              😇 重回凡塵歷練 (開始新遊戲)
            </button>
          </div>
        )}

        {finalState === 'damn' && (
          <div className="text-center py-6 space-y-6">
            <div className="flex gap-4 justify-center">
              <div className="w-16 h-16 bg-red-100 border-4 border-red-600 rounded-full flex items-center justify-center text-xs font-bold text-red-600 animate-pulse font-serif shadow-[2px_2px_0px_0px_rgba(220,38,38,0.2)]">
                凸 (突起)
              </div>
              <div className="w-16 h-16 bg-red-100 border-4 border-red-600 rounded-full flex items-center justify-center text-xs font-bold text-red-600 animate-pulse font-serif shadow-[2px_2px_0px_0px_rgba(220,38,38,0.2)]">
                凸 (突起)
              </div>
            </div>

            <div className="p-4 bg-red-50 border-4 border-red-600 rounded-xl space-y-2 text-left">
              <h3 className="text-lg font-black text-red-700 uppercase tracking-wider font-serif text-center">👹 【神怒哭筊 · 萬劫不復】</h3>
              <p className="text-xs text-red-900 font-serif leading-relaxed">
                你的靈魂請求被斷然否決。阿鼻地獄之門洞開，狂怒的鬼差鎖鏈鎖住你的魂魄，拖下十八層無間深淵。你的一切化為飛灰！
              </p>
            </div>

            <button
              onClick={onResetGame}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl font-serif text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-black shadow-[3px_3px_0px_0px_#000000] active:scale-95"
            >
              <RefreshCw className="w-4 h-4" /> 重塑魂魄轉世 (重新開始)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
