export type RitualCategory = 'skill' | 'exploitable' | 'hybrid' | 'luck' | 'finale';

export interface GameLog {
  id: string;
  text: string;
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'divine';
}

export interface PlayerStats {
  merit: number;      // 功德 (Main Currency 1)
  hellMoney: number;  // 冥紙 (Main Currency 2)
  karma: number;      // 業障 (Risk/Bad luck metric, higher karma lowers win chance or makes things harder)
  activeIncenseCount: number; // 0 to 3, active incense sticks burning
  incenseBurnPercent: number; // 0 to 100%
  incenseQuality: 'normal' | 'sandalwood' | 'cyber' | 'immortal'; // Types of incense offering
  ancestralSatisfaction: number; // 0 to 100%
  heavenlyFavor: number; // 0 to 100%
  gamesPlayed: number;
  totalMeritGained: number;
}

export interface Ritual {
  id: string;
  name: string;
  englishName: string;
  category: RitualCategory;
  description: string;
  detailedDescription: string;
  costType: 'merit' | 'hellMoney' | 'both';
  baseCost: number;
  risk: 'Low' | 'Medium' | 'High' | 'Catastrophic' | 'Divine';
  difficulty: string;
}

export const RITUALS_DATA: Ritual[] = [
  // Skill-Adjacent
  {
    id: 'fortune_stick_21',
    name: '天機神籤廿一 (Fortune Stick 21)',
    englishName: 'Fortune Stick 21',
    category: 'skill',
    description: '竹籤定天命。精準抽籤累積靈數至21點，切忌貪婪，否則將觸發神明之怒（爆牌天罰）。',
    detailedDescription: '求取靈驗的竹籤，每支竹籤皆蘊含不同的精神重量。你的目標是精準達到21點。若求取過多，籤筒碎裂，將釋放神明之怒（爆牌天罰）。經典廿一點玩法的神聖幽默演繹。',
    costType: 'merit',
    baseCost: 100,
    risk: 'Medium',
    difficulty: 'Refined Skill'
  },
  {
    id: 'deities_demons',
    name: '太極神魔天平 (Deities vs. Demons)',
    englishName: 'Deities vs. Demons',
    category: 'skill',
    description: '預測諸神與群魔哪一方能達到極致之「九」。古老百家樂天規，押注宇宙和諧者可得天啟。',
    detailedDescription: '預測神界天兵（神明）與九幽厲鬼（妖魔）誰能在這場宇宙拔河中勝出。點數總和最接近 9 的一方獲勝。你亦可押注於宇宙虛無（和局）。',
    costType: 'hellMoney',
    baseCost: 500,
    risk: 'Medium',
    difficulty: 'Analytical'
  },
  {
    id: 'underworld_hold_em',
    name: '九幽煉獄梭哈 (Underworld Hold \'Em)',
    englishName: 'Underworld Hold \'Em',
    category: 'skill',
    description: '自四張五行符籙中拼湊出最強神祕咒印，抽取終極契約，以符文品階奪取豐厚冥紙。',
    detailedDescription: '你將被授予四張天命符籙（代表五行、孤魂、仙真與封印）。丟棄並重新抽牌，以拼湊出最強咒術組合。回報取決於你的法陣契合品階。',
    costType: 'merit',
    baseCost: 200,
    risk: 'High',
    difficulty: 'Strategic'
  },
  {
    id: 'divination_blocks',
    name: '玄門街頭擲筊 (Divination Blocks)',
    englishName: 'Divination Blocks',
    category: 'skill',
    description: '手握紅木月牙筊杯，叩問天意。連擲聖筊積攢無上功德，切記在笑筊降臨時收手！',
    detailedDescription: '虔誠擲出紅色半月形筊杯。擲出「聖筊」（一平一凸）可積累高額獎勵並維持連勝。若擲出「哭筊」則連勝中斷。而神秘的「笑筊」若應對不當，則會吞噬你當前的全部賭注！',
    costType: 'merit',
    baseCost: 150,
    risk: 'Medium',
    difficulty: 'Calculated Risk'
  },

  // Exploitable
  {
    id: 'pagoda_of_hell',
    name: '十八層幽冥煉獄塔 (Pagoda of Hell)',
    englishName: 'Pagoda of Hell',
    category: 'exploitable',
    description: '攀登地獄之塔，每層皆有三座封印神龕。避開惡魔之眼，尋找淨世青蓮，倍率無限翻倍。',
    detailedDescription: '勇闖十八層幽冥深淵。在每一層中，從三個神聖神龕中選擇其一。其中一個隱藏著致命的詛咒（惡魔之眼），另外兩個則是安全台階。每一步成功攀登都將使功德倍率呈指數級暴增。隨時提現，或者拿命去搏！',
    costType: 'merit',
    baseCost: 100,
    risk: 'High',
    difficulty: 'Memory & Nerve'
  },
  {
    id: 'tomb_sweeper',
    name: '清明荒野掃墓 (Tomb Sweeper)',
    englishName: 'Tomb Sweeper',
    category: 'exploitable',
    description: '於清明煙雨之中清理孤魂野鬼。自訂百鬼出沒之密度，精密挖掘地盤，見好就收，切勿驚動厲鬼！',
    detailedDescription: '這是一場自訂風險的掃墓排雷行動。選擇你的荒野墓園尺寸與惡鬼數量。清理每個乾淨的墓穴皆能獲贈冥紙。一旦觸怒沉睡的厲鬼，你的供奉物將化為灰燼！在氣氛變得太過詭異前隨時撤離！',
    costType: 'hellMoney',
    baseCost: 300,
    risk: 'Medium',
    difficulty: 'Logical Survival'
  },

  // Hybrid
  {
    id: 'burning_joss_paper',
    name: '金爐烈焰焚紙 (Burning Joss Paper)',
    englishName: 'Burning Joss Paper',
    category: 'hybrid',
    description: '將冥紙投入黃金祭祀爐。火焰越旺倍率越高，在罡風突起、紙灰飛散前緊急收回，否則化為烏有！',
    detailedDescription: '經典的「崩潰」遊戲。將大筆冥紙投入熊熊燃燒的黃金神爐中。隨著法力將紙錢吞噬，獎勵倍率會持續攀升。切記在狂風突襲、神火熄滅（崩潰）前將法力收回！',
    costType: 'hellMoney',
    baseCost: 500,
    risk: 'Catastrophic',
    difficulty: 'Nerves of Steel'
  },
  {
    id: 'reincarnation_wheel',
    name: '六道玄機輪迴盤 (Reincarnation Wheel)',
    englishName: 'Reincarnation Wheel',
    category: 'hybrid',
    description: '命運之輪悄然旋轉。押注天道、人道或高風險的餓鬼畜生道。六道無常，生死富貴一念之間。',
    detailedDescription: '輪迴法輪緩緩轉動！下注於六道之中：天道、阿修羅道、人道、畜生道、餓鬼道或地獄道。每一道皆有獨特的天道概率、福報賠率以及因果業力重量。',
    costType: 'merit',
    baseCost: 150,
    risk: 'Medium',
    difficulty: 'Statistical'
  },
  {
    id: 'donation_box_drop',
    name: '無量功德箱彈珠 (Donation Box Drop)',
    englishName: 'Donation Box Drop',
    category: 'hybrid',
    description: '將金幣投入玄門釘板功德箱。金幣碰撞彈跳，若直落中央靈氣香爐，即獲神明最高加持與萬倍功德！',
    detailedDescription: '充滿神聖物理碰撞的功德 Plinko。從功德箱頂端投入沉甸甸的金幣，看它在命運鋼釘之間無規則反彈。掉入中央神聖香爐可獲得神明最高祝福與海量功德暴擊！',
    costType: 'merit',
    baseCost: 100,
    risk: 'Low',
    difficulty: 'Physics-based'
  },
  {
    id: 'constellation_keno',
    name: '二十八星宿連線 (Constellation Keno)',
    englishName: 'Constellation Keno',
    category: 'hybrid',
    description: '觀星象，點選10個星空座標。大祭司將射出20道辟邪聖光，連線越多，天界賞賜越加豐厚。',
    detailedDescription: '在天體星盤上挑選最多十個星宿座標。大祭司隨後會朝夜空射出二十道神聖星光。對齊並擊中的星宿越多，能汲取的宇宙法力回報便越浩瀚。',
    costType: 'merit',
    baseCost: 100,
    risk: 'High',
    difficulty: 'Pattern-Based'
  },
  {
    id: 'crossing_styx',
    name: '魂渡奈何血河 (Crossing the River Styx)',
    englishName: 'Crossing the River Styx',
    category: 'hybrid',
    description: '引導脆弱的紙扎傀儡橫渡陰風怒號的奈何橋。避開幽冥浪濤與噬魂鯊，渡河成功即獲超凡賞賜。',
    detailedDescription: '幫助一具脆弱不堪的紙扎替身跨越波濤洶湧的奈何橋。一步一步看準時機前進，躲避漂浮的幽鬼、彼岸殘渣以及冥河惡鯊。成功登陸彼岸可得 10 倍冥紙賞賜，或者見勢不妙隨時折返回退套現。',
    costType: 'hellMoney',
    baseCost: 400,
    risk: 'High',
    difficulty: 'Timing & Rhythm'
  },

  // Pure Luck
  {
    id: 'mandala_wheel',
    name: '妙法蓮華大轉盤 (Mandala Wheel)',
    englishName: 'Mandala Wheel',
    category: 'luck',
    description: '推動銘刻無上真言的金色法輪，祈求法輪停在功德暴擊格，亦要提防突如其來的神界稅收。',
    detailedDescription: '一個繪有繁複曼陀羅法陣的金色轉盤。轉動轉盤以即時獲取功德倍率、業障洗滌，但有時也會遭遇玉皇大帝派來的神界稅務官進行突擊審計！',
    costType: 'merit',
    baseCost: 200,
    risk: 'Low',
    difficulty: 'Pure Devotion'
  },
  {
    id: 'aura_wheel',
    name: '佛光幻彩普照 (Aura Wheel)',
    englishName: 'Aura Wheel',
    category: 'luck',
    description: '預測廟宇照妖鏡上閃爍的五彩神光。翡翠綠、帝王金、血海紅、虛空紫，壓中神光者大吉大利。',
    detailedDescription: '寺廟後殿的神佛法相散發著變幻莫測的佛光。佛光會在翡翠綠、帝王金、烈焰紅與深邃紫之間閃爍。押注你的直覺，看哪一種佛光能洗滌你的凡軀。',
    costType: 'hellMoney',
    baseCost: 500,
    risk: 'Low',
    difficulty: 'Pure Faith'
  },
  {
    id: 'fruit_offering_slots',
    name: '百仙獻瑞貢品機 (Fruit Offering Slots)',
    englishName: 'Fruit Offering Slots',
    category: 'luck',
    description: '拉動神壇機關，轉動貢品法輪。配對烤乳豬、黃金蜜桃等珍稀貢品，集齊三座玉淨瓶即奪巨額大獎！',
    detailedDescription: '拉動供桌旁的純金拉桿。配對經典的祭祀貢品（美味烤乳豬、吉祥鳳梨、仙界蜜桃、富貴紅包與碧玉淨瓶）。當轉出三個碧玉淨瓶時，將觸發驚天動地的「列祖列宗累積大獎」！',
    costType: 'hellMoney',
    baseCost: 200,
    risk: 'Medium',
    difficulty: 'Pure Hope'
  },
  {
    id: 'paper_horse_race',
    name: '紙扎天馬極速賽 (Paper Horse Race)',
    englishName: 'Paper Horse Race',
    category: 'luck',
    description: '四匹精緻紙扎神駒奔馳於香灰賽道。挑選你的本命坐騎，在冥府大賽中吶喊助威、奪得頭籌！',
    detailedDescription: '供奉並資助四匹精美的紙扎神馬之一：赤兔追風、幽靈墨蹄、白玉珍珠或黃金踏雪。親眼目睹牠們在神壇的香灰跑道上展開一場驚心動魄、由天命決定的極速狂飆！',
    costType: 'hellMoney',
    baseCost: 300,
    risk: 'High',
    difficulty: 'Pure Spectator'
  },
  {
    id: 'yin_yang_dial',
    name: '陰陽八卦羅盤 (Yin-Yang Dial)',
    englishName: 'Yin-Yang Dial',
    category: 'luck',
    description: '預測古老風水羅盤指針的磁場波動。當神祕靈光湧動，猜測下一波磁場是陽極（高）還是陰極（低）。',
    detailedDescription: '古老黃銅羅盤上的太極指針在 1 到 100 的八卦方位之間瘋狂擺動。預判下一次靈能脈衝會使指針偏向極陽（高點）還是極陰（低點）。',
    costType: 'merit',
    baseCost: 100,
    risk: 'Medium',
    difficulty: 'Pure Intuit'
  },

  // Finale
  {
    id: 'ultimate_divination',
    name: '終極紫微天命擲筊 (The Ultimate Divination)',
    englishName: 'The Ultimate Divination',
    category: 'finale',
    description: '終極的天界對決。在至高無上的玉皇大帝金身前押上你的全部家當，擲出一決勝負的無上天命！',
    detailedDescription: '直面威嚴的玉皇大帝。為了徹底洗清你身上累積數十代的宿世業障，你必須押上你所有的功德與冥紙。一擲若得「聖筊」，立地成仙、功德圓滿、超脫輪迴進入無上仙界！若得「哭筊」或「笑筊」，則永劫不復，靈魂數據徹底抹除！',
    costType: 'both',
    baseCost: 1000, // Requires minimum merit/hellMoney or takes everything
    risk: 'Divine',
    difficulty: 'Ultimate Fate'
  }
];
