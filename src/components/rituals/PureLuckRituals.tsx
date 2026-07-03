import React, { useState, useRef, useEffect } from 'react';
import { motion, useSpring, useTransform, animate, useMotionValue } from 'motion/react';
import { Compass } from 'lucide-react';

// ── sound stub so the file is self-contained when pasted anywhere ──────────────
// Remove this block and keep your real import when integrating back.
const sound = {
  playFail: () => {},
  playBell: () => {},
  playSuccess: () => {},
  playUiClick: () => {},
  playWoodBlock: (_?: number) => {},
};

interface GameProps {
  merit: number;
  hellMoney: number;
  karma: number;
  activeIncenseCount: number;
  onUpdateResources: (changes: { merit?: number; hellMoney?: number; karma?: number }) => void;
  onLog: (text: string, type: 'info' | 'success' | 'warn' | 'error' | 'divine') => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Particle burst drawn on a canvas overlay
// ─────────────────────────────────────────────────────────────────────────────
const ParticleBurst: React.FC<{ trigger: boolean; color?: string }> = ({
  trigger,
  color = '#f59e0b',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    const particles = Array.from({ length: 28 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.018 + Math.random() * 0.022,
        r: 2 + Math.random() * 4,
      };
    });

    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gravity
        p.life -= p.decay;
        if (p.life > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.life;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      if (alive) frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [trigger, color]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 12. MANDALA WHEEL  妙法蓮華輪
// ─────────────────────────────────────────────────────────────────────────────
export const MandalaWheel: React.FC<GameProps> = ({ merit, onUpdateResources, onLog }) => {
  const [bet, setBet] = useState(200);
  const [isSpinning, setIsSpinning] = useState(false);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [burst, setBurst] = useState(false);

  // A MotionValue we drive with `animate()` for physics-accurate deceleration
  const rotation = useMotionValue(0);
  const totalRotRef = useRef(0);

  const options = [
    { label: '蓮花聖德賜福 (x2 功德)', multiplier: 2.0, type: 'merit' },
    { label: '諸神微嗔因果 (-100 功德)', multiplier: -0.5, type: 'merit' },
    { label: '天降橫財暴擊 (x5 功德)', multiplier: 5.0, type: 'merit' },
    { label: '洗滌業障塵埃 (-30 業障)', multiplier: 0, type: 'karma_cleanse' },
    { label: '過河小鬼買路錢 (-50 功德)', multiplier: -0.2, type: 'merit' },
    { label: '祖先恩賜大顯靈 (x10 功德!)', multiplier: 10.0, type: 'merit' },
    { label: '九幽虛空漩渦 (吞噬本金)', multiplier: 0.0, type: 'merit' },
    { label: '殿宇微薄供奉 (+50 功德)', multiplier: 0.5, type: 'merit' },
  ];

  const handleSpin = () => {
    if (merit < bet) {
      onLog('❌ 功德福報不足以轉動蓮華法輪！', 'error');
      sound.playFail();
      return;
    }
    if (isSpinning) return;

    setIsSpinning(true);
    setOutcome(null);
    setBurst(false);
    onUpdateResources({ merit: -bet });
    sound.playBell();

    // Extra spin amount: 5-8 full rotations + random landing sector
    const extraSpins = (5 + Math.floor(Math.random() * 3)) * 360;
    const landingOffset = Math.floor(Math.random() * 360);
    const targetTotal = totalRotRef.current + extraSpins + landingOffset;
    totalRotRef.current = targetTotal;

    onLog(`🕯️ 扣問天命！奉獻 ${bet} 功德，轉動【妙法蓮華法輪】！`, 'info');

    // Phase 1 – fast wind-up (spring-like acceleration)
    animate(rotation, totalRotRef.current, {
      duration: 3.5,
      ease: [0.15, 0.85, 0.35, 1.0], // custom cubic-bezier: slow→fast→crawl
      onComplete: () => {
        setIsSpinning(false);
        const normalised = ((targetTotal % 360) + 360) % 360;
        const idx = Math.floor(normalised / (360 / options.length)) % options.length;
        const target = options[idx];
        setOutcome(target.label);
        setBurst(true);

        if (target.type === 'merit') {
          const reward = Math.round(bet * target.multiplier);
          if (reward > 0) {
            onUpdateResources({ merit: reward });
            onLog(`🎉 妙法蓮華！落在【${target.label}】！功德加倍：+${reward}`, 'success');
            sound.playSuccess();
          } else if (reward === 0 && target.multiplier === 0) {
            onLog(`💀 虛空吞噬！落在【${target.label}】！offerings 被地獄犬叼走。`, 'error');
            sound.playFail();
          } else {
            onUpdateResources({ merit: reward });
            onLog(`👹 諸神微嗔！落在【${target.label}】！扣除 ${Math.abs(reward)} 功德。`, 'warn');
            sound.playFail();
          }
        } else if (target.type === 'karma_cleanse') {
          onUpdateResources({ karma: -30 });
          onLog(`😇 洗滌塵心！落在【${target.label}】！業障大大減輕。`, 'success');
          sound.playSuccess();
        }
      },
    });
  };

  // Petals that orbit the wheel during spin
  const petalAngles = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <div className="bg-[#130f0d]/95 p-6 rounded-3xl border border-[#b08a5b]/40 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-950/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] bg-amber-950/80 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
            因果氣運（劫）
          </span>
          <h3 className="text-2xl font-bold text-amber-500 mt-2 font-serif">妙法蓮華輪 (Mandala Wheel)</h3>
        </div>
        <div className="text-right text-sm text-zinc-400 font-mono">
          當前功德: <span className="text-amber-400 font-bold">{merit}</span> 功德
        </div>
      </div>

      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
        轉動莊嚴肅穆的妙法蓮華八寶功德輪。一切交由冥冥之中的輪迴抽獎，看是天降十倍神蹟福報，還是突如其來的業障大追殺！
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Wheel */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative w-52 h-52 flex items-center justify-center">
            {/* Glow ring that pulses while spinning */}
            <motion.div
              animate={isSpinning ? { opacity: [0.3, 0.9, 0.3], scale: [1, 1.08, 1] } : { opacity: 0.2 }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="absolute inset-0 rounded-full border-4 border-amber-400/60 blur-sm"
            />

            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/40 bg-black shadow-xl shadow-black overflow-hidden">
              {/* Sector lines */}
              {petalAngles.map((a) => (
                <div
                  key={a}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ transform: `rotate(${a}deg)` }}
                >
                  <div className="w-full h-px bg-amber-900/30" />
                </div>
              ))}

              {/* Spinning emoji layer */}
              <motion.div
                style={{ rotate: rotation }}
                className="absolute inset-0"
              >
                {petalAngles.map((a, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ transform: `rotate(${a}deg)` }}
                  >
                    {/* emoji at rim */}
                    <div
                      className="absolute text-sm"
                      style={{ top: 8 }}
                    >
                      {i % 2 === 0 ? '💮' : '💫'}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Center hub */}
            <div className="z-10 w-14 h-14 rounded-full bg-[#1a1208] border-2 border-amber-600/50 flex items-center justify-center shadow-lg">
              <Compass className="w-8 h-8 text-amber-400" />
            </div>

            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 z-20">
              <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-[20px] border-t-amber-500 drop-shadow-md" />
            </div>

            {/* Particle burst overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <ParticleBurst trigger={burst} color="#f59e0b" />
            </div>
          </div>

          {outcome && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 font-mono text-center text-xs"
            >
              輪盤指向卦象:{' '}
              <b className="text-amber-400 text-xs block mt-1 font-serif">{outcome}</b>
            </motion.div>
          )}
        </div>

        {/* Controllers */}
        <div className="space-y-4">
          <div className="bg-black/40 p-4 rounded-2xl border border-[#2d2117]">
            <label className="text-xs text-[#b08a5b] uppercase font-mono block mb-2 font-bold font-serif">
              請調配祈福功德 offerings：
            </label>
            <div className="flex gap-2">
              {[100, 200, 500, 1000].map((val) => (
                <button
                  key={val}
                  disabled={isSpinning}
                  onClick={() => { setBet(val); sound.playUiClick(); }}
                  className={`flex-1 py-2 rounded-xl font-mono text-sm border cursor-pointer transition-all ${
                    bet === val
                      ? 'bg-amber-950 border border-amber-500 text-amber-400 font-bold'
                      : 'bg-[#1c120c] border-[#2d2117] text-[#b08a5b] hover:bg-zinc-800'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            onClick={handleSpin}
            disabled={isSpinning || merit < bet}
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            className="w-full py-4 bg-gradient-to-r from-amber-700 to-amber-950 hover:from-amber-600 hover:to-amber-900 text-white font-bold rounded-2xl transition-colors shadow-lg uppercase tracking-widest text-xs flex items-center justify-center gap-2 border border-amber-500/20 disabled:opacity-40 cursor-pointer"
          >
            🎡 恭請大威德蓮華輪旋轉
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 13. AURA WHEEL  佛光普照
// ─────────────────────────────────────────────────────────────────────────────
export const AuraWheel: React.FC<GameProps> = ({ hellMoney, onUpdateResources, onLog }) => {
  const [bet, setBet] = useState(500);
  const [chosenColor, setChosenColor] = useState<'gold' | 'green' | 'purple' | 'red'>('gold');
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [burst, setBurst] = useState(false);

  const needleAngle = useSpring(0, { stiffness: 60, damping: 8, mass: 1.2 });

  const colors = [
    { id: 'green', name: '🟢 翡翠綠 (Jade Green)', multiplier: 2, bg: 'bg-emerald-950 text-emerald-400', hex: '#10b981' },
    { id: 'gold', name: '🟡 帝王金 (Imperial Gold)', multiplier: 5, bg: 'bg-yellow-950 text-yellow-400', hex: '#f59e0b' },
    { id: 'purple', name: '🟣 乾坤紫 (Void Purple)', multiplier: 10, bg: 'bg-purple-950 text-purple-400', hex: '#a855f7' },
    { id: 'red', name: '🔴 煉獄紅 (Blood Red)', multiplier: 20, bg: 'bg-red-950 text-red-400', hex: '#ef4444' },
  ];

  const handleSpin = () => {
    if (hellMoney < bet) {
      onLog('❌ 冥紙餘額不足以叩問佛光羅盤！', 'error');
      sound.playFail();
      return;
    }
    if (isSpinning) return;

    setIsSpinning(true);
    setCurrentColor(null);
    setWon(null);
    setBurst(false);
    onUpdateResources({ hellMoney: -bet });
    sound.playBell();

    const colNames = { green: '翡翠綠', gold: '帝王金', purple: '乾坤紫', red: '煉獄紅' };
    onLog(`🧭 羅盤針轉！奉上 ${bet} 冥紙。預測：${colNames[chosenColor]}。`, 'info');

    let count = 0;
    const total = 18;

    const tick = () => {
      if (count >= total) return;
      const randomCol = colors[Math.floor(Math.random() * colors.length)];
      setCurrentColor(randomCol.name);

      // Needle swings to a random sector angle each flash
      const sectorAngle = (colors.indexOf(randomCol) / colors.length) * 360 - 180;
      needleAngle.set(sectorAngle + (Math.random() - 0.5) * 40);

      sound.playWoodBlock(1.5);
      count++;

      // Slow down as we near the end (ease out timing)
      const delay = 80 + (count / total) * 220;
      if (count < total) {
        setTimeout(tick, delay);
      } else {
        // Final result
        setTimeout(() => {
          const finalColor = colors[Math.floor(Math.random() * colors.length)];
          setCurrentColor(finalColor.name);
          const finalAngle = (colors.indexOf(finalColor) / colors.length) * 360 - 180;
          needleAngle.set(finalAngle);
          setIsSpinning(false);
          setBurst(true);

          if (finalColor.id === chosenColor) {
            setWon(true);
            const winReward = bet * finalColor.multiplier;
            onUpdateResources({ hellMoney: winReward });
            onLog(`🎉 佛光大放！赫然亮起【${finalColor.name}】！賜予冥錢 +${winReward}`, 'success');
            sound.playSuccess();
          } else {
            setWon(false);
            onLog(`💀 佛光錯位！亮起的是【${finalColor.name}】。offerings 扣除。`, 'warn');
            sound.playFail();
          }
        }, 300);
      }
    };
    tick();
  };

  const burstColor = colors.find((c) => c.id === chosenColor)?.hex ?? '#f59e0b';

  return (
    <div className="bg-[#130f0d]/95 p-6 rounded-3xl border border-[#b08a5b]/40 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-900/40 rounded-full blur-2xl pointer-events-none" />

      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] bg-zinc-900 border border-zinc-700 text-zinc-400 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
            因果氣運（劫）
          </span>
          <h3 className="text-2xl font-bold text-zinc-350 mt-2 font-serif">佛光普照 (Aura Wheel)</h3>
        </div>
        <div className="text-right text-sm text-zinc-400 font-mono">
          當前冥紙: <span className="text-purple-400 font-bold">${hellMoney}</span>
        </div>
      </div>

      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
        預測下次羅盤震盪時，大雄寶殿法身牆壁將會折射出何種瑞氣佛光。綠色佛光普照機率最高，血色地獄之光極其罕見，但擁有高達{' '}
        <strong className="text-red-400 font-bold">20 倍</strong> 的超級賠率！
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Needle dome */}
        <div className="bg-black/30 p-6 rounded-2xl border border-[#2d2117] flex flex-col items-center justify-center min-h-[200px]">
          <span className="text-xs text-[#b08a5b] font-mono uppercase tracking-wider mb-3">天宮五彩佛光針</span>

          {/* Color segments behind needle */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Quadrant background arcs */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 112 112">
              {colors.map((c, i) => {
                const sweep = 360 / colors.length;
                const startAngle = i * sweep - 90;
                const endAngle = startAngle + sweep;
                const toRad = (d: number) => (d * Math.PI) / 180;
                const r = 52;
                const cx = 56;
                const cy = 56;
                const x1 = cx + r * Math.cos(toRad(startAngle));
                const y1 = cy + r * Math.sin(toRad(startAngle));
                const x2 = cx + r * Math.cos(toRad(endAngle));
                const y2 = cy + r * Math.sin(toRad(endAngle));
                return (
                  <path
                    key={c.id}
                    d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`}
                    fill={c.hex}
                    opacity={0.18}
                  />
                );
              })}
              <circle cx="56" cy="56" r="52" fill="none" stroke="#3f3f46" strokeWidth="1.5" />
            </svg>

            {/* Glow burst on result */}
            {burst && (
              <motion.div
                initial={{ opacity: 0.8, scale: 0.6 }}
                animate={{ opacity: 0, scale: 2.2 }}
                transition={{ duration: 0.9 }}
                className="absolute inset-0 rounded-full"
                style={{ background: `radial-gradient(circle, ${burstColor}55 0%, transparent 70%)` }}
              />
            )}

            {/* Physics needle */}
            <motion.div
              style={{ rotate: needleAngle }}
              className="absolute inset-0 flex items-center justify-center origin-center"
            >
              {/* Needle shaft */}
              <div className="relative flex flex-col items-center" style={{ height: 80 }}>
                <div
                  className="w-1.5 rounded-t-full"
                  style={{ height: 44, background: 'linear-gradient(to top, #dc2626, #fbbf24)' }}
                />
                <div className="w-1.5 rounded-b-full" style={{ height: 36, background: '#3f3f46' }} />
              </div>
            </motion.div>

            {/* Center dot */}
            <div className="absolute w-4 h-4 rounded-full bg-[#e5c583] border-2 border-[#130f0d] z-10 shadow-lg" />

            {/* Particle burst */}
            <div className="absolute inset-0 pointer-events-none">
              <ParticleBurst trigger={burst} color={burstColor} />
            </div>
          </div>

          {currentColor && (
            <motion.div
              key={currentColor}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mt-4 font-mono font-bold text-sm tracking-widest text-center font-serif ${
                won === true ? 'text-amber-400' : won === false ? 'text-red-400' : 'text-[#e5c583]'
              }`}
            >
              🌟 {currentColor} 🌟
            </motion.div>
          )}
        </div>

        {/* Controllers */}
        <div className="space-y-4">
          <div className="bg-black/40 p-4 rounded-2xl border border-[#2d2117]">
            <label className="text-xs text-[#b08a5b] uppercase font-mono block mb-2 font-bold font-serif">
              預測佛光色相：
            </label>
            <div className="grid grid-cols-2 gap-2">
              {colors.map((col) => (
                <button
                  key={col.id}
                  disabled={isSpinning}
                  onClick={() => { setChosenColor(col.id as any); sound.playUiClick(); }}
                  className={`py-2 px-3 rounded-xl text-left text-xs font-mono transition-all border cursor-pointer ${
                    chosenColor === col.id
                      ? `${col.bg} border-zinc-400 font-bold shadow-md`
                      : 'bg-[#1c120c] border-[#2d2117] text-[#b08a5b] hover:bg-zinc-800'
                  }`}
                >
                  <span className="block truncate">{col.name}</span>
                  <span className="text-[10px] text-zinc-500 font-bold block">{col.multiplier}x 冥紙回報</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-black/40 p-4 rounded-2xl border border-[#2d2117]">
            <label className="text-xs text-[#b08a5b] uppercase font-mono block mb-1">調配香火冥紙：</label>
            <input
              type="number"
              min={100}
              max={5000}
              value={bet}
              disabled={isSpinning}
              onChange={(e) => setBet(Math.max(100, Number(e.target.value)))}
              className="w-full bg-black/60 border border-[#2d2117] rounded-xl p-2 text-sm text-purple-400 font-mono outline-none"
            />
          </div>

          <motion.button
            onClick={handleSpin}
            disabled={isSpinning || hellMoney < bet}
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            className="w-full py-4 bg-gradient-to-r from-zinc-850 to-black hover:from-[#e5c583] hover:to-[#b08a5b] hover:text-black text-[#e5c583] font-bold rounded-2xl transition-all shadow-lg uppercase tracking-widest text-xs flex items-center justify-center gap-2 border border-[#2d2117] cursor-pointer"
          >
            🕯️ 啟動七星佛光針
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 14. FRUIT OFFERING SLOTS  貢品老虎機
// ─────────────────────────────────────────────────────────────────────────────

// Individual reel with a rolling strip animation
const SlotReel: React.FC<{ symbols: string[]; finalSymbol: string; isSpinning: boolean; delay?: number }> = ({
  symbols,
  finalSymbol,
  isSpinning,
  delay = 0,
}) => {
  const REEL_HEIGHT = 80; // px per symbol
  const yMV = useMotionValue(0);
  const ySpring = useSpring(yMV, { stiffness: 120, damping: 18, mass: 0.9 });
  const controlRef = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    if (isSpinning) {
      // Spin fast downward, loop by resetting
      const spinLoop = () => {
        yMV.set(0);
        controlRef.current = animate(yMV, -REEL_HEIGHT * symbols.length, {
          duration: 0.4,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        });
      };
      const timer = setTimeout(spinLoop, delay);
      return () => {
        clearTimeout(timer);
        controlRef.current?.stop();
      };
    } else {
      // Stop: snap to final symbol
      controlRef.current?.stop();
      const finalIdx = symbols.indexOf(finalSymbol);
      yMV.set(-(finalIdx * REEL_HEIGHT));
    }
  }, [isSpinning, finalSymbol, delay]);

  const strip = [...symbols, ...symbols]; // double for seamless loop

  return (
    <div className="w-16 h-20 bg-[#1c120c] rounded-xl border border-[#2d2117] overflow-hidden flex items-center justify-center shadow-inner shadow-black/60 relative">
      <motion.div style={{ y: ySpring }} className="flex flex-col">
        {strip.map((sym, i) => (
          <div key={i} className="w-16 h-20 flex items-center justify-center text-4xl flex-shrink-0">
            {sym}
          </div>
        ))}
      </motion.div>
      {/* Highlight line */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-amber-500/20 pointer-events-none" />
    </div>
  );
};

export const FruitOfferingSlots: React.FC<GameProps> = ({ hellMoney, onUpdateResources, onLog }) => {
  const [bet, setBet] = useState(200);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<string[]>(['🍑', '🍎', '🐷']);
  const [burst, setBurst] = useState(false);

  const symbols = ['🍑', '🍎', '🍊', '🐷', '🧧', '⚱️'];
  const symbolNames: { [key: string]: string } = {
    '🍑': '仙桃祭 (Peach)',
    '🍎': '平安果 (Apple)',
    '🍊': '大吉橘 (Orange)',
    '🐷': '烤乳豬 (Roast Pig)',
    '🧧': '利是封 (Red Packet)',
    '⚱️': '青銅鼎 (Jade Urn)',
  };

  const handlePull = () => {
    if (hellMoney < bet) {
      onLog('❌ 冥紙不足，無法購買本盤貢品 offerings 陣位！', 'error');
      sound.playFail();
      return;
    }
    if (isSpinning) return;

    setIsSpinning(true);
    setBurst(false);
    onUpdateResources({ hellMoney: -bet });
    sound.playBell();
    onLog(`🍖 貢品上案！奉上 ${bet} 冥紙，供奉桌轉盤瘋狂轉動...`, 'info');

    // Stop reels sequentially with increasing delay
    const stopTimes = [1200, 1700, 2200];
    const finals: string[] = [];

    stopTimes.forEach((t, i) => {
      setTimeout(() => {
        const sym = symbols[Math.floor(Math.random() * symbols.length)];
        finals[i] = sym;
        setReels((prev) => {
          const next = [...prev];
          next[i] = sym;
          return next;
        });
        sound.playWoodBlock(1.4);

        if (i === 2) {
          // All reels stopped
          setTimeout(() => {
            setIsSpinning(false);
            setBurst(true);

            const [f1, f2, f3] = finals;
            let payout = 0;
            let outcomeMsg = '';

            if (f1 === f2 && f2 === f3) {
              if (f1 === '⚱️') { payout = bet * 50; outcomeMsg = '✨ 太古神農大金鼎 (Jackpot!)'; }
              else if (f1 === '🐷') { payout = bet * 20; outcomeMsg = '🍖 金豬報喜大滿貫 (Roast Pig Triple)'; }
              else if (f1 === '🍑') { payout = bet * 15; outcomeMsg = '🍑 三清蟠桃仙樂 (Golden Peach Triple)'; }
              else { payout = bet * 8; outcomeMsg = '🍊 大吉大利大三元 (Citrus Triple)'; }
            } else if (f1 === f2 || f2 === f3 || f1 === f3) {
              payout = bet * 1.5;
              outcomeMsg = '🏮 陰德重合 (Spiritual Pair)';
            } else {
              outcomeMsg = '💀 供桌荒涼 (Cold Altar)';
            }

            if (payout > 0) {
              const finalReward = Math.round(payout);
              onUpdateResources({ hellMoney: finalReward });
              onLog(`🎉 【${outcomeMsg}】顯聖！[${f1}|${f2}|${f3}] 先祖滿意，冥紙 +${finalReward}`, 'success');
              sound.playSuccess();
            } else {
              onLog(`👹 貢桌無靈。[${f1}|${f2}|${f3}] 神明拂袖而去。offerings 耗盡。`, 'warn');
              sound.playFail();
            }
          }, 300);
        }
      }, t);
    });
  };

  // Lever animation
  const leverY = useSpring(0, { stiffness: 400, damping: 25 });
  const handleLeverClick = () => {
    leverY.set(30);
    setTimeout(() => leverY.set(0), 350);
    handlePull();
  };

  return (
    <div className="bg-[#130f0d]/95 p-6 rounded-3xl border border-[#b08a5b]/40 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-950/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] bg-red-950/80 border border-red-500/30 text-red-400 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
            因果氣運（劫）
          </span>
          <h3 className="text-2xl font-bold text-red-500 mt-2 font-serif">貢品老虎機 (Fruit Offering Slots)</h3>
        </div>
        <div className="text-right text-sm text-zinc-400 font-mono">
          當前冥紙: <span className="text-purple-400 font-bold">${hellMoney}</span>
        </div>
      </div>

      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
        拉動古老殿前青銅拉桿，拼湊供桌上的貢品祭祀。湊齊三個青銅鼎 ⚱️ 將引爆驚天動地的{' '}
        <strong className="text-[#e5c583]">"祖先功德大金池 (50x)"</strong>！
      </p>

      {/* Slots machine */}
      <div className="bg-black/30 border border-[#2d2117] rounded-2xl p-6 flex flex-col items-center relative">
        {/* Jackpot banner */}
        <motion.div
          animate={isSpinning ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.6 }}
          transition={{ repeat: Infinity, duration: 0.6 }}
          className="text-[10px] font-mono text-amber-500/70 mb-3 uppercase tracking-widest"
        >
          ⚱️ JACKPOT 50× · 🍑 15× · 🐷 20× · 🍊 8×
        </motion.div>

        {/* Reels row */}
        <div className="flex gap-4 justify-center py-2 bg-black rounded-xl w-full max-w-[280px] border border-red-950/60 shadow-inner relative">
          {reels.map((sym, idx) => (
            <SlotReel
              key={idx}
              symbols={symbols}
              finalSymbol={sym}
              isSpinning={isSpinning}
              delay={idx * 60}
            />
          ))}

          {/* Particle burst on top */}
          <div className="absolute inset-0 pointer-events-none">
            <ParticleBurst trigger={burst} color="#ef4444" />
          </div>
        </div>

        <div className="mt-4 text-center font-mono text-[9px] text-zinc-500">
          當前祭祖供品:{' '}
          <span className="text-red-400 font-bold">
            {reels.map((r) => symbolNames[r]?.split(' ')[0]).join(' - ')}
          </span>
        </div>
      </div>

      {/* Controllers */}
      <div className="space-y-4 mt-6">
        <div className="bg-black/40 p-4 rounded-2xl border border-[#2d2117]">
          <label className="text-xs text-[#b08a5b] uppercase font-mono block mb-2 font-bold font-serif">
            投入貢品冥紙 offerings：
          </label>
          <div className="flex gap-2">
            {[100, 200, 500, 2000].map((val) => (
              <button
                key={val}
                disabled={isSpinning}
                onClick={() => { setBet(val); sound.playUiClick(); }}
                className={`flex-1 py-2 rounded-xl font-mono text-sm border cursor-pointer transition-all ${
                  bet === val
                    ? 'bg-red-950 border border-red-500 text-red-400 font-bold'
                    : 'bg-[#1c120c] border-[#2d2117] text-[#b08a5b] hover:bg-zinc-800'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Lever + button */}
        <div className="flex items-center gap-4">
          {/* Visual lever */}
          <div className="flex flex-col items-center select-none">
            <div className="w-3 h-3 rounded-full bg-amber-500 border border-amber-300 shadow-md" />
            <motion.div style={{ y: leverY }} className="w-1.5 h-10 bg-gradient-to-b from-amber-600 to-amber-900 rounded-b-full" />
            <div className="w-5 h-2 rounded-full bg-zinc-700 border border-zinc-600 mt-0.5" />
          </div>

          <motion.button
            onClick={handleLeverClick}
            disabled={isSpinning || hellMoney < bet}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            className="flex-1 py-4 bg-gradient-to-r from-red-700 to-red-950 hover:from-red-600 hover:to-red-900 text-white font-bold rounded-2xl transition-colors shadow-lg uppercase tracking-widest text-xs flex items-center justify-center gap-2 border border-red-500/20 disabled:opacity-40 cursor-pointer"
          >
            🕹️ 猛拉純金拉桿 · 供養祖先
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 15. PAPER HORSE RACE  紙扎駿馬奔騰
// ─────────────────────────────────────────────────────────────────────────────
export const PaperHorseRace: React.FC<GameProps> = ({ hellMoney, onUpdateResources, onLog }) => {
  const [bet, setBet] = useState(300);
  const [chosenHorse, setChosenHorse] = useState<number>(0);
  const [isRacing, setIsRacing] = useState(false);
  const [positions, setPositions] = useState<number[]>([0, 0, 0, 0]);
  const [winner, setWinner] = useState<number | null>(null);

  const horses = [
    { name: '🔴 追風赤兔馬 (Red Hare)', color: 'bg-red-600', border: 'border-red-500', trailColor: '#dc2626' },
    { name: '⚫ 踏雪烏騅馬 (Obsidian Ghost)', color: 'bg-zinc-600', border: 'border-zinc-500', trailColor: '#52525b' },
    { name: '⚪ 絕影白玉馬 (Jade Pearl)', color: 'bg-zinc-200', border: 'border-zinc-300', trailColor: '#e4e4e7' },
    { name: '🟡 鎏金的盧馬 (Golden Hoof)', color: 'bg-amber-500', border: 'border-amber-400', trailColor: '#f59e0b' },
  ];

  // Springs for each horse progress bar
  const springs = [
    useSpring(0, { stiffness: 40, damping: 14, mass: 0.8 }),
    useSpring(0, { stiffness: 38, damping: 13, mass: 0.9 }),
    useSpring(0, { stiffness: 42, damping: 15, mass: 0.7 }),
    useSpring(0, { stiffness: 36, damping: 12, mass: 1.0 }),
  ];

  const handleRace = () => {
    if (hellMoney < bet) {
      onLog('❌ 冥紙不足，無法包下本場紙扎駿馬賽道！', 'error');
      sound.playFail();
      return;
    }
    if (isRacing) return;

    setIsRacing(true);
    setWinner(null);
    const resetPos = [0, 0, 0, 0];
    setPositions(resetPos);
    springs.forEach((s) => s.set(0));

    onUpdateResources({ hellMoney: -bet });
    sound.playBell();
    onLog(`🏇 鳴鑼開賽！押注 ${bet} 冥紙支持【${horses[chosenHorse].name}】。`, 'info');

    let currentPositions = [0, 0, 0, 0];

    const tick = () => {
      // Each horse advances by a random amount; apply slight randomness per tick
      currentPositions = currentPositions.map((pos) => {
        if (pos >= 100) return 100;
        // Random burst + slight favour for drama
        const step = Math.random() * 9 + 1;
        return Math.min(100, pos + step);
      });

      setPositions([...currentPositions]);
      springs.forEach((s, i) => s.set(currentPositions[i]));
      sound.playWoodBlock(1.2);

      const finishedIdx = currentPositions.findIndex((p) => p >= 100);
      if (finishedIdx !== -1) {
        let winnerIdx = 0;
        let maxPos = 0;
        currentPositions.forEach((pos, idx) => {
          if (pos > maxPos) { maxPos = pos; winnerIdx = idx; }
        });
        setWinner(winnerIdx);
        setIsRacing(false);

        if (winnerIdx === chosenHorse) {
          const winReward = bet * 4;
          onUpdateResources({ hellMoney: winReward });
          onLog(`🎉 駿馬凱旋！【${horses[winnerIdx].name}】率先衝破彼岸終點！冥紙 +${winReward}`, 'success');
          sound.playSuccess();
        } else {
          onLog(`💀 葬身灰燼！【${horses[winnerIdx].name}】奪魁。你的紙馬在大風中燃燒崩解。`, 'warn');
          sound.playFail();
        }
        return;
      }

      // Vary tick speed 120–230ms for organic feel
      setTimeout(tick, 120 + Math.random() * 110);
    };

    setTimeout(tick, 180);
  };

  const widths = springs.map((s) => useTransform(s, (v) => `${v}%`));

  return (
    <div className="bg-[#130f0d]/95 p-6 rounded-3xl border border-[#b08a5b]/40 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-900/40 rounded-full blur-2xl pointer-events-none" />

      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] bg-zinc-900 border border-zinc-700 text-zinc-400 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
            因果氣運（劫）
          </span>
          <h3 className="text-2xl font-bold text-zinc-350 mt-2 font-serif">紙扎駿馬奔騰 (Paper Horse Race)</h3>
        </div>
        <div className="text-right text-sm text-zinc-400 font-mono">
          當前冥紙: <span className="text-purple-400 font-bold">${hellMoney}</span>
        </div>
      </div>

      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
        四尊陰司白事傳統紙紮駿馬，將在冥界灰燼鋪設的跑道上角逐。挑選一尊你認為與你有靈魂羈絆的烈馬，祈禱牠踏著骨灰領先越過奈何彼岸！
      </p>

      {/* Track */}
      <div className="bg-black/30 border border-[#2d2117] rounded-2xl p-4 space-y-4">
        {horses.map((h, idx) => {
          const isWinner = winner === idx;
          const isChosen = chosenHorse === idx;
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className={isChosen ? 'text-amber-400 font-bold' : 'text-[#e5c583]'}>
                  {isChosen ? '► ' : ''}{h.name}
                </span>
                <span className="text-zinc-400">{Math.round(positions[idx])}%</span>
              </div>
              <div className="h-5 bg-black/60 rounded-full overflow-hidden border border-[#2d2117] relative">
                <motion.div
                  style={{ width: widths[idx] }}
                  className={`h-full ${h.color} rounded-full relative`}
                >
                  {/* Shimmer */}
                  {isRacing && (
                    <motion.div
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                  )}
                  {/* Horse emoji at front */}
                  <span
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-base leading-none"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }}
                  >
                    🐴
                  </span>
                </motion.div>

                {/* Winner flash */}
                {isWinner && (
                  <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: 4, duration: 0.25 }}
                    className="absolute inset-0 bg-amber-400/30 rounded-full"
                  />
                )}

                <span className="absolute right-2 top-0.5 text-[8px] text-zinc-600 font-bold">🏁</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controllers */}
      {!isRacing && (
        <div className="space-y-4 mt-6">
          <div className="bg-black/40 p-4 rounded-2xl border border-[#2d2117]">
            <label className="text-xs text-[#b08a5b] uppercase font-mono block mb-2 font-bold font-serif">
              選拔你支持的紙馬：
            </label>
            <div className="grid grid-cols-2 gap-2">
              {horses.map((h, idx) => (
                <button
                  key={idx}
                  onClick={() => { setChosenHorse(idx); sound.playUiClick(); }}
                  className={`py-2 px-3 rounded-xl text-left text-xs font-mono transition-all border cursor-pointer ${
                    chosenHorse === idx
                      ? 'bg-zinc-800 border-zinc-400 text-zinc-200 font-bold shadow-md'
                      : 'bg-[#1c120c] border-[#2d2117] text-[#b08a5b] hover:bg-zinc-800'
                  }`}
                >
                  {h.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-black/40 p-4 rounded-2xl border border-[#2d2117]">
            <label className="text-xs text-[#b08a5b] uppercase font-mono block mb-1 font-bold">
              調配贊助冥紙 offerings：
            </label>
            <input
              type="number"
              min={100}
              max={3000}
              value={bet}
              onChange={(e) => setBet(Math.max(100, Number(e.target.value)))}
              className="w-full bg-black/60 border border-[#2d2117] rounded-xl p-2 text-sm text-purple-400 font-mono outline-none"
            />
          </div>

          <motion.button
            onClick={handleRace}
            disabled={hellMoney < bet}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            className="w-full py-4 bg-gradient-to-r from-zinc-850 to-black hover:from-[#e5c583] hover:to-[#b08a5b] hover:text-black text-[#e5c583] font-bold rounded-2xl transition-all shadow-lg uppercase tracking-widest text-xs flex items-center justify-center gap-2 border border-[#2d2117] cursor-pointer"
          >
            🐎 敕令雷火 · 紙馬騰飛
          </motion.button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 16. YIN-YANG DIAL  陰陽羅盤
// ─────────────────────────────────────────────────────────────────────────────
export const YinYangDial: React.FC<GameProps> = ({ merit, onUpdateResources, onLog }) => {
  const [bet, setBet] = useState(100);
  const [currentVal, setCurrentVal] = useState<number>(50);
  const [isSwinging, setIsSwinging] = useState(false);
  const [guess, setGuess] = useState<'high' | 'low'>('high');
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [burst, setBurst] = useState(false);
  const [displayVal, setDisplayVal] = useState(50);

  // Physics spring for needle
  const needleSpring = useSpring(currentVal * 3.6 - 180, {
    stiffness: 35,
    damping: 6,
    mass: 1.4,
  });

  // Oscillate during swing
  useEffect(() => {
    if (!isSwinging) return;
    let frame = 0;
    const oscillate = () => {
      const t = Date.now() / 1000;
      // Decaying oscillation: amplitude shrinks, speed varies
      const amplitude = 160 * Math.exp(-t * 0.3);
      const freq = 3 + t * 0.5;
      needleSpring.set(Math.sin(t * freq) * amplitude);
      frame = requestAnimationFrame(oscillate);
    };
    frame = requestAnimationFrame(oscillate);
    return () => cancelAnimationFrame(frame);
  }, [isSwinging]);

  // Count-up display during reveal
  const countUpRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handlePulse = () => {
    if (merit < bet) {
      onLog('❌ 功德福報不足以挑戰八卦羅盤磁極！', 'error');
      sound.playFail();
      return;
    }
    if (isSwinging) return;

    setIsSwinging(true);
    setResult(null);
    setBurst(false);
    onUpdateResources({ merit: -bet });
    sound.playBell();

    onLog(`☯️ 羅盤飛轉！奉獻 ${bet} 功德。猜測：${guess === 'high' ? '高（乾/陽）' : '低（坤/陰）'}。`, 'info');

    setTimeout(() => {
      const nextVal = Math.floor(Math.random() * 100) + 1;

      // Animate needle to final position
      needleSpring.set(nextVal * 3.6 - 180);

      // Count-up display
      if (countUpRef.current) clearInterval(countUpRef.current);
      let v = currentVal;
      const step = nextVal > v ? 1 : -1;
      countUpRef.current = setInterval(() => {
        v += step;
        setDisplayVal(v);
        if (v === nextVal) { clearInterval(countUpRef.current!); }
      }, 18);

      setIsSwinging(false);

      const isHigher = nextVal > currentVal;
      const isCorrect = (guess === 'high' && isHigher) || (guess === 'low' && !isHigher);

      if (nextVal === currentVal) {
        setResult('draw');
        setBurst(false);
        onUpdateResources({ merit: bet });
        onLog(`☯️ 極限太極！頻率精確停在 ${nextVal}（平手）！功德無損奉還。`, 'info');
      } else if (isCorrect) {
        setResult('win');
        setBurst(true);
        const winReward = Math.round(bet * 1.95);
        onUpdateResources({ merit: winReward });
        onLog(`🎉 卜算精確！${currentVal} → ${nextVal}！太極陰陽調和賜福 +${winReward}`, 'success');
        sound.playSuccess();
      } else {
        setResult('lose');
        setBurst(false);
        onLog(`💀 磁極失準！${currentVal} → ${nextVal}。五行混亂，offerings 折損。`, 'warn');
        sound.playFail();
      }

      setCurrentVal(nextVal);
      setDisplayVal(nextVal);
    }, 1600);
  };

  const resultColors: Record<string, string> = {
    win: 'text-amber-400',
    lose: 'text-red-400',
    draw: 'text-zinc-400',
  };

  return (
    <div className="bg-[#130f0d]/95 p-6 rounded-3xl border border-[#b08a5b]/40 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-950/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] bg-amber-950/80 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
            因果氣運（劫）
          </span>
          <h3 className="text-2xl font-bold text-amber-500 mt-2 font-serif">陰陽羅盤 (Yin-Yang Dial)</h3>
        </div>
        <div className="text-right text-sm text-zinc-400 font-mono">
          當前功德: <span className="text-amber-400 font-bold">{merit}</span> 功德
        </div>
      </div>

      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
        大師親自開光的法器八卦風水羅盤，指針將會動態波動。預測下次大師唸咒時，羅盤偏轉出的天命指數（1-100）是否高於{' '}
        <strong className="text-amber-400 font-bold">{currentVal}</strong> 點（乾陽/高），還是低（坤陰/低）。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Dial */}
        <div className="bg-black/30 p-6 rounded-2xl border border-[#2d2117] flex flex-col items-center justify-center min-h-[200px]">
          <span className="text-xs text-[#b08a5b] font-mono uppercase tracking-wider mb-3">玄學八卦風水針</span>

          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Yin-yang half rings */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 112 112">
              {/* Yang (top) half amber */}
              <path d="M56,4 A52,52 0 0,1 56,108" fill="#92400e" opacity="0.25" />
              {/* Yin (bottom) half dark */}
              <path d="M56,108 A52,52 0 0,1 56,4" fill="#1c1917" opacity="0.5" />
              {/* Divider */}
              <circle cx="56" cy="56" r="52" fill="none" stroke="#44403c" strokeWidth="1.5" />
              {/* Tick marks */}
              {Array.from({ length: 10 }, (_, ti) => {
                const angle = (ti / 10) * Math.PI * 2 - Math.PI / 2;
                const r1 = 44; const r2 = 50;
                return (
                  <line
                    key={ti}
                    x1={56 + r1 * Math.cos(angle)} y1={56 + r1 * Math.sin(angle)}
                    x2={56 + r2 * Math.cos(angle)} y2={56 + r2 * Math.sin(angle)}
                    stroke="#57534e" strokeWidth="1"
                  />
                );
              })}
            </svg>

            {/* Glow on win */}
            {result === 'win' && burst && (
              <motion.div
                initial={{ opacity: 0.9, scale: 0.7 }}
                animate={{ opacity: 0, scale: 2 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 rounded-full"
                style={{ background: 'radial-gradient(circle, #f59e0b55 0%, transparent 70%)' }}
              />
            )}

            {/* Physics needle */}
            <motion.div
              style={{ rotate: needleSpring }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative flex flex-col items-center origin-center" style={{ height: 80 }}>
                <div
                  className="w-1.5 rounded-t-full"
                  style={{ height: 44, background: 'linear-gradient(to top, #dc2626, #fbbf24)' }}
                />
                <div className="w-1.5 rounded-b-full" style={{ height: 36, background: '#292524' }} />
              </div>
            </motion.div>

            {/* Center pivot */}
            <div className="absolute w-4 h-4 rounded-full bg-[#e5c583] border-2 border-[#130f0d] z-10 shadow-lg" />

            {/* Particle burst */}
            <div className="absolute inset-0 pointer-events-none">
              <ParticleBurst trigger={burst} color="#f59e0b" />
            </div>
          </div>

          {/* Value readout */}
          <motion.div
            key={displayVal}
            className={`mt-4 font-mono font-bold text-base tracking-widest text-center font-serif ${
              result ? resultColors[result] : 'text-[#e5c583]'
            }`}
          >
            {isSwinging ? '🌀 乾坤波動中...' : `🧭 當前天命頻率: ${displayVal}`}
          </motion.div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-1 text-xs font-mono font-bold ${resultColors[result]}`}
            >
              {result === 'win' ? '✅ 卜算成功' : result === 'lose' ? '❌ 磁極失準' : '☯️ 平局'}
            </motion.div>
          )}
        </div>

        {/* Controllers */}
        <div className="space-y-4">
          <div className="bg-black/40 p-4 rounded-2xl border border-[#2d2117]">
            <label className="text-xs text-[#b08a5b] uppercase font-mono block mb-2 font-bold font-serif">
              請猜測下次指針偏轉方向：
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={isSwinging}
                onClick={() => { setGuess('high'); sound.playUiClick(); }}
                className={`py-3 rounded-xl font-mono text-xs transition-all border cursor-pointer ${
                  guess === 'high'
                    ? 'bg-amber-950 border-amber-500 text-amber-400 font-bold'
                    : 'bg-[#1c120c] border-[#2d2117] text-[#b08a5b] hover:bg-zinc-800'
                }`}
              >
                🔺 乾陽之兆 · 偏高 (Yang Higher)
              </button>
              <button
                disabled={isSwinging}
                onClick={() => { setGuess('low'); sound.playUiClick(); }}
                className={`py-3 rounded-xl font-mono text-xs transition-all border cursor-pointer ${
                  guess === 'low'
                    ? 'bg-amber-950 border-amber-500 text-amber-400 font-bold'
                    : 'bg-[#1c120c] border-[#2d2117] text-[#b08a5b] hover:bg-zinc-800'
                }`}
              >
                🔻 坤陰之眼 · 偏低 (Yin Lower)
              </button>
            </div>
          </div>

          <div className="bg-black/40 p-4 rounded-2xl border border-[#2d2117]">
            <label className="text-xs text-[#b08a5b] uppercase font-mono block mb-1 font-bold">
              調配求卦功德：
            </label>
            <input
              type="number"
              min={50}
              max={2000}
              value={bet}
              onChange={(e) => setBet(Math.max(50, Number(e.target.value)))}
              className="w-full bg-black/60 border border-[#2d2117] rounded-xl p-2 text-sm text-amber-400 font-mono outline-none"
            />
          </div>

          <motion.button
            onClick={handlePulse}
            disabled={isSwinging || merit < bet}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            className="w-full py-4 bg-gradient-to-r from-amber-700 to-amber-950 hover:from-[#e5c583] hover:to-[#b08a5b] hover:text-black text-white font-bold rounded-2xl transition-all shadow-lg uppercase tracking-widest text-xs flex items-center justify-center gap-2 border border-amber-500/20 disabled:opacity-40 cursor-pointer"
          >
            ☯️ 虔誠推動八卦羅盤
          </motion.button>
        </div>
      </div>
    </div>
  );
};
