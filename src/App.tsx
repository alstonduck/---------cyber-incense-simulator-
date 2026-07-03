import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from './utils/sound';
import { RITUALS_DATA, GameLog, PlayerStats, Ritual } from './types';

// Import Mini-game components
import {
  FortuneStick21,
  DeitiesDemons,
  UnderworldHoldEm,
  DivinationBlocks
} from './components/rituals/SkillRituals';
import {
  PagodaOfHell,
  TombSweeper
} from './components/rituals/ExploitableRituals';
import {
  BurningJossPaper,
  ReincarnationWheel,
  DonationBoxDrop,
  ConstellationKeno,
  CrossingTheRiverStyx
} from './components/rituals/HybridRituals';
import {
  MandalaWheel,
  AuraWheel,
  FruitOfferingSlots,
  PaperHorseRace,
  YinYangDial
} from './components/rituals/PureLuckRituals';
import {
  UltimateDivination
} from './components/rituals/FinaleRitual';

// Import Lucide icons
import {
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  ArrowLeft,
  Layers,
  HelpCircle,
  RefreshCw,
  Compass,
  AlertCircle
} from 'lucide-react';

export default function App() {
  const [showIntro, setShowIntro] = useState<boolean>(true);
  
  const [stats, setStats] = useState<PlayerStats>({
    merit: 1200,
    hellMoney: 6000,
    karma: 15,
    activeIncenseCount: 0,
    incenseBurnPercent: 100,
    incenseQuality: 'normal',
    ancestralSatisfaction: 35,
    heavenlyFavor: 25,
    gamesPlayed: 0,
    totalMeritGained: 1200
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRitualId, setSelectedRitualId] = useState<string | null>(null);
  const [logs, setLogs] = useState<GameLog[]>([
    {
      id: 'init-1',
      text: '⛩️ 因果之門大開，太虛道場已連結。點燃三界清香，即刻叩問天意。',
      timestamp: '吉時',
      type: 'divine'
    },
    {
      id: 'init-2',
      text: '💡 仙人指路：若因果福報虧空，可手動敲擊側邊欄的「賽博木魚」積攢功德！',
      timestamp: '吉時',
      type: 'info'
    },
    {
      id: 'init-3',
      text: '💨 點燃上品檀香或尊貴的霓虹賽博神香，可超度先祖，亦能提升勝率。',
      timestamp: '吉時',
      type: 'success'
    }
  ]);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [floatingMerits, setFloatingMerits] = useState<{ id: number; x: number; y: number }[]>([]);

  // Random Traditional Chinese humorous ticker announcements
  const divinePhrases = [
    '列祖列宗收到了你暗中匯去的 500 冥紙，託夢提示：「求籤廿一中，第三支籤有天意庇佑。」',
    '玉皇大帝因你焚燒低階塑料紙錢，扣除 150 點功德作為天界空氣淨化費。',
    '一陣陰風掃過道場，你突然感到背脊發涼（業障增加 5 點）。',
    '列祖列宗正於宗祠激烈辯論你的嗜賭行為是否孝順，祖先滿意度產生微妙波動。',
    '天界伺服器檢測到上品檀香煙霧，神魔對決獲得冥冥之中的天意關照，勝率微妙上升。',
    '一位路過的小鬼怯生生地問你：「陽間最近有沒有好用的超快充行動電源？」',
    '你的祖母心疼你最近消瘦，囑咐你多去貢品老虎機供奉一些香噴噴的烤乳豬。'
  ];

  // Random logs over time
  useEffect(() => {
    if (showIntro) return;
    const logInterval = setInterval(() => {
      const phrase = divinePhrases[Math.floor(Math.random() * divinePhrases.length)];
      addLog(`🔊 ${phrase}`, 'divine');
      
      setStats(prev => ({
        ...prev,
        ancestralSatisfaction: Math.max(0, Math.min(100, prev.ancestralSatisfaction + (Math.random() < 0.5 ? 2 : -2))),
        heavenlyFavor: Math.max(0, Math.min(100, prev.heavenlyFavor + (Math.random() < 0.5 ? 1 : -1)))
      }));
    }, 25000);

    return () => clearInterval(logInterval);
  }, [showIntro]);

  // Burn active incense sticks over time
  useEffect(() => {
    if (showIntro) return;
    const burnInterval = setInterval(() => {
      setStats(prev => {
        if (prev.activeIncenseCount > 0) {
          const nextPercent = prev.incenseBurnPercent - 5;
          if (nextPercent <= 0) {
            addLog('💨 一炷香已燃盡，香灰委地，因果消散。', 'warn');
            return {
              ...prev,
              activeIncenseCount: Math.max(0, prev.activeIncenseCount - 1),
              incenseBurnPercent: prev.activeIncenseCount > 1 ? 100 : 0
            };
          }
          return {
            ...prev,
            incenseBurnPercent: nextPercent
          };
        }
        return prev;
      });
    }, 4500);

    return () => clearInterval(burnInterval);
  }, [showIntro]);

  const addLog = (text: string, type: 'info' | 'success' | 'warn' | 'error' | 'divine' = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [
      {
        id: Math.random().toString(),
        text,
        timestamp: time,
        type
      },
      ...prev.slice(0, 39)
    ]);
  };

  const handleUpdateResources = (changes: { merit?: number; hellMoney?: number; karma?: number }) => {
    setStats(prev => {
      const nextMerit = prev.merit + (changes.merit || 0);
      return {
        ...prev,
        merit: Math.max(0, nextMerit),
        hellMoney: Math.max(0, prev.hellMoney + (changes.hellMoney || 0)),
        karma: Math.max(0, prev.karma + (changes.karma || 0)),
        totalMeritGained: prev.totalMeritGained + (changes.merit && changes.merit > 0 ? changes.merit : 0),
        gamesPlayed: prev.gamesPlayed + 1
      };
    });
  };

  const handleToggleSound = () => {
    const state = !soundEnabled;
    setSoundEnabled(state);
    sound.enabled = state;
    sound.playUiClick();
  };

  // Click electronic wooden fish
  const handleTapWoodBlock = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    sound.playWoodBlock(1.0);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setFloatingMerits(prev => [...prev, { id, x, y }]);
    
    setStats(prev => ({
      ...prev,
      merit: prev.merit + 1,
      totalMeritGained: prev.totalMeritGained + 1
    }));

    setTimeout(() => {
      setFloatingMerits(prev => prev.filter(f => f.id !== id));
    }, 1000);
  };

  // Offer Incense stick
  const handleOfferIncense = (quality: 'normal' | 'sandalwood' | 'cyber') => {
    const costMap = {
      normal: 100,
      sandalwood: 300,
      cyber: 1000
    };
    const cost = costMap[quality];

    const qualityNames = {
      normal: '凡塵清香',
      sandalwood: '上品檀香',
      cyber: '至尊霓虹香'
    };

    if (stats.hellMoney < cost) {
      addLog(`❌ 冥紙不足，無法請購【${qualityNames[quality]}】！`, 'error');
      sound.playFail();
      return;
    }

    if (stats.activeIncenseCount >= 3) {
      addLog('⚠️ 香爐已滿！請待部分香火燃盡再供奉。', 'warn');
      return;
    }

    sound.playGong();
    setStats(prev => ({
      ...prev,
      hellMoney: prev.hellMoney - cost,
      activeIncenseCount: prev.activeIncenseCount + 1,
      incenseBurnPercent: 100,
      incenseQuality: quality,
      karma: Math.max(0, prev.karma - (quality === 'cyber' ? 15 : quality === 'sandalwood' ? 5 : 2))
    }));

    addLog(`🕯️ 點燃 1支【${qualityNames[quality]}】。消耗 ${cost} 冥紙，業障隨香煙消散。`, 'success');
  };

  // Reset/Reincarnate game
  const handleResetGame = () => {
    sound.playGong();
    setStats({
      merit: 1000,
      hellMoney: 5000,
      karma: 15,
      activeIncenseCount: 0,
      incenseBurnPercent: 100,
      incenseQuality: 'normal',
      ancestralSatisfaction: 30,
      heavenlyFavor: 20,
      gamesPlayed: 0,
      totalMeritGained: 1000
    });
    setSelectedRitualId(null);
    setLogs([
      {
        id: 'reset-1',
        text: '☯️ 兵解成功，你的靈魂洗盡鉛華，再度投胎凡塵，因果重置。',
        timestamp: '吉時',
        type: 'divine'
      }
    ]);
  };

  const filteredRituals = RITUALS_DATA.filter(r => {
    if (selectedCategory === 'all') return true;
    return r.category === selectedCategory;
  });

  const renderActiveRitual = () => {
    if (!selectedRitualId) return null;

    const props = {
      merit: stats.merit,
      hellMoney: stats.hellMoney,
      karma: stats.karma,
      activeIncenseCount: stats.activeIncenseCount,
      onUpdateResources: handleUpdateResources,
      onLog: addLog,
      onResetGame: handleResetGame
    };

    switch (selectedRitualId) {
      case 'fortune_stick_21':
        return <FortuneStick21 {...props} />;
      case 'deities_demons':
        return <DeitiesDemons {...props} />;
      case 'underworld_hold_em':
        return <UnderworldHoldEm {...props} />;
      case 'divination_blocks':
        return <DivinationBlocks {...props} />;
      case 'pagoda_of_hell':
        return <PagodaOfHell {...props} />;
      case 'tomb_sweeper':
        return <TombSweeper {...props} />;
      case 'burning_joss_paper':
        return <BurningJossPaper {...props} />;
      case 'reincarnation_wheel':
        return <ReincarnationWheel {...props} />;
      case 'donation_box_drop':
        return <DonationBoxDrop {...props} />;
      case 'constellation_keno':
        return <ConstellationKeno {...props} />;
      case 'crossing_styx':
        return <CrossingTheRiverStyx {...props} />;
      case 'mandala_wheel':
        return <MandalaWheel {...props} />;
      case 'aura_wheel':
        return <AuraWheel {...props} />;
      case 'fruit_offering_slots':
        return <FruitOfferingSlots {...props} />;
      case 'paper_horse_race':
        return <PaperHorseRace {...props} />;
      case 'yin_yang_dial':
        return <YinYangDial {...props} />;
      case 'ultimate_divination':
        return <UltimateDivination {...props} />;
      default:
        return <div className="text-center text-zinc-500 py-8">未知的神祕殿宇。</div>;
    }
  };

  const lastRitualLog = logs.find(l => 
    l.text.includes('聖筊') || 
    l.text.includes('哭筊') || 
    l.text.includes('輪迴') || 
    l.text.includes('天罰') || 
    l.text.includes('點燃') || 
    l.text.includes('燃盡') || 
    l.text.includes('天意')
  );
  
  let lastResultStr = '聖筊';
  let lastResultDesc = '神恩浩蕩，求得聖筊';
  let lastResultColor = 'text-black';
  let progressVal = stats.ancestralSatisfaction; 

  if (lastRitualLog) {
    if (lastRitualLog.text.includes('哭筊') || lastRitualLog.text.includes('天罰') || lastRitualLog.text.includes('❌')) {
      lastResultStr = '哭筊';
      lastResultDesc = '神明震怒，所求不允';
      lastResultColor = 'text-red-600';
    } else if (lastRitualLog.text.includes('聖筊') || lastRitualLog.text.includes('輪迴') || lastRitualLog.text.includes('🕯️') || lastRitualLog.text.includes('點燃')) {
      lastResultStr = '聖筊';
      lastResultDesc = '神恩浩蕩，求得聖筊';
      lastResultColor = 'text-zinc-950';
    } else {
      lastResultStr = '天啓';
      lastResultDesc = '天機顯化，得聞道音';
      lastResultColor = 'text-zinc-800';
    }
  }

  const getKarmicTier = () => {
    if (stats.karma === 0) return '大羅金仙';
    if (stats.karma < 10) return '天界神侍';
    if (stats.karma < 25) return '凡塵之軀';
    if (stats.karma < 40) return '餓鬼道眾生';
    return '無間地獄';
  };

  const getSinLevel = () => {
    if (stats.karma < 10) return '微薄';
    if (stats.karma < 25) return '深重';
    return '萬劫不復';
  };

  const getMultiplier = () => {
    const mult = (1 + stats.activeIncenseCount * 0.15).toFixed(2);
    return `${mult}x`;
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col selection:bg-zinc-900 selection:text-white lg:border-4 lg:border-black">
      
      {/* 0. INTRODUCTION CARD OVERLAY */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-xl w-full bg-white border-2 border-black rounded-3xl p-8 md:p-12 shadow-[8px_8px_0px_0px_#000000] text-center space-y-8 relative overflow-hidden"
            >
              {/* Retro Ticket Borders */}
              <div className="absolute top-4 left-4 right-4 flex justify-between text-[8px] font-mono tracking-[0.2em] text-zinc-400 select-none">
                <span>鴨旅葉行 v1.0</span>
                <span>TAOIST CYBERNETICS</span>
              </div>

              <div className="pt-4 space-y-3">
                <span className="inline-block text-[10px] font-mono font-bold tracking-[0.3em] bg-black text-white px-3 py-1.5 uppercase rounded-full">
                  三界因果監控
                </span>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight font-serif text-black pt-1 leading-tight">
                  電子上香模擬器
                </h1>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">
                  Virtual Sacrificial Karma System
                </p>
              </div>

              <div className="w-16 h-0.5 bg-black mx-auto" />

              <p className="text-sm text-zinc-700 font-serif leading-relaxed text-left max-w-md mx-auto indent-8">
                世人汲汲營營於功名利祿，卻不知因果業障早已暗中標注代價。
                本虛擬道場採用最新「天道網格」與「賽博業障鏈」，為修行者開啟十七重玄妙修行殿堂。
                於凡塵中輕叩木魚積累福報，虔敬上香溝通十方神佛。
                
                請謹記：因果無常，切忌貪心。唯有洗淨業債，功德圓滿，方可在「終極天命擲筊」中一舉飛升，與天地同壽。
              </p>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowIntro(false);
                    sound.playBell();
                  }}
                  className="w-full py-4 bg-black text-white hover:bg-zinc-900 text-sm font-bold tracking-[0.2em] font-serif rounded-2xl transition-all shadow-[4px_4px_0px_0px_#52525b] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:scale-[0.98] cursor-pointer border-2 border-black"
                >
                  ☯️ 步入殿堂 · 開始修行
                </button>
              </div>

              <div className="text-[9px] text-zinc-400 font-mono flex justify-center gap-4 select-none">
                <span>天道：高精度網格</span>
                <span>•</span>
                <span>心神：完美契合</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP HEADER - Pristine High Contrast Grid Banner */}
      <header className="border-b-2 border-black bg-white sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row justify-between items-center md:items-end gap-4 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-black bg-black text-white flex items-center justify-center font-bold text-2xl font-serif rounded-xl shadow-[3px_3px_0px_0px_#000000]">
            霊
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-black font-serif flex items-center gap-2">
              電子上香模擬器 <span className="text-[10px] not-italic font-mono font-bold text-white bg-black px-2 py-0.5 rounded shadow-sm">v1.0</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono mt-0.5">孤注一擲，叩問天意；超度先祖，功德無量。</p>
          </div>
        </div>

        {/* Real-time statistics readout in Bento style layout */}
        <div className="flex flex-wrap gap-4 md:gap-8 items-center bg-white border-2 border-black px-6 py-2.5 rounded-2xl shadow-[3px_3px_0px_0px_#000000]">
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-zinc-500 block">當前功德</span>
            <span className="text-2xl font-mono text-black leading-none font-black">{stats.merit.toLocaleString()}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-zinc-500 block">冥紙法力</span>
            <span className="text-2xl font-mono text-black leading-none font-black">${stats.hellMoney.toLocaleString()}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-zinc-500 block">宿世業障</span>
            <span className="text-2xl font-mono text-red-600 leading-none font-black">{stats.karma}</span>
          </div>
        </div>

        {/* Utility Controls */}
        <div className="flex gap-2">
          <button
            onClick={handleToggleSound}
            className="p-2.5 bg-white hover:bg-zinc-100 border-2 border-black text-black transition-all rounded-xl cursor-pointer shadow-[2px_2px_0px_0px_#000000] active:scale-95"
            title="開關音效"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-black" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
          </button>
          
          <button
            onClick={handleResetGame}
            className="px-4 py-2.5 bg-white hover:bg-black hover:text-white border-2 border-black text-black text-xs font-serif font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000000]"
          >
            ☠️ 強制兵解輪迴
          </button>
        </div>
      </header>

      {/* 2. MAIN APPLICATION CONTENT AREA */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SIDEBAR: INCENSE BURNER & WOOD BLOCK */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* A. INCENSE BURNER DISPLAY */}
          <div className="bg-white border-2 border-black p-6 rounded-3xl shadow-[4px_4px_0px_0px_#000000] flex flex-col">
            <h3 className="text-black text-sm font-black mb-4 border-l-4 border-black pl-2.5 font-serif flex items-center gap-2">
              <Flame className="w-4 h-4 text-black" /> 淨土電子香爐
            </h3>

            {/* Incense Burner Bowl Visualization */}
            <div className="bg-zinc-50 border-2 border-black p-6 rounded-2xl flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden">
              
              {/* Incense smoke particles */}
              {stats.activeIncenseCount > 0 && (
                <div className="absolute top-4 flex gap-8 justify-center">
                  {Array.from({ length: stats.activeIncenseCount }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-1.5 h-12 bg-gradient-to-t from-zinc-500 to-transparent rounded-full smoke-particle"
                      style={{ animationDelay: `${idx * 0.5}s` }}
                    />
                  ))}
                </div>
              )}

              {/* Incense Sticks */}
              <div className="flex gap-4 items-end min-h-[60px] mb-2 z-10">
                {stats.activeIncenseCount > 0 ? (
                  Array.from({ length: stats.activeIncenseCount }).map((_, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div
                        style={{ height: `${stats.incenseBurnPercent * 0.4}px` }}
                        className={`w-1 rounded-t-full transition-all duration-1000 ${
                          stats.incenseQuality === 'cyber'
                            ? 'bg-gradient-to-b from-black via-zinc-500 to-zinc-200'
                            : stats.incenseQuality === 'sandalwood'
                            ? 'bg-gradient-to-b from-zinc-900 via-zinc-400 to-zinc-200'
                            : 'bg-gradient-to-b from-zinc-800 via-zinc-400 to-zinc-100'
                        }`}
                      />
                      <div className="w-1 h-8 bg-zinc-900 rounded-b" />
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-zinc-400 font-serif">香火冷清。請供奉清香以溝通天界。</span>
                )}
              </div>

              {/* Incense Bowl Base */}
              <div className="w-32 h-6 bg-black rounded-lg border-2 border-black flex items-center justify-center relative shadow-[2px_2px_0px_0px_#000000]">
                <span className="text-[9px] font-mono font-bold text-white tracking-widest">鴨旅葉行</span>
              </div>
            </div>

            {/* Offer sticks buttons */}
            <div className="mt-4 space-y-2">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block font-bold">選購香火 · 虔誠上供</span>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleOfferIncense('normal')}
                  className="p-2.5 bg-white hover:bg-zinc-50 border-2 border-black rounded-xl text-[10px] font-mono text-center flex flex-col justify-between cursor-pointer transition-all active:scale-95"
                >
                  <span className="text-zinc-900 font-bold">凡塵清香</span>
                  <span className="text-black font-black mt-1.5">$100</span>
                </button>
                <button
                  onClick={() => handleOfferIncense('sandalwood')}
                  className="p-2.5 bg-white hover:bg-zinc-50 border-2 border-black rounded-xl text-[10px] font-mono text-center flex flex-col justify-between cursor-pointer transition-all active:scale-95"
                >
                  <span className="text-zinc-900 font-bold">上品檀香</span>
                  <span className="text-black font-black mt-1.5">$300</span>
                </button>
                <button
                  onClick={() => handleOfferIncense('cyber')}
                  className="p-2.5 bg-black text-white hover:bg-zinc-900 border-2 border-black rounded-xl text-[10px] font-mono text-center flex flex-col justify-between cursor-pointer transition-all active:scale-95"
                >
                  <span className="text-white font-bold">至尊霓虹香</span>
                  <span className="text-zinc-300 font-black mt-1.5">$1k</span>
                </button>
              </div>
            </div>
          </div>

          {/* B. CYBER WOOD BLOCK CLICKER */}
          <div className="bg-white border-2 border-black p-6 rounded-3xl shadow-[4px_4px_0px_0px_#000000] flex flex-col text-center">
            <h3 className="text-black text-sm font-black mb-3 border-l-4 border-black pl-2.5 font-serif text-left flex items-center gap-2">
              💮 賽博玄門木魚
            </h3>
            <p className="text-xs text-zinc-500 text-left mb-4 leading-relaxed font-serif">
              若因果虧空、功德破產，可手動敲擊木魚。一擊功德+1，神明帳本實時登錄。
            </p>

            <button
              onClick={handleTapWoodBlock}
              className="relative w-full h-28 bg-zinc-50 border-2 border-black hover:bg-zinc-100 rounded-2xl mx-auto flex items-center justify-center cursor-pointer transition-all active:scale-95 outline-none overflow-hidden group shadow-[2px_2px_0px_0px_#000000]"
            >
              <div className="text-5xl select-none filter drop-shadow-sm group-hover:scale-110 transition-transform">
                🪵🐟
              </div>

              {/* Floating merits */}
              {floatingMerits.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ y: item.y - 10, x: item.x, opacity: 1, scale: 1 }}
                  animate={{ y: item.y - 100, opacity: 0, scale: 1.3 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute pointer-events-none font-mono font-black text-sm text-black"
                >
                  功德 +1
                </motion.div>
              ))}
            </button>
            
            <div className="mt-3 text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold">
              虔誠敲擊 · 積累福報
            </div>
          </div>

          {/* C. EVENT LOGS */}
          <div className="bg-white border-2 border-black p-6 rounded-3xl shadow-[4px_4px_0px_0px_#000000] flex flex-col">
            <h3 className="text-black text-sm font-black mb-4 border-l-4 border-black pl-2.5 font-serif flex justify-between items-center">
              <span>📜 三界因果功德帳本</span>
              <span className="text-[10px] text-zinc-400 font-mono">上限 40 條</span>
            </h3>
            <div className="h-64 overflow-y-auto space-y-2.5 font-mono text-xs pr-2 scrollbar-thin">
              <AnimatePresence>
                {logs.map((log) => (
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    key={log.id}
                    className={`p-3 border-2 leading-relaxed rounded-xl ${
                      log.type === 'success'
                        ? 'bg-zinc-50 border-black text-black font-bold'
                        : log.type === 'warn'
                        ? 'bg-zinc-50 border-zinc-400 text-zinc-700'
                        : log.type === 'error'
                        ? 'bg-red-50 border-red-600 text-red-700 font-bold'
                        : log.type === 'divine'
                        ? 'bg-black border-black text-white font-bold'
                        : 'bg-white border-zinc-200 text-zinc-600'
                    }`}
                  >
                    <div className="flex justify-between text-[8px] opacity-60 mb-1 font-mono font-bold">
                      <span>{log.type.toUpperCase()} STATUS</span>
                      <span>{log.timestamp}</span>
                    </div>
                    {log.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </aside>

        {/* MAIN VIEWPORT: ALTAR MAP OR ACTIVE RITUAL */}
        <main className="lg:col-span-8 space-y-6">
          
          {selectedRitualId ? (
            /* ACTIVE RITUAL CHAMBER */
            <div className="space-y-4">
              <button
                onClick={() => { setSelectedRitualId(null); sound.playUiClick(); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-black hover:text-white text-black text-xs font-serif font-bold rounded-xl border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000000] active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" /> ← 告退，返回大雄寶殿
              </button>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-black p-6 rounded-3xl shadow-[6px_6px_0px_0px_#000000]"
              >
                {renderActiveRitual()}
              </motion.div>
            </div>
          ) : (
            /* ALTAR MAP GRID (THE 17 RITUALS) */
            <div className="space-y-6">
              
              {/* Bento Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Last Sacrifice Status */}
                <div className="md:col-span-1 bg-white p-5 border-2 border-black rounded-3xl shadow-[3px_3px_0px_0px_#000000] flex flex-col justify-between">
                  <div className="text-[10px] uppercase font-bold text-zinc-500 font-mono">天意卦象</div>
                  <div className="flex items-end gap-2 my-2.5">
                    <div className={`text-3xl font-serif font-black ${lastResultColor}`}>{lastResultStr}</div>
                    <div className="text-[9px] mb-1 text-zinc-500 font-serif leading-tight">{lastResultDesc}</div>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                    <div 
                      className="h-full bg-black transition-all duration-500" 
                      style={{ width: `${Math.min(100, Math.max(10, progressVal))}%` }}
                    />
                  </div>
                </div>

                {/* Karmic Tier, Sin Level, Multiplier */}
                <div className="md:col-span-2 bg-white p-5 border-2 border-black rounded-3xl shadow-[3px_3px_0px_0px_#000000] flex flex-row items-center justify-around gap-2 text-center">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-500 font-mono">宿世果位</div>
                    <div className="text-xs font-black uppercase tracking-wider text-black mt-1.5 font-serif">{getKarmicTier()}</div>
                  </div>
                  <div className="h-10 w-0.5 bg-zinc-200" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-500 font-mono">因果孽障</div>
                    <div className="text-xs font-black mt-1.5 font-serif text-zinc-900">{getSinLevel()}</div>
                  </div>
                  <div className="h-10 w-0.5 bg-zinc-200" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-500 font-mono">香火倍率</div>
                    <div className="text-xs font-mono font-bold mt-1.5 text-black">{getMultiplier()}</div>
                  </div>
                </div>

                {/* Instant Offer Button */}
                <div className="md:col-span-1 bg-black p-0.5 rounded-3xl flex flex-col overflow-hidden shadow-[3px_3px_0px_0px_#000000] transition-transform hover:scale-[1.02]">
                  <button
                    onClick={() => handleOfferIncense('cyber')}
                    className="flex-1 bg-white text-black hover:bg-black hover:text-white text-xs font-bold uppercase tracking-wider transition-colors py-4 px-2 font-serif cursor-pointer border border-transparent"
                  >
                    ⚡ 至尊上香 (-$1k)
                  </button>
                </div>
              </div>

              {/* Category Filter Controls */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 border-2 border-black rounded-3xl shadow-[3px_3px_0px_0px_#000000]">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-black" />
                  <span className="text-xs font-serif font-bold text-black uppercase tracking-wider">參拜法會殿宇：</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: '全部祭祀' },
                    { id: 'skill', label: '天意對決 (智)' },
                    { id: 'exploitable', label: '智慧清明 (巧)' },
                    { id: 'hybrid', label: '修為福地 (衡)' },
                    { id: 'luck', label: '天命造化 (運)' },
                    { id: 'finale', label: '生死大結局 (劫)' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); sound.playUiClick(); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-serif transition-all border-2 cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-black border-black text-white font-bold shadow-sm'
                          : 'bg-white border-zinc-200 text-zinc-600 hover:border-black hover:text-black'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rituals Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRituals.map((r) => {
                  const isFinale = r.category === 'finale';

                  let borderStyle = 'border-2 border-black';
                  let tagStyle = 'text-zinc-700 border-zinc-300 bg-zinc-50';
                  
                  if (isFinale) {
                    borderStyle = 'border-4 border-black bg-zinc-50 shadow-[6px_6px_0px_0px_#000000]';
                    tagStyle = 'text-white border-black bg-black font-bold';
                  }

                  return (
                    <motion.div
                      whileHover={{ scale: 1.015, translateY: -2 }}
                      key={r.id}
                      className={`p-6 rounded-3xl bg-white flex flex-col justify-between min-h-[190px] relative transition-all shadow-[4px_4px_0px_0px_#000000] ${borderStyle}`}
                    >
                      {/* Cost Banner */}
                      <div className="flex justify-between items-start">
                        <span className={`text-[8px] font-mono uppercase px-2 py-0.5 border rounded-lg font-bold ${tagStyle}`}>
                          {r.category.toUpperCase()} RITUAL
                        </span>
                        
                        <div className="text-[10px] font-mono text-zinc-500 font-bold">
                          需供奉: <span className="text-black font-bold">{r.baseCost.toLocaleString()}</span> {r.costType === 'merit' ? '功德' : '冥紙'}
                        </div>
                      </div>

                      {/* Title & Lore */}
                      <div className="my-4">
                        <h4 className="text-base font-black font-serif text-black hover:text-zinc-700 transition-colors tracking-tight">
                          {r.name}
                        </h4>
                        <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed font-serif">
                          {r.description}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-200">
                        <div className="flex gap-4 text-[9px] font-mono text-zinc-400 font-bold">
                          <span>天譴: {r.risk}</span>
                          <span>心神: {r.difficulty}</span>
                        </div>

                        <button
                          onClick={() => { setSelectedRitualId(r.id); sound.playUiClick(); }}
                          className={`px-4 py-1.5 rounded-xl text-xs font-serif font-bold transition-all border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_#000000] active:scale-95 ${
                            isFinale
                              ? 'bg-black text-white hover:bg-zinc-900 shadow-none translate-x-[2px] translate-y-[2px]'
                              : 'bg-white text-black hover:bg-zinc-50'
                          }`}
                        >
                          {isFinale ? '⚡ 直面天命' : '🏮 入殿求神'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 3. FOOTER */}
      <footer className="flex justify-between items-center text-[9px] uppercase tracking-[0.2em] opacity-50 border-t border-zinc-200 pt-4 pb-4 px-6 mt-12 font-mono select-none">
        <span>鴨旅葉行</span>
        <span>LEVEL A SHIELD SHRINERY</span>
        <span>KARMA INTELLIGENCE AGENT</span>
      </footer>
    </div>
  );
}
