import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { sound } from '../../utils/sound';
import { Flame, Compass, Sparkles, RotateCcw } from 'lucide-react';

interface GameProps {
  merit: number;
  hellMoney: number;
  karma: number;
  activeIncenseCount: number;
  onUpdateResources: (changes: { merit?: number; hellMoney?: number; karma?: number }) => void;
  onLog: (text: string, type: 'info' | 'success' | 'warn' | 'error' | 'divine') => void;
}

// -----------------------------------------------------------------
// 7. BURNING JOSS PAPER (焚燒冥紙 - CRASH)
// -----------------------------------------------------------------
export const BurningJossPaper: React.FC<GameProps> = ({
  hellMoney,
  onUpdateResources,
  onLog
}) => {
  const [bet, setBet] = useState(500);
  const [isPlaying, setIsPlaying] = useState(false);
  const [multiplier, setMultiplier] = useState(1.0);
  const [isCrashed, setIsCrashed] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);

  const crashPointRef = useRef<number>(1.0);
  const timerRef = useRef<any>(null);

  const handleStart = () => {
    if (hellMoney < bet) {
      onLog('❌ 冥紙不足，無法投入神火熔爐！', 'error');
      sound.playFail();
      return;
    }
    onUpdateResources({ hellMoney: -bet });
    sound.playBell();

    setIsPlaying(true);
    setIsCrashed(false);
    setHasCashedOut(false);
    setMultiplier(1.0);

    const rand = Math.random();
    if (rand < 0.1) {
      crashPointRef.current = 1.0;
    } else {
      crashPointRef.current = parseFloat((1.01 + Math.pow(Math.random(), 3) * 15).toFixed(2));
    }

    onLog(`🔥 冥紙已投入神火熔爐！火勢瘋狂蔓延，冥紙正在劇烈轉化為陰司法力...`, 'info');

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const currentMult = parseFloat((1.0 + Math.pow(elapsed, 1.4) * 0.5).toFixed(2));

      if (currentMult >= crashPointRef.current) {
        clearInterval(timerRef.current);
        setIsCrashed(true);
        setIsPlaying(false);
        sound.playSwoosh();
        onLog(`💨 陰風慘烈！神爐火候過旺，在 ${crashPointRef.current} 倍時突然炸爐！冥紙 offerings 化作一縷廢煙...`, 'error');
      } else {
        setMultiplier(currentMult);
        sound.playWoodBlock(1.0 + currentMult * 0.1);
      }
    }, 100);
  };

  const handleCashout = () => {
    if (!isPlaying || isCrashed || hasCashedOut) return;
    clearInterval(timerRef.current);
    setHasCashedOut(true);
    setIsPlaying(false);

    const totalPrize = Math.round(bet * multiplier);
    onUpdateResources({ hellMoney: totalPrize });
    onLog(`🧧 火中取栗！在火勢高達 ${multiplier} 倍時安全結算，搶救回先祖冥紙 +${totalPrize}`, 'success');
    sound.playCoin();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="bg-[#130f0d]/95 p-6 rounded-3xl border border-[#b08a5b]/40 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-950/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] bg-orange-950/80 border border-orange-500/30 text-orange-400 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
            因果氣運（劫）
          </span>
          <h3 className="text-2xl font-bold text-orange-500 mt-2 font-serif">焚燒冥紙 (Burning Joss Paper)</h3>
        </div>
        <div className="text-right text-sm text-zinc-400 font-mono">
          當前冥紙: <span className="text-purple-400 font-bold">${hellMoney}</span>
        </div>
      </div>

      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
        將黃表紙或地府高額冥紙送入神殿銅爐。隨著烈火焚燒，功德和冥紙法力加倍增長！在神明怒火或不測陰風（炸爐炸街）降臨前，點擊收火結算，否則付之一炬。
      </p>

      {!isPlaying && !isCrashed && !hasCashedOut ? (
        <div className="space-y-4">
          <div className="bg-black/40 p-4 rounded-2xl border border-[#2d2117]">
            <label className="text-xs text-[#b08a5b] uppercase font-mono block mb-2 font-bold font-serif">請調配焚燒冥紙 offerings：</label>
            <div className="flex gap-2">
              {[200, 500, 1000, 5000].map(val => (
                <button
                  key={val}
                  onClick={() => { setBet(val); sound.playUiClick(); }}
                  className={`flex-1 py-2 rounded-xl font-mono text-sm border cursor-pointer transition-all ${
                    bet === val
                      ? 'bg-orange-950 border border-orange-500 text-orange-400 font-bold'
                      : 'bg-[#1c120c] border-[#2d2117] text-[#b08a5b] hover:bg-zinc-800'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={hellMoney < bet}
            className="w-full py-4 bg-gradient-to-r from-orange-700 to-orange-950 hover:from-orange-600 hover:to-orange-900 text-white font-bold rounded-2xl transition-all shadow-lg uppercase tracking-widest text-sm flex items-center justify-center gap-2 border border-orange-500/20 disabled:opacity-40 cursor-pointer"
          >
            <Flame className="w-5 h-5 animate-pulse text-orange-400" /> 🪔 朝神爐投擲冥紙 · 鼓風助燃
          </button>
        </div>
      ) : (
        <div className="space-y-6 text-center">
          <div className="bg-black/30 p-8 rounded-2xl border border-[#2d2117] flex flex-col items-center justify-center min-h-[160px] relative">
            {isPlaying && (
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 2, -2, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="text-orange-500 mb-2"
              >
                <Flame className="w-16 h-16" />
              </motion.div>
            )}

            <span className="text-xs text-[#b08a5b] font-mono uppercase tracking-wider">當前神火加持倍率</span>
            <span className={`text-5xl font-black font-mono mt-2 transition-all ${
              isCrashed ? 'text-red-600' : 'text-orange-400'
            }`}>
              {multiplier.toFixed(2)}x
            </span>

            {isCrashed && (
              <div className="text-red-500 font-mono text-sm mt-4 uppercase tracking-widest font-bold">
                💨 炸爐天譴於 {crashPointRef.current}x 爆裂！
              </div>
            )}
          </div>

          {isPlaying && (
            <button
              onClick={handleCashout}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold rounded-2xl font-mono text-sm tracking-widest uppercase transition-all shadow-lg animate-pulse cursor-pointer"
            >
              💰 撲滅神火結算 (奪回 ${Math.round(bet * multiplier)} 冥紙)
            </button>
          )}

          {!isPlaying && (
            <button
              onClick={() => { setIsCrashed(false); setHasCashedOut(false); setMultiplier(1.0); }}
              className="w-full py-3 bg-[#251d16] hover:bg-[#b08a5b]/25 text-[#e5c583] hover:text-white rounded-xl font-mono text-sm border border-[#2d2117] cursor-pointer"
            >
              🔄 再次朝神爐奉獻冥紙
            </button>
          )}
        </div>
      )}
    </div>
  );
};


// -----------------------------------------------------------------
// 8. REINCARNATION WHEEL (六道輪迴 - ROULETTE)
// -----------------------------------------------------------------
export const ReincarnationWheel: React.FC<GameProps> = ({
  merit,
  onUpdateResources,
  onLog
}) => {
  const [bet, setBet] = useState(150);
  const [chosenRealm, setChosenRealm] = useState<string>('human');
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);
  const [wheelOutcome, setWheelOutcome] = useState<string | null>(null);

  const realms = [
    { id: 'deity', label: '😇 天眾道 (Deity)', color: 'bg-emerald-950 border-emerald-500', payout: 6 },
    { id: 'asura', label: '⚔️ 阿修羅 (Asura)', color: 'bg-rose-950 border-rose-500', payout: 4 },
    { id: 'human', label: '👨 人間道 (Human)', color: 'bg-zinc-800 border-zinc-500', payout: 3 },
    { id: 'animal', label: '🐕 畜生道 (Animal)', color: 'bg-amber-950 border-amber-500', payout: 5 },
    { id: 'ghost', label: '🧟 餓鬼道 (Hungry Ghost)', color: 'bg-purple-950 border-purple-500', payout: 10 },
    { id: 'hell', label: '👹 地獄道 (Hell)', color: 'bg-red-950 border-red-500', payout: 15 }
  ];

  const handleSpin = () => {
    if (merit < bet) {
      onLog('❌ 功德福報不夠推動三界六道生死輪！', 'error');
      sound.playFail();
      return;
    }
    setIsSpinning(true);
    setWheelOutcome(null);
    onUpdateResources({ merit: -bet });
    sound.playBell();

    const randomDegrees = 1440 + Math.floor(Math.random() * 360);
    setSpinAngle(spinAngle + randomDegrees);

    onLog(`⚖️ 五百功德奉上，高僧誦經，推動生死【六道輪迴巨輪】！正在測量轉世天命...`, 'info');

    setTimeout(() => {
      setIsSpinning(false);
      const normalizedAngle = (spinAngle + randomDegrees) % 360;
      const sectorIndex = Math.floor(normalizedAngle / (360 / realms.length));
      const resultRealm = realms[sectorIndex % realms.length];
      
      setWheelOutcome(resultRealm.label);

      if (resultRealm.id === chosenRealm) {
        const winReward = bet * resultRealm.payout;
        onUpdateResources({ merit: winReward });
        onLog(`🎉 轉世神蹟！你成功投胎至【${resultRealm.label}】！冥冥之中自有天意，獲得功德福報 +${winReward}`, 'success');
        sound.playSuccess();
      } else {
        onLog(`👹 投胎偏軌！魂魄墜入了【${resultRealm.label}】，與你祈願投生的【${realms.find(r => r.id === chosenRealm)?.label}】不符。扣除 offerings ${bet} 功德。`, 'warn');
        sound.playFail();
      }
    }, 2500);
  };

  return (
    <div className="bg-[#130f0d]/95 p-6 rounded-3xl border border-[#b08a5b]/40 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-900/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] bg-zinc-900 border border-zinc-700 text-zinc-400 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
            因果氣運（劫）
          </span>
          <h3 className="text-2xl font-bold text-zinc-300 mt-2 font-serif">六道輪迴 (Reincarnation Wheel)</h3>
        </div>
        <div className="text-right text-sm text-zinc-400 font-mono">
          當前功德: <span className="text-amber-400 font-bold">{merit}</span> 功德
        </div>
      </div>

      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
        生生死死，六道輪迴。將功德 offerings 押注在靈魂下一次轉世投胎的維度上。畜生道、餓鬼道、地獄道等凶煞劣道，因轉生難度極高，天庭給予超高功德回報！
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Animated Dial */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative w-48 h-48 rounded-full border-4 border-[#b08a5b]/40 flex items-center justify-center bg-black overflow-hidden shadow-xl shadow-black">
            <motion.div
              style={{ rotate: spinAngle }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
              className="absolute inset-0 grid grid-cols-2 grid-rows-2"
            >
              <div className="bg-emerald-950/40 border border-emerald-900/30 flex items-center justify-center text-xs">😇</div>
              <div className="bg-rose-950/40 border border-rose-900/30 flex items-center justify-center text-xs">⚔️</div>
              <div className="bg-amber-950/40 border border-amber-900/30 flex items-center justify-center text-xs">🐕</div>
              <div className="bg-red-950/40 border border-red-900/30 flex items-center justify-center text-xs">👹</div>
            </motion.div>
            <Compass className="w-10 h-10 text-amber-500 z-10 animate-pulse" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-[16px] border-t-amber-500 z-20"></div>
          </div>
          {wheelOutcome && (
            <div className="mt-4 font-mono text-center text-xs">
              輪迴終點: <b className="text-amber-400 text-sm block mt-1 font-serif">{wheelOutcome}</b>
            </div>
          )}
        </div>

        {/* Bet choices */}
        <div className="space-y-4">
          <div className="bg-black/40 p-4 rounded-2xl border border-[#2d2117]">
            <label className="text-xs text-[#b08a5b] uppercase font-mono block mb-2 font-bold font-serif">請選定靈魂轉生目標：</label>
            <div className="grid grid-cols-2 gap-2">
              {realms.map(r => (
                <button
                  key={r.id}
                  disabled={isSpinning}
                  onClick={() => { setChosenRealm(r.id); sound.playUiClick(); }}
                  className={`py-2 px-3 rounded-xl text-left text-xs font-mono transition-all border cursor-pointer ${
                    chosenRealm === r.id
                      ? `${r.color} text-zinc-100 font-bold shadow-md`
                      : 'bg-[#1c120c] border-[#2d2117] text-[#b08a5b] hover:bg-zinc-800'
                  }`}
                >
                  <span className="block truncate">{r.label}</span>
                  <span className="text-[10px] text-zinc-500 font-bold block">{r.payout}x 功德回饋</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-black/40 p-4 rounded-2xl border border-[#2d2117]">
            <label className="text-xs text-[#b08a5b] uppercase font-mono block mb-1">調配超度功德：</label>
            <input
              type="number"
              min={10}
              max={1000}
              value={bet}
              disabled={isSpinning}
              onChange={(e) => setBet(Math.max(10, Number(e.target.value)))}
              className="w-full bg-black/60 border border-[#2d2117] rounded-xl p-2 text-sm text-amber-400 font-mono outline-none"
            />
          </div>

          <button
            onClick={handleSpin}
            disabled={isSpinning || merit < bet}
            className="w-full py-4 bg-gradient-to-r from-zinc-850 to-black hover:from-[#e5c583] hover:to-[#b08a5b] hover:text-black text-[#e5c583] font-bold rounded-2xl transition-all shadow-lg uppercase tracking-widest text-xs flex items-center justify-center gap-2 border border-[#2d2117] cursor-pointer"
          >
            🎡 轉動因果生死巨輪
          </button>
        </div>
      </div>
    </div>
  );
};


// -----------------------------------------------------------------
// 9. DONATION BOX DROP (功德箱彈珠 - PLINKO)
// -----------------------------------------------------------------
export const DonationBoxDrop: React.FC<GameProps> = ({
  merit,
  onUpdateResources,
  onLog
}) => {
  const [bet, setBet] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ballPath, setBallPath] = useState<number[]>([]); 
  const [outcomeBin, setOutcomeBin] = useState<number | null>(null);

  const bins = [
    { label: '0.2x', mult: 0.2, color: 'bg-red-950 text-red-400' },
    { label: '0.8x', mult: 0.8, color: 'bg-zinc-900 text-zinc-400' },
    { label: '1.5x', mult: 1.5, color: 'bg-emerald-950 text-emerald-400' },
    { label: '5.0x', mult: 5.0, color: 'bg-amber-950 text-amber-400 font-bold border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]' },
    { label: '1.5x', mult: 1.5, color: 'bg-emerald-950 text-emerald-400' },
    { label: '0.8x', mult: 0.8, color: 'bg-zinc-900 text-zinc-400' },
    { label: '0.2x', mult: 0.2, color: 'bg-red-950 text-red-400' }
  ];

  const handleDrop = () => {
    if (merit < bet) {
      onLog('❌ 功德碎金不足，無法投入功德箱！', 'error');
      sound.playFail();
      return;
    }
    setIsPlaying(true);
    setOutcomeBin(null);
    onUpdateResources({ merit: -bet });
    sound.playBell();

    onLog(`🪙 金幣叮噹！將一枚重達 ${bet} 功德的鎦金銅板投入功德箱頂部天門。正在跌宕起伏下墜...`, 'info');

    let currentPos = 3; 
    const path = [currentPos];
    
    let step = 0;
    const interval = setInterval(() => {
      if (step < 5) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        currentPos = Math.max(0, Math.min(6, currentPos + dir));
        path.push(currentPos);
        setBallPath([...path]);
        sound.playWoodBlock(1.5 + step * 0.1);
        step++;
      } else {
        clearInterval(interval);
        const finalBinIdx = currentPos;
        setOutcomeBin(finalBinIdx);
        setIsPlaying(false);

        const targetBin = bins[finalBinIdx];
        const winReward = Math.round(bet * targetBin.mult);
        onUpdateResources({ merit: winReward });
        
        if (targetBin.mult >= 1.5) {
          onLog(`🎉 金幣入正位！銅板跌入了功德箱中央福位【${targetBin.label}】！獲佛光普照，回報功德 +${winReward}`, 'success');
          sound.playSuccess();
        } else {
          onLog(`💀 偏離福地！銅板偏向了邊緣偏殿【${targetBin.label}】。佛陀不忍你空手，僅返還少量功德 +${winReward}`, 'warn');
          sound.playFail();
        }
      }
    }, 300);
  };

  return (
    <div className="bg-[#130f0d]/95 p-6 rounded-3xl border border-[#b08a5b]/40 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-950/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] bg-yellow-950/80 border border-yellow-500/30 text-yellow-400 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
            因果氣運（劫）
          </span>
          <h3 className="text-2xl font-bold text-yellow-500 mt-2 font-serif">功德箱彈珠 (Donation Box Plinko)</h3>
        </div>
        <div className="text-right text-sm text-zinc-400 font-mono">
          當前功德: <span className="text-amber-400 font-bold">{merit}</span> 功德
        </div>
      </div>

      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
        朝佈滿太極銅釘的功德箱中投擲供奉金幣。金幣在功德神木間左右彈跳，最核心的香爐福位提供最高高達 <strong className="text-[#e5c583]">5.0 倍</strong> 的超級香火暴擊回饋！
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Plinko Board Drawing */}
        <div className="bg-black/30 p-4 rounded-2xl border border-[#2d2117] flex flex-col items-center">
          <div className="space-y-4 w-full max-w-[200px] py-4 relative">
            {[0, 1, 2, 3, 4, 5].map((rowIdx) => (
              <div key={rowIdx} className="flex justify-center gap-6">
                {Array.from({ length: rowIdx + 1 }).map((_, colIdx) => {
                  const isCurrentBall = ballPath[rowIdx] === colIdx;
                  return (
                    <div
                      key={colIdx}
                      className={`w-3.5 h-3.5 rounded-full transition-all ${
                        isCurrentBall
                          ? 'bg-yellow-400 animate-ping shadow-lg shadow-yellow-500'
                          : 'bg-[#2d2117]'
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bins bottom */}
          <div className="grid grid-cols-7 gap-1 w-full mt-4 font-mono text-[9px] text-center">
            {bins.map((b, idx) => (
              <div
                key={idx}
                className={`py-2 rounded-xl transition-all ${
                  outcomeBin === idx
                    ? 'bg-yellow-500 text-black font-extrabold scale-110 shadow-md shadow-yellow-500/40'
                    : b.color
                }`}
              >
                {b.label}
              </div>
            ))}
          </div>
        </div>

        {/* Bets control */}
        <div className="space-y-4">
          <div className="bg-black/40 p-4 rounded-2xl border border-[#2d2117]">
            <label className="text-xs text-[#b08a5b] uppercase font-mono block mb-2 font-bold font-serif">請投入投幣面值：</label>
            <div className="flex gap-2">
              {[50, 100, 250, 1000].map(val => (
                <button
                  key={val}
                  disabled={isPlaying}
                  onClick={() => { setBet(val); sound.playUiClick(); }}
                  className={`flex-1 py-2 rounded-xl font-mono text-sm border cursor-pointer transition-all ${
                    bet === val
                      ? 'bg-yellow-950 border border-yellow-500 text-yellow-400 font-bold'
                      : 'bg-[#1c120c] border-[#2d2117] text-[#b08a5b] hover:bg-zinc-800'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleDrop}
            disabled={isPlaying || merit < bet}
            className="w-full py-4 bg-gradient-to-r from-yellow-700 to-yellow-950 hover:from-yellow-600 hover:to-yellow-900 text-white font-bold rounded-2xl transition-all shadow-lg uppercase tracking-widest text-sm flex items-center justify-center gap-2 border border-yellow-500/20 disabled:opacity-40 cursor-pointer"
          >
            🪙 朝玄門天窗投下金幣
          </button>
        </div>
      </div>
    </div>
  );
};


// -----------------------------------------------------------------
// 10. CONSTELLATION KENO (星宿連線 - KENO)
// -----------------------------------------------------------------
export const ConstellationKeno: React.FC<GameProps> = ({
  merit,
  onUpdateResources,
  onLog
}) => {
  const [bet, setBet] = useState(100);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [drawnStars, setDrawnStars] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [matchCount, setMatchCount] = useState(0);

  const toggleStar = (num: number) => {
    if (isPlaying) return;
    sound.playWoodBlock(1.3);
    if (selectedStars.includes(num)) {
      setSelectedStars(selectedStars.filter(s => s !== num));
    } else {
      if (selectedStars.length >= 10) {
        onLog('⚠️ 超出天命經緯限制！最多僅能勾勒 10 顆星宿坐標。', 'warn');
        return;
      }
      setSelectedStars([...selectedStars, num]);
    }
  };

  const handleAlign = () => {
    if (selectedStars.length === 0) {
      onLog('⚠️ 請至少選取 1 顆天宮星宿以建立因果連線！', 'error');
      return;
    }
    if (merit < bet) {
      onLog('❌ 功德不足以購置並干涉星空軌跡！', 'error');
      sound.playFail();
      return;
    }
    setIsPlaying(true);
    setDrawnStars([]);
    setMatchCount(0);
    onUpdateResources({ merit: -bet });
    sound.playBell();

    onLog(`☄️ 天星異動！供奉 ${bet} 功德，請大祭司施法，調動大衍天光穿透三清法界，點燃黃道三十六星宿...`, 'info');

    const draws: number[] = [];
    let count = 0;
    
    const interval = setInterval(() => {
      if (count < 12) {
        let draw = Math.floor(Math.random() * 36) + 1;
        while (draws.includes(draw)) {
          draw = Math.floor(Math.random() * 36) + 1;
        }
        draws.push(draw);
        setDrawnStars([...draws]);
        
        const matches = draws.filter(d => selectedStars.includes(d)).length;
        setMatchCount(matches);
        
        sound.playWoodBlock(1.4);
        count++;
      } else {
        clearInterval(interval);
        setIsPlaying(false);

        let payoutMult = 0;
        if (matchCount === 0) payoutMult = 0;
        else if (matchCount === 1) payoutMult = 0.5;
        else if (matchCount === 2) payoutMult = 1.5;
        else if (matchCount === 3) payoutMult = 3.0;
        else if (matchCount === 4) payoutMult = 6.0;
        else payoutMult = 15.0; 

        const winReward = Math.round(bet * payoutMult);
        onUpdateResources({ merit: winReward });

        if (winReward > 0) {
          onLog(`🎉 黃道星宿歸位！成功契合【${matchCount}】顆星宿！獲得天宮大陣加持，賜予功德 +${winReward}`, 'success');
          sound.playSuccess();
        } else {
          onLog(`💀 斗轉星移失控！星圖未能契合。大衍天宮大陣破滅， offers 折損。`, 'warn');
          sound.playFail();
        }
      }
    }, 250);
  };

  return (
    <div className="bg-[#130f0d]/95 p-6 rounded-3xl border border-[#b08a5b]/40 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-950/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] bg-sky-950/80 border border-sky-500/30 text-sky-400 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
            因果氣運（劫）
          </span>
          <h3 className="text-2xl font-bold text-sky-400 mt-2 font-serif">星宿連線 (Constellation Keno)</h3>
        </div>
        <div className="text-right text-sm text-zinc-400 font-mono">
          當前功德: <span className="text-amber-400 font-bold">{merit}</span> 功德
        </div>
      </div>

      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
        在三十六顆大衍星宿盤上勾勒你的命理。神壇將射出十二道紫微天光，擊中的星辰與你的命局重合越多，所得的天宮功德恩賜將成倍暴漲！
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* 6x6 Grid */}
        <div className="grid grid-cols-6 gap-1 bg-black/40 p-3 rounded-2xl border border-[#2d2117]">
          {Array.from({ length: 36 }).map((_, idx) => {
            const num = idx + 1;
            const isSelected = selectedStars.includes(num);
            const isDrawn = drawnStars.includes(num);
            const isHit = isSelected && isDrawn;

            return (
              <button
                key={num}
                disabled={isPlaying}
                onClick={() => toggleStar(num)}
                className={`aspect-square rounded-xl text-xs font-mono transition-all flex items-center justify-center border cursor-pointer ${
                  isHit
                    ? 'bg-sky-500 text-black border-sky-300 font-black scale-105'
                    : isDrawn
                    ? 'bg-[#18120d] border-sky-900 text-sky-400/50'
                    : isSelected
                    ? 'bg-sky-950/80 border-sky-500 text-sky-300 font-bold'
                    : 'bg-[#1c120c] border-[#2d2117] text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Controllers */}
        <div className="space-y-4">
          <div className="bg-black/30 p-4 rounded-2xl border border-[#2d2117] font-mono text-xs space-y-2">
            <div className="flex justify-between">
              <span>命理契合星宿:</span>
              <span className="text-sky-400 font-bold">{selectedStars.length} / 10 顆</span>
            </div>
            <div className="flex justify-between">
              <span>紫微星芒重疊:</span>
              <span className="text-yellow-400 font-bold text-sm">{matchCount} 顆</span>
            </div>
          </div>

          <div className="bg-black/40 p-4 rounded-2xl border border-[#2d2117]">
            <label className="text-xs text-[#b08a5b] uppercase font-mono block mb-2 font-bold font-serif">請調配請仙功德：</label>
            <div className="flex gap-2">
              {[50, 100, 250, 500].map(val => (
                <button
                  key={val}
                  disabled={isPlaying}
                  onClick={() => { setBet(val); sound.playUiClick(); }}
                  className={`flex-1 py-1.5 rounded-xl font-mono text-xs border cursor-pointer transition-all ${
                    bet === val
                      ? 'bg-sky-950 border border-sky-500 text-sky-400 font-bold'
                      : 'bg-[#1c120c] border-[#2d2117] text-[#b08a5b] hover:bg-zinc-800'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedStars([])}
              disabled={isPlaying}
              className="py-3 px-4 bg-[#251d16] hover:bg-[#1c120c] text-[#e5c583] rounded-xl border border-[#2d2117] transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleAlign}
              disabled={isPlaying || selectedStars.length === 0 || merit < bet}
              className="flex-1 py-3 bg-gradient-to-r from-sky-700 to-sky-950 hover:from-sky-600 hover:to-sky-900 text-white font-bold rounded-2xl transition-all shadow-lg uppercase tracking-widest text-xs flex items-center justify-center gap-2 border border-sky-500/20 disabled:opacity-40 cursor-pointer"
            >
              ☄️ 敕令星芒 · 洞穿星河
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// -----------------------------------------------------------------
// 11. CROSSING THE RIVER STYX (橫渡奈何橋 - CROSSING)
// -----------------------------------------------------------------
export const CrossingTheRiverStyx: React.FC<GameProps> = ({
  hellMoney,
  onUpdateResources,
  onLog
}) => {
  const [bet, setBet] = useState(400);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerLane, setPlayerLane] = useState(0); 
  const [isDrowned, setIsDrowned] = useState(false);
  const [isSafeCrossing, setIsSafeCrossing] = useState(false);

  const laneMultipliers = [1.0, 1.3, 1.8, 2.5, 3.6, 5.2, 10.0];

  const handleStart = () => {
    if (hellMoney < bet) {
      onLog('❌ 冥紙過路費不足以請動紙人替身橫渡奈何橋！', 'error');
      sound.playFail();
      return;
    }
    onUpdateResources({ hellMoney: -bet });
    sound.playBell();

    setIsPlaying(true);
    setPlayerLane(0);
    setIsDrowned(false);
    setIsSafeCrossing(false);
    onLog(`🚣 買路財已付！一具脆弱的紙紮人奴僕，正背著你 ${bet} 冥紙過河。走得越遠，回報越豐！`, 'info');
  };

  const handleStepForward = () => {
    if (!isPlaying || isDrowned || isSafeCrossing) return;

    sound.playWoodBlock(1.4);
    const nextLane = playerLane + 1;
    const isSuccess = Math.random() < 0.75;

    if (!isSuccess) {
      setIsDrowned(true);
      setIsPlaying(false);
      sound.playFail();
      onLog(`💀 紙人溶化！奈何橋下黃泉湍急，孤魂野鬼一把將你的替身拽入萬劫不復的冥河深淵。過路財全部流失。`, 'error');
    } else {
      setPlayerLane(nextLane);
      sound.playSuccess();

      if (nextLane === 6) {
        const totalPrize = Math.round(bet * laneMultipliers[6]);
        onUpdateResources({ hellMoney: totalPrize });
        setIsSafeCrossing(true);
        setIsPlaying(false);
        onLog(`🌈 奇蹟生還！紙人奴僕全身而退，越過彼岸，抵達極樂世界！返還祖先超度冥錢 +${totalPrize}`, 'success');
        sound.playGong();
      } else {
        onLog(`🌊 紙人已前進至第 ${nextLane} 檔防波堤！當前冥紙倍率：${laneMultipliers[nextLane]}x。繼續前進，或落袋退耕！`, 'info');
      }
    }
  };

  const handleCashout = () => {
    if (!isPlaying || playerLane === 0) return;
    const totalPrize = Math.round(bet * laneMultipliers[playerLane]);
    onUpdateResources({ hellMoney: totalPrize });
    setIsPlaying(false);
    onLog(`🧧 穩妥登陸！命令紙人在奈何橋第 ${playerLane} 層防線返航。成功贖回冥紙 offerings +${totalPrize}`, 'success');
    sound.playCoin();
  };

  return (
    <div className="bg-[#130f0d]/95 p-6 rounded-3xl border border-[#b08a5b]/40 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-950/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] bg-blue-950/80 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
            因果氣運（劫）
          </span>
          <h3 className="text-2xl font-bold text-blue-500 mt-2 font-serif">橫渡奈何橋 (Crossing Styx)</h3>
        </div>
        <div className="text-right text-sm text-zinc-400 font-mono">
          當前冥紙: <span className="text-purple-400 font-bold">${hellMoney}</span>
        </div>
      </div>

      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
        操控一尊脆弱的紙紮僕役越過冰冷的奈何黃泉。你每次下令前進，紙人都有機率遭遇冤魂抓交替而溶化。步步驚心，但若抵達彼岸，將獲得驚人的 <strong className="text-sky-400">10 倍香火返還</strong>！
      </p>

      {!isPlaying && !isDrowned && !isSafeCrossing ? (
        <div className="space-y-4">
          <div className="bg-black/40 p-4 rounded-2xl border border-[#2d2117]">
            <label className="text-xs text-[#b08a5b] uppercase font-mono block mb-2 font-bold font-serif">調配紙人過河冥紙：</label>
            <div className="flex gap-2">
              {[200, 400, 1000, 5000].map(val => (
                <button
                  key={val}
                  onClick={() => { setBet(val); sound.playUiClick(); }}
                  className={`flex-1 py-2 rounded-xl font-mono text-sm border cursor-pointer transition-all ${
                    bet === val
                      ? 'bg-blue-950 border border-blue-500 text-blue-400 font-bold'
                      : 'bg-[#1c120c] border-[#2d2117] text-[#b08a5b] hover:bg-zinc-800'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={hellMoney < bet}
            className="w-full py-4 bg-gradient-to-r from-blue-700 to-blue-950 hover:from-blue-600 hover:to-blue-900 text-white font-bold rounded-2xl transition-all shadow-lg uppercase tracking-widest text-sm flex items-center justify-center gap-2 border border-blue-500/20 disabled:opacity-40 cursor-pointer"
          >
            🚣 派遣紙紮僕人 · 乘陰風渡河
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Styx river display */}
          <div className="bg-gradient-to-b from-blue-950/40 to-slate-900 border border-[#2d2117] rounded-2xl p-4 flex flex-col gap-2 relative">
            <div className="text-center text-[10px] uppercase font-mono text-sky-400 tracking-wider">彼岸極樂淨土 (🌈 10.0x 超渡加持)</div>
            
            {[5, 4, 3, 2, 1, 0].map((laneIdx) => {
              const isPlayerHere = playerLane === laneIdx;
              const isLobby = laneIdx === 0;
              return (
                <div
                  key={laneIdx}
                  className={`h-9 border border-[#2d2117]/30 rounded-xl flex items-center justify-between px-4 transition-all ${
                    isPlayerHere
                      ? 'bg-blue-900/60 border-blue-500 text-sky-300'
                      : isLobby
                      ? 'bg-[#1c120c] text-zinc-500'
                      : 'bg-blue-950/20 text-blue-500/50'
                  }`}
                >
                  <span className="text-[9px] font-mono">奈何橋第 {laneIdx} 段</span>
                  {isPlayerHere ? (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="text-xs font-bold flex items-center gap-1 bg-sky-900 px-3 py-0.5 rounded-full border border-sky-400 text-sky-100"
                    >
                      🚣 紙人奴僕在此處 ({laneMultipliers[laneIdx]}x)
                    </motion.div>
                  ) : (
                    <span className="text-[10px] font-mono">{laneMultipliers[laneIdx]}x</span>
                  )}
                  <span className="text-[9px] font-mono"> 黃泉急流 </span>
                </div>
              );
            })}
          </div>

          {isPlaying && (
            <div className="flex gap-4">
              <button
                onClick={handleStepForward}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-sky-700 text-white font-bold rounded-2xl text-sm font-mono tracking-wider hover:opacity-90 cursor-pointer"
              >
                🏮 喝令前進一步 (75% 安全機率)
              </button>
              <button
                onClick={handleCashout}
                disabled={playerLane === 0}
                className="flex-1 py-3 bg-[#251d16] hover:bg-[#b08a5b]/20 border border-[#b08a5b]/40 text-[#e5c583] font-bold rounded-2xl text-sm font-mono tracking-wider disabled:opacity-40 cursor-pointer"
              >
                💰 鳴金靠岸 ({Math.round(bet * laneMultipliers[playerLane])} 冥紙)
              </button>
            </div>
          )}

          {!isPlaying && (
            <button
              onClick={() => { setIsDrowned(false); setIsSafeCrossing(false); setPlayerLane(0); }}
              className="w-full py-3 bg-[#251d16] hover:bg-[#b08a5b]/25 text-[#e5c583] hover:text-white rounded-xl font-mono text-sm border border-[#2d2117] cursor-pointer"
            >
              🔄 再次敕造下一尊紙人替身
            </button>
          )}
        </div>
      )}
    </div>
  );
};
