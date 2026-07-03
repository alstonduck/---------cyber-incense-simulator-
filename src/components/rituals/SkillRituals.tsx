import React, { useState } from 'react';
import { motion } from 'motion/react';
import { sound } from '../../utils/sound';
import { Sparkles, HelpCircle, AlertTriangle, ShieldCheck, RotateCcw } from 'lucide-react';

interface GameProps {
  merit: number;
  hellMoney: number;
  karma: number;
  activeIncenseCount: number;
  onUpdateResources: (changes: { merit?: number; hellMoney?: number; karma?: number }) => void;
  onLog: (text: string, type: 'info' | 'success' | 'warn' | 'error' | 'divine') => void;
}

// -----------------------------------------------------------------
// 1. FORTUNE STICK 21 (求籤廿一 - BLACKJACK)
// -----------------------------------------------------------------
export const FortuneStick21: React.FC<GameProps> = ({
  merit,
  onUpdateResources,
  onLog
}) => {
  const [bet, setBet] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerSticks, setPlayerSticks] = useState<{ label: string; score: number }[]>([]);
  const [dealerSticks, setDealerSticks] = useState<{ label: string; score: number }[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playerTurn' | 'dealerTurn' | 'win' | 'lose' | 'draw'>('betting');

  const fortunePhrases = [
    { label: '大吉 (Great Fortune)', score: 11 },
    { label: '上吉 (High Fortune)', score: 10 },
    { label: '中吉 (Medium Fortune)', score: 9 },
    { label: '中平 (Fair Fortune)', score: 8 },
    { label: '下下籤 (Extreme Calamity)', score: 7 },
    { label: '小吉 (Small Fortune)', score: 6 },
    { label: '半吉 (Half Fortune)', score: 5 },
    { label: '平吉 (Peaceful Fortune)', score: 4 },
    { label: '凶 (Bad Luck)', score: 3 },
    { label: '大凶 (Disastrous)', score: 2 }
  ];

  const calculateScore = (sticks: { label: string; score: number }[]) => {
    let score = sticks.reduce((acc, s) => acc + s.score, 0);
    // If bust and has Aces (represented by score 11), downgrade them to 1
    let aces = sticks.filter(s => s.score === 11).length;
    while (score > 21 && aces > 0) {
      score -= 10;
      aces -= 1;
    }
    return score;
  };

  const getRandomStick = () => {
    const item = fortunePhrases[Math.floor(Math.random() * fortunePhrases.length)];
    return { ...item };
  };

  const handleStart = () => {
    if (merit < bet) {
      onLog('❌ 功德不足，無法進行此場叩問！請前往側邊欄多敲木魚！', 'error');
      sound.playFail();
      return;
    }
    onUpdateResources({ merit: -bet });
    sound.playBell();
    
    const p1 = getRandomStick();
    const p2 = getRandomStick();
    const d1 = getRandomStick();
    
    setPlayerSticks([p1, p2]);
    setDealerSticks([d1]);
    
    const initialScore = calculateScore([p1, p2]);
    if (initialScore === 21) {
      setGameState('win');
      onUpdateResources({ merit: Math.round(bet * 2.5) });
      onLog(`🌟 功德圓滿！你直接抽中了天界大吉廿一滿點籤！功德福報 +${Math.round(bet * 1.5)}`, 'success');
      sound.playSuccess();
    } else {
      setGameState('playerTurn');
      setIsPlaying(true);
      onLog(`🕯️ 虔誠奉上 ${bet} 點功德，小心求取竹籤，切忌貪心過重。`, 'info');
    }
  };

  const handleHit = () => {
    sound.playWoodBlock(1.2);
    const newStick = getRandomStick();
    const updated = [...playerSticks, newStick];
    setPlayerSticks(updated);
    
    const score = calculateScore(updated);
    if (score > 21) {
      setGameState('lose');
      setIsPlaying(false);
      onLog(`💀 神明震怒！你抽取的籤點總和高達 ${score} 點，竹籤崩碎！ ऑफर lost.`, 'error');
      sound.playFail();
    }
  };

  const handleStand = () => {
    setGameState('dealerTurn');
    sound.playWoodBlock(0.8);
    
    let currentDealer = [...dealerSticks];
    const interval = setInterval(() => {
      const dScore = calculateScore(currentDealer);
      if (dScore < 17) {
        currentDealer.push(getRandomStick());
        setDealerSticks([...currentDealer]);
        sound.playWoodBlock(0.9);
      } else {
        clearInterval(interval);
        const finalDealerScore = calculateScore(currentDealer);
        const finalPlayerScore = calculateScore(playerSticks);
        
        if (finalDealerScore > 21) {
          setGameState('win');
          onUpdateResources({ merit: bet * 2 });
          onLog(`🔥 神祇因貪念而爆牌（${finalDealerScore} 點）！你贏得了對決，功德 +${bet}!`, 'success');
          sound.playSuccess();
        } else if (finalPlayerScore > finalDealerScore) {
          setGameState('win');
          onUpdateResources({ merit: bet * 2 });
          onLog(`🎉 你的天命靈數（${finalPlayerScore} 點）蓋過了神祇（${finalDealerScore} 點）！功德 +${bet}!`, 'success');
          sound.playSuccess();
        } else if (finalPlayerScore < finalDealerScore) {
          setGameState('lose');
          onLog(`👹 神明對決落敗！神明以更高點數（${finalDealerScore} 點 vs ${finalPlayerScore} 點）壓制了你。 offerings 歸公。`, 'warn');
          sound.playFail();
        } else {
          setGameState('draw');
          onUpdateResources({ merit: bet });
          onLog(`☯️ 太極雙生，因果平局。你的功德 offerings 奉還回 earthly 錢夾。`, 'info');
        }
        setIsPlaying(false);
      }
    }, 600);
  };

  const pScore = calculateScore(playerSticks);
  const dScore = calculateScore(dealerSticks);

  return (
    <div className="bg-[#130f0d]/95 p-6 rounded-3xl border border-[#b08a5b]/40 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#e5c583]/5 rounded-full blur-2xl pointer-events-none"></div>
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] bg-[#e5c583]/10 border border-[#e5c583]/30 text-[#e5c583] px-3 py-1 rounded-full uppercase tracking-wider font-mono">
            天意對決（智）
          </span>
          <h3 className="text-2xl font-bold text-[#e5c583] mt-2 font-serif">求籤廿一 (Fortune Stick 21)</h3>
        </div>
        <div className="text-right text-sm text-zinc-400 font-mono">
          當前功德: <span className="text-[#e5c583] font-bold">{merit}</span> 功德
        </div>
      </div>

      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
        晃動神明籤筒，求取竹籤。請勿讓所得籤點總和超過 <strong className="text-[#e5c583] font-bold">21 點</strong>，否則天罰降臨，竹籤寸斷， offerings 盡數充公。
      </p>

      {gameState === 'betting' ? (
        <div className="space-y-4">
          <div className="bg-black/40 p-4 rounded-2xl border border-[#2d2117]">
            <label className="text-xs text-[#b08a5b] uppercase font-mono block mb-2">調配功德 Offering：</label>
            <div className="flex gap-2">
              {[50, 100, 200, 500].map(val => (
                <button
                  key={val}
                  onClick={() => { setBet(val); sound.playUiClick(); }}
                  className={`flex-1 py-2 rounded-xl font-mono text-sm transition-all border cursor-pointer ${
                    bet === val
                      ? 'bg-[#e5c583]/20 border-[#e5c583] text-[#e5c583] font-bold'
                      : 'bg-[#1c120c] border-[#2d2117] text-[#b08a5b] hover:bg-[#251d16]'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
            <input
              type="range"
              min={10}
              max={Math.min(merit, 2000)}
              step={10}
              value={bet}
              onChange={(e) => setBet(Number(e.target.value))}
              className="w-full mt-4 accent-[#e5c583]"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-1 font-mono">
              <span>最少: 10</span>
              <span>自定義: <b className="text-[#e5c583]">{bet}</b></span>
              <span>最大: {Math.min(merit, 2000)}</span>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={merit < bet}
            className="w-full py-4 bg-gradient-to-r from-[#b08a5b] to-[#1c120c] hover:from-[#e5c583] hover:to-[#b08a5b] hover:text-black text-white font-bold rounded-2xl transition-all shadow-lg uppercase tracking-widest text-sm flex items-center justify-center gap-2 border border-[#e5c583]/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Sparkles className="w-5 h-5 animate-pulse" /> 🕯️ 祈福並搖晃電子籤筒
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Altar Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gods Altar */}
            <div className="bg-black/30 p-4 rounded-2xl border border-[#2d2117] relative">
              <h4 className="text-xs text-[#b08a5b] font-mono uppercase mb-2">神明法案 (莊家)</h4>
              <div className="flex flex-wrap gap-2 min-h-[80px] items-center">
                {dealerSticks.map((s, idx) => (
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    key={idx}
                    className="bg-[#18120d] border-l-4 border-l-[#e5c583] border border-[#2d2117] px-3 py-2 rounded-xl text-xs font-mono text-zinc-300 shadow-md flex items-center gap-1"
                  >
                    🎋 {s.label} <span className="text-[#e5c583] font-bold">({s.score})</span>
                  </motion.div>
                ))}
              </div>
              <div className="absolute bottom-2 right-2 text-xs font-mono text-zinc-500">
                神壇點數: <span className="text-[#e5c583] font-bold">{dScore}</span>
              </div>
            </div>

            {/* Player Offering */}
            <div className="bg-black/30 p-4 rounded-2xl border border-[#2d2117] relative">
              <h4 className="text-xs text-[#b08a5b] font-mono uppercase mb-2">你的 offerings 手牌</h4>
              <div className="flex flex-wrap gap-2 min-h-[80px] items-center">
                {playerSticks.map((s, idx) => (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    key={idx}
                    className="bg-[#18120d] border-l-4 border-l-[#b08a5b] border border-[#2d2117] px-3 py-2 rounded-xl text-xs font-mono text-[#f3ece3] shadow-md flex items-center gap-1"
                  >
                    🎋 {s.label} <span className="text-[#b08a5b] font-bold">({s.score})</span>
                  </motion.div>
                ))}
              </div>
              <div className="absolute bottom-2 right-2 text-xs font-mono text-zinc-500">
                你的總點: <span className="text-[#b08a5b] font-bold">{pScore}</span>
              </div>
            </div>
          </div>

          {/* Verdict screen */}
          {!isPlaying && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-4 rounded-2xl border text-center ${
                gameState === 'win'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                  : gameState === 'lose'
                  ? 'bg-rose-950/40 border-rose-500/30 text-rose-400'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400'
              }`}
            >
              <span className="font-bold text-lg uppercase block tracking-wider font-serif">
                {gameState === 'win' && '😇 獲天尊庇佑 (聖筊 / WIN)'}
                {gameState === 'lose' && '👹 觸怒三界 (哭筊 / LOST)'}
                {gameState === 'draw' && '☯️ 乾坤平局 (TIE)'}
              </span>
              <button
                onClick={() => { setGameState('betting'); sound.playUiClick(); }}
                className="mt-3 px-6 py-2 bg-[#251d16] border border-[#2d2117] text-xs font-mono text-[#e5c583] rounded-xl hover:bg-[#e5c583] hover:text-black transition-all cursor-pointer"
              >
                再次扣問天意
              </button>
            </motion.div>
          )}

          {/* Action buttons */}
          {isPlaying && (
            <div className="flex gap-4">
              <button
                onClick={handleHit}
                className="flex-1 py-3 bg-[#251d16] hover:bg-[#b08a5b]/20 border border-[#b08a5b]/40 text-[#e5c583] font-bold rounded-xl text-sm font-mono transition-all cursor-pointer"
              >
                🎋 抽取下一支籤 (Hit)
              </button>
              <button
                onClick={handleStand}
                className="flex-1 py-3 bg-[#130f0d] hover:bg-[#18120d] border border-[#2d2117] text-zinc-300 font-bold rounded-xl text-sm font-mono transition-all cursor-pointer"
              >
                🛑 封箱聽天由命 (Stand)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// -----------------------------------------------------------------
// 2. DEITIES VS. DEMONS (太極神魔天平 - BACCARAT)
// -----------------------------------------------------------------
export const DeitiesDemons: React.FC<GameProps> = ({
  hellMoney,
  onUpdateResources,
  onLog
}) => {
  const [bet, setBet] = useState(500);
  const [prediction, setPrediction] = useState<'deity' | 'demon' | 'tie'>('deity');
  const [isPlaying, setIsPlaying] = useState(false);
  const [deityCards, setDeityCards] = useState<number[]>([]);
  const [demonCards, setDemonCards] = useState<number[]>([]);
  const [gameResult, setGameResult] = useState<'deity' | 'demon' | 'tie' | null>(null);

  const cardTalismanNames = [
    '無字天書', '玉皇寶印 🎴', '水官解厄 📜', '勾魂幽鎖 ⛓️', '開天神鑼 🔔', 
    '芭蕉風扇 🪭', '太乙青蓮 🪷', '金剛護盾 🛡️', '斬妖法劍 🗡️', '照妖寶鏡 🪞'
  ];

  const handlePlay = () => {
    if (hellMoney < bet) {
      onLog('❌ 冥紙不足以進行叩問挑戰！請在其他殿宇積累法力！', 'error');
      sound.playFail();
      return;
    }
    setIsPlaying(true);
    setGameResult(null);
    onUpdateResources({ hellMoney: -bet });
    sound.playBell();

    const predNames = { deity: '諸神 (天尊)', demon: '群魔 (妖魔)', tie: '太極 (平局)' };
    onLog(`⚖️ 神魔天平啟動！奉獻 ${bet} 冥紙，押注：${predNames[prediction]} 方勝出。`, 'info');

    setTimeout(() => {
      const d1 = Math.floor(Math.random() * 10);
      const d2 = Math.floor(Math.random() * 10);
      const m1 = Math.floor(Math.random() * 10);
      const m2 = Math.floor(Math.random() * 10);

      let deityHand = [d1, d2];
      let demonHand = [m1, m2];

      let deitySum = (d1 + d2) % 10;
      let demonSum = (m1 + m2) % 10;

      // Third card rules
      if (deitySum < 5) {
        const d3 = Math.floor(Math.random() * 10);
        deityHand.push(d3);
        deitySum = (deitySum + d3) % 10;
      }
      if (demonSum < 5) {
        const m3 = Math.floor(Math.random() * 10);
        demonHand.push(m3);
        demonSum = (demonSum + m3) % 10;
      }

      setDeityCards(deityHand);
      setDemonCards(demonHand);

      let winner: 'deity' | 'demon' | 'tie' = 'tie';
      if (deitySum > demonSum) winner = 'deity';
      else if (demonSum > deitySum) winner = 'demon';

      setGameResult(winner);
      setIsPlaying(false);

      if (winner === prediction) {
        let payout = bet * 2;
        if (winner === 'tie') payout = bet * 8; // Tie pays 8 to 1
        onUpdateResources({ hellMoney: payout });
        onLog(`🎉 天意顯赫！${predNames[winner]} 贏得了神魔爭霸（點數: ${Math.max(deitySum, demonSum)} 點）！你獲得 ${payout} 冥紙福報！`, 'success');
        sound.playSuccess();
      } else {
        onLog(`💀 押注失準！${predNames[winner]} 奪得掌控權。奉獻的 ${bet} 冥紙已被深淵吞噬。`, 'warn');
        sound.playFail();
      }
    }, 1200);
  };

  const getHandSum = (cards: number[]) => {
    return cards.reduce((acc, c) => acc + c, 0) % 10;
  };

  return (
    <div className="bg-[#130f0d]/95 p-6 rounded-3xl border border-[#b08a5b]/40 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#b08a5b]/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] bg-purple-950/80 border border-purple-500/30 text-purple-400 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
            天意對決（智）
          </span>
          <h3 className="text-2xl font-bold text-purple-400 mt-2 font-serif">太極神魔天平 (Deities vs. Demons)</h3>
        </div>
        <div className="text-right text-sm text-zinc-400 font-mono">
          當前冥紙: <span className="text-[#e5c583] font-bold">${hellMoney}</span>
        </div>
      </div>

      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
        預測諸天神明與地府妖魔雙方哪一方能在這場拔河中，令代表最高和諧的法寶總點數最接近 <strong className="text-purple-400 font-bold">9 點</strong>。遵循古老百家樂天規。
      </p>

      {!isPlaying && gameResult === null ? (
        <div className="space-y-4">
          <div className="bg-black/40 p-4 rounded-2xl border border-[#2d2117]">
            <label className="text-xs text-[#b08a5b] uppercase font-mono block mb-2">調配冥紙 Offerings：</label>
            <div className="flex gap-2 mb-4">
              {[200, 500, 1000, 5000].map(val => (
                <button
                  key={val}
                  onClick={() => { setBet(val); sound.playUiClick(); }}
                  className={`flex-1 py-2 rounded-xl font-mono text-sm transition-all border cursor-pointer ${
                    bet === val
                      ? 'bg-purple-950 border border-purple-500 text-purple-400 font-bold'
                      : 'bg-[#1c120c] border-[#2d2117] text-[#b08a5b] hover:bg-[#251d16]'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>

            <label className="text-xs text-[#b08a5b] uppercase font-mono block mb-2">請抉擇你的天命押注方向：</label>
            <div className="grid grid-cols-3 gap-2">
              {(['deity', 'demon', 'tie'] as const).map(side => (
                <button
                  key={side}
                  onClick={() => { setPrediction(side); sound.playUiClick(); }}
                  className={`py-3 rounded-xl font-mono text-sm transition-all border cursor-pointer ${
                    prediction === side
                      ? 'bg-purple-900/40 border border-purple-500 text-purple-400 font-bold'
                      : 'bg-[#1c120c] border-[#2d2117] text-[#b08a5b] hover:bg-[#251d16]'
                  }`}
                >
                  {side === 'deity' && '😇 諸神 (2.0x)'}
                  {side === 'demon' && '😈 群魔 (2.0x)'}
                  {side === 'tie' && '☯️ 太極和局 (8.0x)'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handlePlay}
            disabled={hellMoney < bet}
            className="w-full py-4 bg-gradient-to-r from-purple-700 to-purple-950 hover:from-purple-600 hover:to-purple-900 text-white font-bold rounded-2xl transition-all shadow-lg uppercase tracking-widest text-sm flex items-center justify-center gap-2 border border-purple-500/20 disabled:opacity-40 cursor-pointer"
          >
            ⚖️ 啟動神魔對決法陣
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center py-4">
            {isPlaying ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"
              />
            ) : (
              <div className="text-2xl font-bold font-serif">
                {gameResult === 'deity' && <span className="text-emerald-400">👼 諸天神明 掌天大勝</span>}
                {gameResult === 'demon' && <span className="text-red-500">👹 九幽厲鬼 屠戮凡塵</span>}
                {gameResult === 'tie' && <span className="text-amber-400">☯️ 太極交匯 乾坤和局</span>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deities Card Hand */}
            <div className="bg-black/30 p-4 rounded-2xl border border-[#2d2117] flex flex-col items-center">
              <span className="text-xs text-zinc-500 uppercase mb-2 font-mono">諸神法盤 (天界)</span>
              <div className="flex gap-2 justify-center min-h-[100px] items-center">
                {deityCards.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.8, rotateY: 90 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    className="w-16 h-24 bg-gradient-to-b from-emerald-950 to-zinc-900 border border-emerald-500/40 rounded-lg flex flex-col justify-between p-2 text-center text-xs font-mono text-emerald-300"
                  >
                    <span>👼</span>
                    <span className="text-base font-bold">{c}</span>
                    <span className="text-[9px] truncate">{cardTalismanNames[c] || c}</span>
                  </motion.div>
                ))}
              </div>
              <span className="text-xs text-zinc-400 mt-2 font-mono">天界餘數: <b className="text-emerald-400">{getHandSum(deityCards)} 點</b></span>
            </div>

            {/* Demons Card Hand */}
            <div className="bg-black/30 p-4 rounded-2xl border border-[#2d2117] flex flex-col items-center">
              <span className="text-xs text-zinc-500 uppercase mb-2 font-mono">群魔幽盤 (冥界)</span>
              <div className="flex gap-2 justify-center min-h-[100px] items-center">
                {demonCards.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.8, rotateY: -90 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    className="w-16 h-24 bg-gradient-to-b from-red-950 to-zinc-900 border border-red-500/40 rounded-lg flex flex-col justify-between p-2 text-center text-xs font-mono text-red-300"
                  >
                    <span>👹</span>
                    <span className="text-base font-bold">{c}</span>
                    <span className="text-[9px] truncate">{cardTalismanNames[c] || c}</span>
                  </motion.div>
                ))}
              </div>
              <span className="text-xs text-zinc-400 mt-2 font-mono">冥界餘數: <b className="text-red-400">{getHandSum(demonCards)} 點</b></span>
            </div>
          </div>

          {!isPlaying && (
            <button
              onClick={() => setGameResult(null)}
              className="w-full py-3 bg-[#251d16] hover:bg-[#b08a5b]/20 text-[#e5c583] hover:text-white rounded-xl font-mono text-sm border border-[#2d2117] cursor-pointer"
            >
              🔄 再次叩問神魔大印
            </button>
          )}
        </div>
      )}
    </div>
  );
};


// -----------------------------------------------------------------
// 3. UNDERWORLD HOLD 'EM (九幽煉獄梭哈 - 1P POKER)
// -----------------------------------------------------------------
export const UnderworldHoldEm: React.FC<GameProps> = ({
  merit,
  onUpdateResources,
  onLog
}) => {
  const [bet, setBet] = useState(200);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cards, setCards] = useState<{ id: number; symbol: string; suit: string; locked: boolean }[]>([]);
  const [stage, setStage] = useState<'betting' | 'draw' | 'result'>('betting');
  const [handRank, setHandRank] = useState<string>('');

  const symbols = [
    { name: '☯️ 太極符', value: 10 },
    { name: '🔥 金剛火', value: 9 },
    { name: '🪵 生死木', value: 8 },
    { name: '💀 孤魂幽', value: 7 },
    { name: '⚱️ 聚寶甕', value: 6 },
    { name: '📜 天地篆', value: 5 }
  ];

  const dealRandomCard = () => {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const suits = ['🔴 天界', '🟣 虛無', '🟢 幽冥', '🟡 塵寰'];
    const suit = suits[Math.floor(Math.random() * suits.length)];
    return {
      id: Math.random(),
      symbol: symbol.name,
      suit: suit,
      locked: false
    };
  };

  const handleStart = () => {
    if (merit < bet) {
      onLog('❌ 功德不足以銘刻本場五行咒印！', 'error');
      sound.playFail();
      return;
    }
    onUpdateResources({ merit: -bet });
    sound.playBell();

    const initialCards = Array.from({ length: 4 }, dealRandomCard);
    setCards(initialCards);
    setStage('draw');
    setIsPlaying(true);
    onLog(`📜 符籙儀式啟動！注入 ${bet} 點功德。請點擊鎖定你想保留的天命符籙。`, 'info');
  };

  const toggleLock = (index: number) => {
    if (stage !== 'draw') return;
    sound.playWoodBlock(1.4);
    setCards(cards.map((c, idx) => idx === index ? { ...c, locked: !c.locked } : c));
  };

  const handleDiscardAndDraw = () => {
    sound.playWoodBlock(0.8);
    const finalizedCards = cards.map(c => c.locked ? c : dealRandomCard());
    setCards(finalizedCards);
    setStage('result');
    setIsPlaying(false);

    // Count symbols
    const symbolCounts: { [key: string]: number } = {};
    const suitCounts: { [key: string]: number } = {};
    finalizedCards.forEach(c => {
      symbolCounts[c.symbol] = (symbolCounts[c.symbol] || 0) + 1;
      suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
    });

    const counts = Object.values(symbolCounts);
    const uniqueSuits = Object.keys(suitCounts).length;

    let payout = 0;
    let rank = '破敗殘卷 (無印)';

    if (counts.includes(4)) {
      rank = '✨ 諸神四大皆空之印 (同四印 / Four of a Kind)';
      payout = bet * 12;
    } else if (counts.includes(3)) {
      rank = '💥 三清天道之合 (同三印 / Three of a Kind)';
      payout = bet * 4;
    } else if (counts.filter(c => c === 2).length === 2) {
      rank = '☯️ 乾坤雙生法門 (兩對 / Two Pair)';
      payout = bet * 2;
    } else if (counts.includes(2)) {
      rank = '🏮 清香對對法印 (一對 / One Pair)';
      payout = bet * 1;
    } else if (uniqueSuits === 4) {
      rank = '🌈 五行歸一大圓滿 (同色同花 / Flush)';
      payout = bet * 5;
    } else {
      rank = '💀 荒野孤魂煞 (無對 / High Card)';
      payout = 0;
    }

    setHandRank(rank);

    if (payout > 0) {
      onUpdateResources({ merit: payout });
      onLog(`🎉 結成【${rank}】印記！因果契約確立，返還功德 +${payout}!`, 'success');
      sound.playSuccess();
    } else {
      onLog(`👻 印記碎裂（${rank}）！你的功德 offerings 慘遭九幽空無吞噬。`, 'warn');
      sound.playFail();
    }
  };

  return (
    <div className="bg-[#130f0d]/95 p-6 rounded-3xl border border-[#b08a5b]/40 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#e5c583]/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] bg-[#18120d] border border-[#2d2117] text-[#e5c583] px-3 py-1 rounded-full uppercase tracking-wider font-mono">
            天意對決（智）
          </span>
          <h3 className="text-2xl font-bold text-emerald-500 mt-2 font-serif">九幽煉獄梭哈 (Underworld Hold 'Em)</h3>
        </div>
        <div className="text-right text-sm text-zinc-400 font-mono">
          當前功德: <span className="text-[#e5c583] font-bold">{merit}</span> 功德
        </div>
      </div>

      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
        自四張五行符籙中拼湊出最強神祕咒印。點選鎖定你滿意的咒文鑰匙，丟棄多餘的並重新抽選，以拼湊出能震懾九泉的超強冥王陣法！
      </p>

      {stage === 'betting' ? (
        <div className="space-y-4">
          <div className="bg-black/40 p-4 rounded-2xl border border-[#2d2117]">
            <label className="text-xs text-[#b08a5b] uppercase font-mono block mb-2">調配咒文功德 Offering：</label>
            <div className="flex gap-2">
              {[100, 200, 500, 1000].map(val => (
                <button
                  key={val}
                  onClick={() => { setBet(val); sound.playUiClick(); }}
                  className={`flex-1 py-2 rounded-xl font-mono text-sm transition-all border cursor-pointer ${
                    bet === val
                      ? 'bg-emerald-950 border border-emerald-500 text-[#e5c583] font-bold'
                      : 'bg-[#1c120c] border-[#2d2117] text-[#b08a5b] hover:bg-[#251d16]'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={merit < bet}
            className="w-full py-4 bg-gradient-to-r from-emerald-700 to-emerald-950 hover:from-emerald-600 hover:to-emerald-900 text-white font-bold rounded-2xl transition-all shadow-lg uppercase tracking-widest text-sm flex items-center justify-center gap-2 border border-emerald-500/20 disabled:opacity-40 cursor-pointer"
          >
            📜 敕令銘刻玄天符籙
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-2 py-4">
            {cards.map((c, idx) => (
              <motion.div
                key={c.id}
                whileHover={{ scale: stage === 'draw' ? 1.05 : 1 }}
                onClick={() => toggleLock(idx)}
                className={`h-36 rounded-2xl border p-2 flex flex-col justify-between text-center cursor-pointer relative transition-all ${
                  c.locked
                    ? 'bg-emerald-900/30 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'bg-[#1c120c] border-[#2d2117] text-zinc-400'
                }`}
              >
                {c.locked && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#e5c583] text-[9px] text-black px-2 py-0.5 rounded-full font-bold uppercase font-mono">
                    已留存
                  </span>
                )}
                <span className="text-[10px] font-mono text-zinc-500">{c.suit}</span>
                <span className="text-2xl font-bold">{c.symbol.split(' ')[0]}</span>
                <span className="text-xs font-serif truncate">{c.symbol.split(' ')[1]}</span>
              </motion.div>
            ))}
          </div>

          {stage === 'draw' && (
            <button
              onClick={handleDiscardAndDraw}
              className="w-full py-4 bg-[#b08a5b] hover:bg-[#e5c583] text-black font-bold rounded-2xl font-mono text-sm uppercase tracking-widest transition-all cursor-pointer"
            >
              🔥 焚燒未留存符籙 · 抽契終章
            </button>
          )}

          {stage === 'result' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="p-4 bg-black/40 rounded-2xl border border-[#2d2117] text-center font-mono">
                <span className="text-zinc-500 text-xs uppercase block">本場陣法天命大印</span>
                <span className="text-[#e5c583] font-bold text-lg font-serif">{handRank}</span>
              </div>
              <button
                onClick={() => setStage('betting')}
                className="w-full py-3 bg-[#251d16] hover:bg-[#b08a5b]/25 text-[#e5c583] hover:text-white rounded-xl font-mono text-sm border border-[#2d2117] cursor-pointer"
              >
                🔄 再次祈請玄天符文
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};


// -----------------------------------------------------------------
// 4. DIVINATION BLOCKS (玄門街頭擲筊 - STREET CRAPS)
// -----------------------------------------------------------------
export const DivinationBlocks: React.FC<GameProps> = ({
  merit,
  onUpdateResources,
  onLog
}) => {
  const [bet, setBet] = useState(150);
  const [isPlaying, setIsPlaying] = useState(false);
  const [streak, setStreak] = useState(0);
  const [blocksState, setBlocksState] = useState<{ b1: 'flat' | 'round'; b2: 'flat' | 'round' } | null>(null);

  const throwBlocks = () => {
    if (merit < bet && streak === 0) {
      onLog('❌ 功德福報過低，神明不屑傾聽你的叩問！', 'error');
      sound.playFail();
      return;
    }

    if (streak === 0) {
      onUpdateResources({ merit: -bet });
      sound.playBell();
    }

    setIsPlaying(true);
    sound.playGong();

    setTimeout(() => {
      const b1 = Math.random() < 0.5 ? 'flat' : 'round';
      const b2 = Math.random() < 0.5 ? 'flat' : 'round';

      setBlocksState({ b1, b2 });
      setIsPlaying(false);

      const isHoly = (b1 === 'flat' && b2 === 'round') || (b1 === 'round' && b2 === 'flat');
      const isAngry = b1 === 'round' && b2 === 'round';
      const isLaughing = b1 === 'flat' && b2 === 'flat';

      if (isHoly) {
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        const rewardMultiplier = Math.pow(1.5, nextStreak);
        const bonusReward = Math.round(bet * rewardMultiplier);
        onUpdateResources({ merit: bonusReward });
        onLog(`😇 聖筊降臨！神明欣然首肯，金光滿室！連筊數：${nextStreak}。額外賜福功德：+${bonusReward}!`, 'success');
        sound.playSuccess();
      } else if (isAngry) {
        setStreak(0);
        onLog(`👹 哭筊天譴！神明嚴厲拒絕，厄運臨頭！連筊中斷，offers 盡皆化為灰燼。`, 'error');
        sound.playFail();
      } else if (isLaughing) {
        if (Math.random() < 0.4) {
          setStreak(0);
          onLog(`😆 笑筊天意！神明對你的貪念付之一笑，連筊抱憾中斷！`, 'warn');
          sound.playFail();
        } else {
          onLog(`😆 笑筊迴盪！神明感到有趣，並未降罰。連筊維持，不增功德，可免費再擲！`, 'info');
          sound.playWoodBlock(1.5);
        }
      }
    }, 1000);
  };

  const handleCashout = () => {
    if (streak === 0) return;
    sound.playCoin();
    onLog(`🧧 恭敬退堂！安全收回累計賜福。因果閉環，全身而退！`, 'success');
    setStreak(0);
    setBlocksState(null);
  };

  return (
    <div className="bg-[#130f0d]/95 p-6 rounded-3xl border border-[#b08a5b]/40 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#e5c583]/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] bg-[#18120d] border border-[#2d2117] text-[#e5c583] px-3 py-1 rounded-full uppercase tracking-wider font-mono">
            天意對決（智）
          </span>
          <h3 className="text-2xl font-bold text-amber-500 mt-2 font-serif">玄門街頭擲筊 (Divination Blocks)</h3>
        </div>
        <div className="text-right text-sm text-zinc-400 font-mono">
          當前功德: <span className="text-[#e5c583] font-bold">{merit}</span> 功德
        </div>
      </div>

      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
        虔誠擲出手中的兩瓣紅木半月筊杯。擲出 <strong className="text-amber-400 font-bold">聖筊（一平一凸）</strong> 可獲得倍增功德並疊加連勝；若不幸擲出 <strong className="text-red-400 font-bold">哭筊（兩凸面）</strong> 則連勝清零， offerings 全沒！
      </p>

      <div className="space-y-6">
        {streak > 0 && (
          <div className="flex justify-between items-center bg-black/40 border border-[#b08a5b]/30 p-3 rounded-2xl">
            <span className="text-xs font-mono text-amber-400">🔥 當前神聖連筊數：<b className="text-sm">{streak} 次</b></span>
            <button
              onClick={handleCashout}
              className="px-4 py-1.5 bg-[#251d16] hover:bg-[#e5c583] hover:text-black text-[#e5c583] border border-[#b08a5b]/40 rounded-xl text-xs font-mono transition-all cursor-pointer"
            >
              🧧 收筊退殿 (提現)
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 py-6 justify-center">
          {/* Block 1 */}
          <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-2xl border border-[#2d2117]">
            <span className="text-xs text-zinc-500 font-mono block mb-3">左半月 (左筊)</span>
            {isPlaying ? (
              <motion.div
                animate={{ rotate: [0, 180, 360], y: [0, -20, 0] }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="w-14 h-14 rounded-full bg-red-950 border border-red-500 flex items-center justify-center text-xl font-bold text-red-400 animate-spin"
              >
                ☯️
              </motion.div>
            ) : blocksState ? (
              <div className={`w-14 h-14 flex items-center justify-center border text-xs font-bold shadow-md ${
                blocksState.b1 === 'flat' 
                  ? 'bg-amber-900/60 border-amber-500 text-amber-100 rounded-lg' 
                  : 'bg-red-950/60 border-red-500 text-red-100 rounded-full'
              }`}>
                {blocksState.b1 === 'flat' ? '平面 (平)' : '凸面 (凸)'}
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-zinc-800/30 border border-zinc-700/50 flex items-center justify-center text-zinc-500 text-xs font-mono">
                靜候
              </div>
            )}
          </div>

          {/* Block 2 */}
          <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-2xl border border-[#2d2117]">
            <span className="text-xs text-zinc-500 font-mono block mb-3">右半月 (右筊)</span>
            {isPlaying ? (
              <motion.div
                animate={{ rotate: [0, -180, -360], y: [0, -20, 0] }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="w-14 h-14 rounded-full bg-red-950 border border-red-500 flex items-center justify-center text-xl font-bold text-red-400 animate-spin"
              >
                ☯️
              </motion.div>
            ) : blocksState ? (
              <div className={`w-14 h-14 flex items-center justify-center border text-xs font-bold shadow-md ${
                blocksState.b2 === 'flat' 
                  ? 'bg-amber-900/60 border-amber-500 text-amber-100 rounded-lg' 
                  : 'bg-red-950/60 border-red-500 text-red-100 rounded-full'
              }`}>
                {blocksState.b2 === 'flat' ? '平面 (平)' : '凸面 (凸)'}
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-zinc-800/30 border border-zinc-700/50 flex items-center justify-center text-zinc-500 text-xs font-mono">
                靜候
              </div>
            )}
          </div>
        </div>

        {streak === 0 && (
          <div className="bg-black/40 p-4 rounded-2xl border border-[#2d2117]">
            <label className="text-xs text-[#b08a5b] uppercase font-mono block mb-2">調配求筊功德 Offering：</label>
            <div className="flex gap-2">
              {[50, 150, 300, 1000].map(val => (
                <button
                  key={val}
                  onClick={() => { setBet(val); sound.playUiClick(); }}
                  className={`flex-1 py-2 rounded-xl font-mono text-sm transition-all border cursor-pointer ${
                    bet === val
                      ? 'bg-amber-950 border border-amber-500 text-amber-400 font-bold'
                      : 'bg-[#1c120c] border-[#2d2117] text-[#b08a5b] hover:bg-[#251d16]'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={throwBlocks}
          disabled={isPlaying || (streak === 0 && merit < bet)}
          className="w-full py-4 bg-gradient-to-r from-amber-700 to-amber-950 hover:from-[#e5c583] hover:to-[#b08a5b] hover:text-black text-white font-bold rounded-2xl transition-all shadow-lg uppercase tracking-widest text-sm flex items-center justify-center gap-2 border border-amber-500/20 disabled:opacity-40 cursor-pointer"
        >
          ☯️ {streak > 0 ? '免費再投擲一次 (神明眷顧)' : '恭請聖卦 · 手動擲筊'}
        </button>
      </div>
    </div>
  );
};
