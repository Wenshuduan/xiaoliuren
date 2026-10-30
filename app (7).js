/* 自动生成，请勿手改：node tools/build_pwa.mjs */
(function () {
"use strict";
var __modules = {};
function __define(name, factory) {
  __modules[name] = { factory: factory, module: { exports: {} }, loaded: false };
}
function require(name) {
  var m = __modules[name];
  if (!m) throw new Error("Cannot find module: " + name);
  if (!m.loaded) {
    m.loaded = true;
    m.factory(m.module, m.module.exports, require);
  }
  return m.module.exports;
}
__define("lunar-data", function (module, exports, require) {
// 农历数据表：1900-2100 年，每年一个整数，含义见 lunar.js 注释。
// 由 tools/gen_lunar_data.py 生成，请勿手工修改。
module.exports = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a4d0, 0x0d150, 0x0f252,
  0x0d520,
];

});
__define("lunar", function (module, exports, require) {
/**
 * 农历换算（1900-01-31 ~ 2100-12-31）。
 *
 * 数据表 LUNAR_INFO 每年一个 17 位整数：
 *   0x8000 ~ 0x10  : 十二个月的大小月（1 为大月 30 天）
 *   0xF            : 闰月月份，0 表示无闰月
 *   0x10000        : 闰月大小（1 为大月 30 天）
 */
const LUNAR_INFO = require('lunar-data');

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;
const BASE_UTC = Date.UTC(1900, 0, 31); // 农历 1900 年正月初一
const DAY_MS = 24 * 60 * 60 * 1000;

const MONTH_NAMES = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
const NUMERALS = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
const WEEK = ['日', '一', '二', '三', '四', '五', '六'];

function leapMonth(year) {
  return LUNAR_INFO[year - MIN_YEAR] & 0xf;
}

function leapDays(year) {
  if (!leapMonth(year)) return 0;
  return LUNAR_INFO[year - MIN_YEAR] & 0x10000 ? 30 : 29;
}

function monthDays(year, month) {
  return LUNAR_INFO[year - MIN_YEAR] & (0x10000 >> month) ? 30 : 29;
}

function yearDays(year) {
  let sum = 348;
  for (let mask = 0x8000; mask > 0x8; mask >>= 1) {
    if (LUNAR_INFO[year - MIN_YEAR] & mask) sum += 1;
  }
  return sum + leapDays(year);
}

/** 一年的月份序列（含闰月），长度 12 或 13。 */
function monthsOfYear(year) {
  const leap = leapMonth(year);
  const list = [];
  for (let m = 1; m <= 12; m += 1) {
    list.push({ month: m, days: monthDays(year, m), isLeap: false });
    if (leap === m) {
      list.push({ month: m, days: leapDays(year), isLeap: true });
    }
  }
  return list;
}

function ganZhiOfYear(year) {
  return GAN[(year - 4) % 10] + ZHI[(year - 4) % 12];
}

function zodiacOfYear(year) {
  return ZODIAC[(year - 4) % 12];
}

function lunarMonthName(month, isLeap) {
  return (isLeap ? '闰' : '') + MONTH_NAMES[month - 1] + '月';
}

function lunarDayName(day) {
  if (day === 10) return '初十';
  if (day === 20) return '二十';
  if (day === 30) return '三十';
  const tens = Math.floor(day / 10);
  const unit = day % 10;
  if (tens === 0) return '初' + NUMERALS[unit];
  if (tens === 1) return '十' + NUMERALS[unit];
  return '廿' + NUMERALS[unit];
}

/**
 * 公历转农历。
 * @returns {{year:number, month:number, day:number, isLeap:boolean,
 *            yearGanZhi:string, zodiac:string, monthName:string, dayName:string}}
 */
function solarToLunar(year, month, day) {
  const utc = Date.UTC(year, month - 1, day);
  let offset = Math.floor((utc - BASE_UTC) / DAY_MS);

  if (offset < 0 || year < MIN_YEAR || year > MAX_YEAR) {
    throw new Error('日期超出 1900-2100 年范围');
  }

  let lunarYear = MIN_YEAR;
  while (lunarYear <= MAX_YEAR) {
    const span = yearDays(lunarYear);
    if (offset < span) break;
    offset -= span;
    lunarYear += 1;
  }
  if (lunarYear > MAX_YEAR) throw new Error('日期超出 1900-2100 年范围');

  const months = monthsOfYear(lunarYear);
  let cursor = 0;
  for (let i = 0; i < months.length; i += 1) {
    if (offset < cursor + months[i].days) {
      const item = months[i];
      return {
        year: lunarYear,
        month: item.month,
        day: offset - cursor + 1,
        isLeap: item.isLeap,
        yearGanZhi: ganZhiOfYear(lunarYear),
        zodiac: zodiacOfYear(lunarYear),
        monthName: lunarMonthName(item.month, item.isLeap),
        dayName: lunarDayName(offset - cursor + 1),
      };
    }
    cursor += months[i].days;
  }
  throw new Error('农历换算失败');
}

function pad2(n) {
  return n < 10 ? '0' + n : String(n);
}

/** 0=子时 ... 11=亥时 */
function shichenIndexOfHour(hour) {
  return Math.floor(((hour + 1) % 24) / 2);
}

function shichenOfHour(hour) {
  const index = shichenIndexOfHour(hour);
  const start = (index * 2 + 23) % 24;
  const end = (start + 1) % 24;
  return {
    index,
    zhi: ZHI[index],
    name: ZHI[index] + '时',
    range: pad2(start) + ':00-' + pad2(end) + ':59',
  };
}

function shichenOfDate(date) {
  return shichenOfHour(date.getHours());
}

function formatSolar(date) {
  return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
}

function formatWeek(date) {
  return '星期' + WEEK[date.getDay()];
}

module.exports = {
  MIN_YEAR,
  MAX_YEAR,
  GAN,
  ZHI,
  ZODIAC,
  leapMonth,
  leapDays,
  monthDays,
  yearDays,
  monthsOfYear,
  solarToLunar,
  ganZhiOfYear,
  zodiacOfYear,
  lunarMonthName,
  lunarDayName,
  shichenIndexOfHour,
  shichenOfHour,
  shichenOfDate,
  formatSolar,
  formatWeek,
  pad2,
};

});
__define("liuren", function (module, exports, require) {
/**
 * 小六壬：六宫数据与起课推算。
 *
 * 起课法：大安起正月，顺数至月；月上起初一，顺数至日；日上起子时，顺数至时。
 * 六宫次序固定：大安 → 留连 → 速喜 → 赤口 → 小吉 → 空亡。
 */
const lunar = require('lunar');

const PALACES = [
  {
    index: 0,
    name: '大安',
    luck: '吉',
    luckClass: 'good',
    element: '木',
    direction: '东方',
    color: '青',
    god: '青龙',
    numbers: '一、五、七',
    keyword: '静守 · 安稳',
    summary: '身不动，心安则吉。谋事宜静守，缓图可成。',
    verse: [
      '大安事事昌，求财在坤方。',
      '失物去不远，宅舍保安康。',
      '行人身未动，病者主无妨。',
      '将军回田野，仔细好推详。',
    ],
    readings: [
      { label: '财运', text: '财在近处，宜守不宜贪；向西南（坤方）求财多得，忌冒进。' },
      { label: '感情', text: '安稳之象，旧缘可续；不宜急进，顺其自然反成。' },
      { label: '事业', text: '岗位安稳，宜守成；变动之事宜缓，待时而动。' },
      { label: '出行', text: '行人身未动，出行可缓；已在途中者平安。' },
      { label: '健康', text: '病者无妨，调养可愈；留意肝胆、筋骨。' },
      { label: '失物', text: '失物未远，多在原处或近处，静心回想可寻。' },
      { label: '官非', text: '官事宜和不宜争，和解为上，退一步得安。' },
      { label: '考试', text: '发挥平稳如常，按部就班，勿求侥幸。' },
    ],
  },
  {
    index: 1,
    name: '留连',
    luck: '凶',
    luckClass: 'bad',
    element: '水',
    direction: '北方',
    color: '黑',
    god: '玄武',
    numbers: '二、八、十',
    keyword: '迟滞 · 纠缠',
    summary: '事难成，拖延纠缠。宜缓图，忌强求。',
    verse: [
      '留连事难成，求谋日未明。',
      '官事只宜缓，去者来回程。',
      '失物南方见，急讨方遂心。',
      '更需防口舌，人事且平平。',
    ],
    readings: [
      { label: '财运', text: '求财迟滞，账目易拖；勿借贷担保，防久拖成空。' },
      { label: '感情', text: '关系暧昧不明，易生猜疑；宜坦诚，忌拖延消耗。' },
      { label: '事业', text: '进展缓慢，文书易返工；守旧待时，勿仓促跳槽。' },
      { label: '出行', text: '行程易延，行人未归；出行多做预案。' },
      { label: '健康', text: '病势缠绵，宜早调理；注意肾、泌尿与睡眠。' },
      { label: '失物', text: '失物在南方，急讨方遂心；迟了易被人带走。' },
      { label: '官非', text: '官事只宜缓，勿急于争辩；缓则易解，急则生变。' },
      { label: '考试', text: '思路易乱，稳扎稳打，避免临场改答。' },
    ],
  },
  {
    index: 2,
    name: '速喜',
    luck: '吉',
    luckClass: 'good',
    element: '火',
    direction: '南方',
    color: '赤',
    god: '朱雀',
    numbers: '三、六、九',
    keyword: '迅捷 · 喜讯',
    summary: '喜讯将至，事快速而成。宜主动，贵人在南。',
    verse: [
      '速喜喜来临，求财向南行。',
      '失物申未午，逢人路上寻。',
      '官事有福德，病者无祸侵。',
      '田宅六畜吉，行人有信音。',
    ],
    readings: [
      { label: '财运', text: '求财向南，来得快；宜快进快出，见好就收。' },
      { label: '感情', text: '有喜讯、有相遇；宜主动表达，成在近日。' },
      { label: '事业', text: '机会来得快，宜把握；文书、消息多有利。' },
      { label: '出行', text: '行人即至，出行顺利；临时起意亦可成行。' },
      { label: '健康', text: '病者无祸，速愈；留意心火、口舌上火。' },
      { label: '失物', text: '失物在南方或近火处，急寻可得。' },
      { label: '官非', text: '官事有福德，宜速处理，拖则生变。' },
      { label: '考试', text: '临场发挥顺畅，有喜；答题宜果断。' },
    ],
  },
  {
    index: 3,
    name: '赤口',
    luck: '凶',
    luckClass: 'bad',
    element: '金',
    direction: '西方',
    color: '白',
    god: '白虎',
    numbers: '四、七、十',
    keyword: '口舌 · 惊险',
    summary: '口舌是非，惊恐凶险。宜慎言，忌争强。',
    verse: [
      '赤口主口舌，官非切要防。',
      '失物急去寻，行人有惊慌。',
      '鸡犬多作怪，病者出西方。',
      '更须防咀咒，恐怕染瘟殃。',
    ],
    readings: [
      { label: '财运', text: '求财多阻，易因口舌破财；忌合伙争执。' },
      { label: '感情', text: '易起争吵，言语伤人；先冷静，再沟通。' },
      { label: '事业', text: '人事不和，易招非议；谨言慎行，少掺和。' },
      { label: '出行', text: '行人有惊慌，出行防意外；宜结伴、宜缓行。' },
      { label: '健康', text: '病从西方来，防外伤与呼吸道；及早就医。' },
      { label: '失物', text: '失物急去寻，迟则难回；当心遭窃。' },
      { label: '官非', text: '官非切要防，易有刑伤；能和解则和解。' },
      { label: '考试', text: '易因粗心、口误失分；答完多检查。' },
    ],
  },
  {
    index: 4,
    name: '小吉',
    luck: '吉',
    luckClass: 'good',
    element: '木',
    direction: '东方',
    color: '青',
    god: '六合',
    numbers: '一、五、七',
    keyword: '和合 · 顺遂',
    summary: '和合之象，诸事可成。宜合作，宜沟通。',
    verse: [
      '小吉最吉昌，路上好商量。',
      '阴人来报喜，失物在坤方。',
      '行人立便至，交易甚是强。',
      '凡事皆和合，病者祈上苍。',
    ],
    readings: [
      { label: '财运', text: '交易和合，求财顺遂；合作、中介得利。' },
      { label: '感情', text: '情投意合，有媒有缘；宜表白、宜见家长。' },
      { label: '事业', text: '人事和睦，协作顺利；宜谈合作、签文书。' },
      { label: '出行', text: '行人立便至，出行有伴；结伴同行更吉。' },
      { label: '健康', text: '病者渐安，宜调理脾胃；忌暴饮暴食。' },
      { label: '失物', text: '失物在西南（坤方），问人可得。' },
      { label: '官非', text: '凡事和合，宜调解；有中间人可成。' },
      { label: '考试', text: '得人相助，成绩可期；宜请教前辈。' },
    ],
  },
  {
    index: 5,
    name: '空亡',
    luck: '大凶',
    luckClass: 'worst',
    element: '土',
    direction: '中央',
    color: '黄',
    god: '勾陈',
    numbers: '三、六、九',
    keyword: '落空 · 无果',
    summary: '音信稀，事无结果。宜止宜静，另谋他图。',
    verse: [
      '空亡事不祥，阴人多乖张。',
      '求财无利益，行人有灾殃。',
      '失物寻不见，官事有刑伤。',
      '病人逢暗鬼，析解可安康。',
    ],
    readings: [
      { label: '财运', text: '求财无利，投入易空；勿轻信许诺，守财为上。' },
      { label: '感情', text: '缘分虚浮，易落空；勿急于定论，多看些时日。' },
      { label: '事业', text: '计划难落地，努力易空转；宜重新评估方向。' },
      { label: '出行', text: '行人音信稀，出行多阻；能改期则改期。' },
      { label: '健康', text: '病宜早查，勿拖；注意脾胃与情绪。' },
      { label: '失物', text: '失物寻不见，多半难回；勿再耗费心神。' },
      { label: '官非', text: '官事有刑伤，宜避讼；退让可免大损。' },
      { label: '考试', text: '易临场失常，先稳心态，莫慌。' },
    ],
  },
];

const TRACE_LABELS = [
  { key: 'month', label: '月', desc: '事之始 · 起因与环境' },
  { key: 'day', label: '日', desc: '事之中 · 过程与自身' },
  { key: 'hour', label: '时', desc: '事之终 · 结果与应期' },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function palaceAt(index) {
  const i = ((index % 6) + 6) % 6;
  return PALACES[i];
}

/** 三宫推算。month/day 为农历月日，zhiIndex 为时辰序（子=0）。 */
function cast(month, day, zhiIndex) {
  const monthIdx = (month - 1) % 6;
  const dayIdx = (monthIdx + day - 1) % 6;
  const hourIdx = (dayIdx + zhiIndex) % 6;
  return { monthIdx, dayIdx, hourIdx };
}

function makeId(ts) {
  return ts + '-' + Math.random().toString(36).slice(2, 7);
}

/**
 * 生成一节课的记录（可直接存入缓存、写入页面参数）。
 * @param {object} options
 *   mode: 'now' | 'manual'
 *   ts: 起课时间戳（now 模式）
 *   lateZi: 23 点后是否按次日子时（默认 true）
 *   month/day/zhiIndex/lunarYear: manual 模式
 */
function buildRecord(options) {
  const opts = options || {};
  const mode = opts.mode === 'manual' ? 'manual' : 'now';
  const ts = Number(opts.ts) || Date.now();
  const lateZi = opts.lateZi !== false;

  let info;
  let shichen;
  let solarText = '';
  let weekText = '';
  let clockText = '';
  let advanced = false;

  if (mode === 'manual') {
    const month = Math.min(12, Math.max(1, Number(opts.month) || 1));
    const day = Math.min(30, Math.max(1, Number(opts.day) || 1));
    const zhiIndex = ((Number(opts.zhiIndex) || 0) % 12 + 12) % 12;
    const year = Number(opts.lunarYear) || lunar.solarToLunar(
      new Date(ts).getFullYear(),
      new Date(ts).getMonth() + 1,
      new Date(ts).getDate()
    ).year;
    info = {
      year,
      month,
      day,
      isLeap: false,
      yearGanZhi: lunar.ganZhiOfYear(year),
      zodiac: lunar.zodiacOfYear(year),
      monthName: lunar.lunarMonthName(month, false),
      dayName: lunar.lunarDayName(day),
    };
    shichen = lunar.shichenOfHour((zhiIndex * 2 + 23) % 24);
    solarText = '手动择时';
  } else {
    const date = new Date(ts);
    shichen = lunar.shichenOfDate(date);
    let base = date;
    if (lateZi && date.getHours() >= 23) {
      base = new Date(ts + DAY_MS);
      advanced = true;
    }
    info = lunar.solarToLunar(base.getFullYear(), base.getMonth() + 1, base.getDate());
    solarText = lunar.formatSolar(date);
    weekText = lunar.formatWeek(date);
    clockText = lunar.pad2(date.getHours()) + ':' + lunar.pad2(date.getMinutes());
  }

  const result = cast(info.month, info.day, shichen.index);

  return {
    id: makeId(ts),
    ts,
    mode,
    lateZi: advanced,
    solarText,
    weekText,
    clockText,
    lunarText: info.yearGanZhi + '年 ' + info.monthName + info.dayName,
    lunar: info,
    shichen,
    cast: result,
    palaces: [result.monthIdx, result.dayIdx, result.hourIdx],
  };
}

/** 起课过程的动画步骤：依次落月、日、时。 */
function castSteps(record) {
  const month = record.lunar.month;
  const day = record.lunar.day;
  const zhi = record.shichen.index;
  const steps = [];
  for (let i = 0; i < month; i += 1) {
    steps.push({ palace: i % 6, phase: 'month', label: '起月' });
  }
  for (let i = 0; i < day; i += 1) {
    steps.push({ palace: (record.cast.monthIdx + i) % 6, phase: 'day', label: '起日' });
  }
  for (let i = 0; i <= zhi; i += 1) {
    steps.push({ palace: (record.cast.dayIdx + i) % 6, phase: 'hour', label: '起时' });
  }
  return steps;
}

module.exports = {
  PALACES,
  TRACE_LABELS,
  palaceAt,
  cast,
  buildRecord,
  castSteps,
};

});
__define("storage", function (module, exports, require) {
/**
 * 网页版本地存储：接口与小程序端 storage.js 保持一致。
 */
const RECORDS_KEY = 'liuren:records';
const SETTINGS_KEY = 'liuren:settings';
const LIMIT = 60;

const DEFAULT_SETTINGS = { lateZi: true };

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // 隐私模式或空间不足时静默失败
  }
}

function listRecords() {
  const list = readJson(RECORDS_KEY, []);
  return Array.isArray(list) ? list : [];
}

function addRecord(record) {
  const list = listRecords().filter((item) => item && item.id !== record.id);
  list.unshift(record);
  writeJson(RECORDS_KEY, list.slice(0, LIMIT));
  return record;
}

function getRecord(id) {
  return listRecords().filter((item) => item && item.id === id)[0] || null;
}

function removeRecord(id) {
  writeJson(
    RECORDS_KEY,
    listRecords().filter((item) => item && item.id !== id)
  );
}

function clearRecords() {
  writeJson(RECORDS_KEY, []);
}

function getSettings() {
  return Object.assign({}, DEFAULT_SETTINGS, readJson(SETTINGS_KEY, {}));
}

function saveSettings(patch) {
  const next = Object.assign({}, getSettings(), patch || {});
  writeJson(SETTINGS_KEY, next);
  return next;
}

module.exports = {
  listRecords,
  addRecord,
  getRecord,
  removeRecord,
  clearRecords,
  getSettings,
  saveSettings,
};

});
/* 小六壬 · 网页版（PWA）界面层 */
const lunar = require('lunar');
const liuren = require('liuren');
const storage = require('storage');

const PAN = 270;
const RING_R = 105;
const CHIP = 66;

const app = document.getElementById('app');
const state = { casting: false, timers: [], cleanup: null };

/* ---------- 小工具 ---------- */

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

let toastTimer = null;
function toast(message) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1900);
}

function haptic() {
  try {
    if (navigator.vibrate) navigator.vibrate(8);
  } catch (e) {
    /* iOS 不支持震动 */
  }
}

function stopTimers() {
  state.timers.forEach((t) => clearTimeout(t));
  state.timers = [];
  state.casting = false;
  if (state.cleanup) {
    state.cleanup();
    state.cleanup = null;
  }
}

/* ---------- 起课所需的时间信息 ---------- */

function nowInfo() {
  const now = new Date();
  const settings = storage.getSettings();
  const advanced = !!settings.lateZi && now.getHours() >= 23;
  const base = advanced ? new Date(now.getTime() + 86400000) : now;
  let info = null;
  try {
    info = lunar.solarToLunar(base.getFullYear(), base.getMonth() + 1, base.getDate());
  } catch (e) {
    info = null;
  }
  return { now, advanced, info, shichen: lunar.shichenOfDate(now) };
}

let nowRefresh = null;

function nowCardHtml() {
  const { now, advanced, info, shichen } = nowInfo();
  const lunarText = info
    ? info.yearGanZhi + '年 ' + info.monthName + info.dayName
    : '农历换算超出范围';
  return (
    '<div class="now-top"><span class="now-date serif">' +
    esc(lunar.formatSolar(now)) +
    '</span><span class="now-week">' +
    esc(lunar.formatWeek(now)) +
    '</span></div>' +
    '<div class="now-bottom"><span>' +
    esc(lunarText) +
    '</span><span class="now-shichen">' +
    esc(shichen.name) +
    '<em class="now-range">' +
    esc(shichen.range) +
    '</em></span></div>' +
    (advanced ? '<div class="now-note">已按晚子时进日 · 农历取次日子时</div>' : '')
  );
}

/* ---------- 壳：导航栏 / 底栏 ---------- */

function navbar(title) {
  return (
    '<header class="navbar">' +
    '<button class="nav-back" data-act="back" aria-label="返回">‹</button>' +
    '<span class="nav-title">' + esc(title) + '</span>' +
    '<span class="nav-spacer"></span>' +
    '</header>'
  );
}

function tabbar(active) {
  const items = [
    { key: 'cast', label: '起课', glyph: '卦', href: '#/cast' },
    { key: 'history', label: '记录', glyph: '录', href: '#/history' },
    { key: 'about', label: '说明', glyph: '说', href: '#/about' },
  ];
  return (
    '<nav class="tabbar">' +
    items.map((item) =>
      '<a href="' + item.href + '" class="tab' + (active === item.key ? ' active' : '') + '">' +
      '<span class="tab-glyph serif">' + item.glyph + '</span>' +
      '<span class="tab-label">' + item.label + '</span>' +
      '</a>'
    ).join('') +
    '</nav>'
  );
}

function shell(content, opts) {
  const options = opts || {};
  app.innerHTML =
    (options.nav ? navbar(options.nav.title) : '') +
    '<main class="view">' + content + '</main>' +
    (options.tab ? tabbar(options.tab) : '');
}

/* ---------- 起课页 ---------- */

function chipHtml(index) {
  const palace = liuren.PALACES[index];
  const angle = ((-90 + index * 60) * Math.PI) / 180;
  const left = PAN / 2 + RING_R * Math.cos(angle) - CHIP / 2;
  const top = PAN / 2 + RING_R * Math.sin(angle) - CHIP / 2;
  return (
    '<button class="gong" data-idx="' + index + '" style="left:' + left.toFixed(1) + 'px;top:' + top.toFixed(1) + 'px">' +
    '<span class="gong-name serif">' + palace.name + '</span>' +
    '<span class="gong-luck luck-' + palace.luckClass + '">' + palace.luck + '</span>' +
    '</button>'
  );
}

function viewCast() {
  const { advanced } = nowInfo();
  shell(
    '<section class="page">' +
      '<header class="hero">' +
        '<p class="hero-eyebrow">掌 上 起 课</p>' +
        '<h1 class="hero-title serif">小六壬</h1>' +
        '<div class="hero-rule"></div>' +
        '<p class="hero-sub">以农历月 · 日 · 时辰，落宫断事</p>' +
      '</header>' +
      '<section class="now" id="nowCard">' + nowCardHtml() + '</section>' +
      '<div class="pan" id="pan">' +
        '<span class="pan-ring ring-outer"></span>' +
        '<span class="pan-ring ring-mid"></span>' +
        '<span class="pan-ring ring-inner"></span>' +
        liuren.PALACES.map((p, i) => chipHtml(i)).join('') +
        '<div class="pan-center">' +
          '<span class="center-kicker" id="centerKicker">时课</span>' +
          '<strong class="center-name serif" id="centerName">待 起</strong>' +
          '<span class="center-sub" id="centerSub">静心 · 默念所问</span>' +
        '</div>' +
      '</div>' +
      '<div class="cast">' +
        '<button class="btn btn-solid cast-btn" id="castBtn">起 课</button>' +
        '<p class="cast-hint">轻点起课 · 默念所问之事</p>' +
      '</div>' +
      '<div class="aside"><a href="#/manual">手动择时</a><span>·</span><a href="#/history">起课记录</a></div>' +
      '<p class="footnote">传统文化 · 仅供参悟 · 不作决策依据</p>' +
    '</section>',
    { tab: 'cast' }
  );

  const chips = Array.prototype.slice.call(document.querySelectorAll('.gong'));
  chips.forEach((el) => {
    el.addEventListener('click', () => {
      const palace = liuren.PALACES[Number(el.dataset.idx)];
      toast(palace.name + ' · ' + palace.luck + ' · 属' + palace.element + palace.direction);
    });
  });

  const button = document.getElementById('castBtn');
  button.addEventListener('click', startCast);

  nowRefresh = setInterval(() => {
    const card = document.getElementById('nowCard');
    if (card) card.innerHTML = nowCardHtml();
  }, 30000);

  state.cleanup = () => {
    clearInterval(nowRefresh);
    nowRefresh = null;
  };
}

function setCenter(kicker, name, sub) {
  const k = document.getElementById('centerKicker');
  const n = document.getElementById('centerName');
  const s = document.getElementById('centerSub');
  if (k) k.textContent = kicker;
  if (n) n.textContent = name;
  if (s) s.textContent = sub;
}

function highlight(index, isResult) {
  Array.prototype.forEach.call(document.querySelectorAll('.gong'), (el) => {
    el.classList.toggle('is-active', !isResult && Number(el.dataset.idx) === index);
    el.classList.toggle('is-result', !!isResult && Number(el.dataset.idx) === index);
  });
}

function startCast() {
  if (state.casting) return;

  let record;
  try {
    record = liuren.buildRecord({
      mode: 'now',
      ts: Date.now(),
      lateZi: storage.getSettings().lateZi,
    });
  } catch (e) {
    toast('当前日期超出可推算范围');
    return;
  }

  const steps = liuren.castSteps(record);
  state.casting = true;
  state.record = record;

  const button = document.getElementById('castBtn');
  if (button) {
    button.disabled = true;
    button.textContent = '推 算 中';
  }
  setCenter('起课', '推 算', '静心 · 默念所问');

  let i = 0;
  const tick = () => {
    if (!state.casting) return;
    if (i >= steps.length) {
      finishCast(record);
      return;
    }
    const step = steps[i];
    const palace = liuren.PALACES[step.palace];
    highlight(step.palace, false);
    setCenter(step.label, palace.name, palace.luck);

    const next = steps[i + 1];
    let delay = step.phase === 'month' ? 82 : step.phase === 'day' ? 46 : 68;
    if (!next) {
      delay = 240;
    } else if (next.phase !== step.phase) {
      delay = 260;
      haptic();
    }
    i += 1;
    state.timers.push(setTimeout(tick, delay));
  };
  tick();
}

function finishCast(record) {
  state.casting = false;
  const palace = liuren.PALACES[record.cast.hourIdx];
  storage.addRecord(record);
  highlight(record.cast.hourIdx, true);
  setCenter('落宫', palace.name, palace.luck);
  haptic();

  const button = document.getElementById('castBtn');
  if (button) button.textContent = '起 课';
  state.timers.push(
    setTimeout(() => {
      location.hash = '#/result?id=' + encodeURIComponent(record.id);
    }, 700)
  );
}

/* ---------- 课象页 ---------- */

function resolveRecord(params) {
  const id = params.get('id');
  if (id) {
    const saved = storage.getRecord(id);
    if (saved) return saved;
  }
  if (params.get('m') && params.get('d')) {
    try {
      return liuren.buildRecord({
        mode: params.get('mode') === 'manual' ? 'manual' : 'now',
        ts: Number(params.get('t')) || Date.now(),
        lateZi: params.get('late') === '1',
        month: Number(params.get('m')),
        day: Number(params.get('d')),
        zhiIndex: Number(params.get('z')) || 0,
        lunarYear: Number(params.get('ly')) || 0,
      });
    } catch (e) {
      return null;
    }
  }
  return null;
}

function shareQuery(record) {
  return [
    'm=' + record.lunar.month,
    'd=' + record.lunar.day,
    'z=' + record.shichen.index,
    'mode=' + record.mode,
    't=' + record.ts,
    'late=' + (record.lateZi ? 1 : 0),
    'ly=' + record.lunar.year,
  ].join('&');
}

function viewResult(params) {
  const record = resolveRecord(params);
  if (!record) {
    shell(
      '<section class="page empty-page">' +
        '<div class="empty-mark serif">空</div>' +
        '<p class="empty-text">这节课的课象已散</p>' +
        '<p class="empty-hint">记录可能已被清理，请重新起课</p>' +
        '<a class="btn btn-ghost inline" href="#/cast">重新起课</a>' +
      '</section>',
      { nav: { title: '课象' }, tab: 'cast' }
    );
    return;
  }

  const palace = liuren.PALACES[record.cast.hourIdx];
  const traceDefs = [
    { key: 'monthIdx', label: '月宫' },
    { key: 'dayIdx', label: '日宫' },
    { key: 'hourIdx', label: '时宫' },
  ];
  const traces = traceDefs
    .map((def, i) => {
      const item = liuren.PALACES[record.cast[def.key]];
      return (
        '<div class="trace">' +
        '<span class="trace-label">' + def.label + '</span>' +
        '<span class="trace-name serif">' + item.name + '</span>' +
        '<span class="trace-luck luck-' + item.luckClass + '">' + item.luck + '</span>' +
        '</div>' +
        (i < traceDefs.length - 1 ? '<span class="trace-arrow">›</span>' : '')
      );
    })
    .join('');

  const timeLine =
    record.solarText +
    (record.clockText ? ' ' + record.clockText : '') +
    (record.weekText ? ' ' + record.weekText : '');

  const readings = palace.readings
    .map((r) => '<div class="reading"><span class="reading-label">' + r.label + '</span><span class="reading-text">' + esc(r.text) + '</span></div>')
    .join('');

  const verse = palace.verse
    .map((line) => '<span class="verse-line">' + esc(line) + '</span>')
    .join('');

  shell(
    '<section class="page result-page">' +
      '<div class="traces">' + traces + '</div>' +
      '<p class="traces-note">始于月 · 成于日 · 应于时</p>' +
      '<section class="hero-card is-in">' +
        '<span class="seal serif"><i>六</i><i>壬</i></span>' +
        '<p class="hero-kicker">' + esc(palace.keyword) + '</p>' +
        '<h2 class="hero-name serif">' + palace.name + '</h2>' +
        '<span class="tag tag-' + palace.luckClass + '">' + palace.luck + '</span>' +
        '<p class="hero-summary">' + esc(palace.summary) + '</p>' +
        '<p class="hero-meta">属' + palace.element + '<i>·</i>' + palace.direction + '<i>·</i>' + palace.god + '<i>·</i>主' + palace.numbers + '</p>' +
      '</section>' +
      '<section class="card verse"><h3 class="card-title">掌 诀</h3>' + verse + '</section>' +
      '<section class="card"><h3 class="card-title">断 事</h3>' + readings + '</section>' +
      '<section class="card meta">' +
        '<h3 class="card-title">起 课</h3>' +
        (record.mode === 'manual'
          ? '<div class="meta-row"><span class="meta-key">时间</span><span class="meta-val">手动择时</span></div>'
          : '<div class="meta-row"><span class="meta-key">时间</span><span class="meta-val">' + esc(timeLine) + '</span></div>') +
        '<div class="meta-row"><span class="meta-key">农历</span><span class="meta-val">' + esc(record.lunarText) + '</span></div>' +
        '<div class="meta-row"><span class="meta-key">时辰</span><span class="meta-val">' + esc(record.shichen.name + ' ' + record.shichen.range) + '</span></div>' +
        (record.lateZi ? '<p class="meta-note">已按晚子时进日，农历取次日子时。</p>' : '') +
      '</section>' +
      '<div class="actions">' +
        '<button class="btn btn-ghost action" data-act="again">再起一课</button>' +
        '<button class="btn btn-solid action action-last" data-act="share">分享课象</button>' +
      '</div>' +
      '<p class="link-row"><a href="#/history">查看全部起课记录</a></p>' +
      '<p class="footnote">传统文化 · 仅供参悟 · 不作决策依据</p>' +
    '</section>',
    { nav: { title: '课象' } }
  );

  const again = app.querySelector('[data-act="again"]');
  if (again) again.addEventListener('click', () => { location.hash = '#/cast'; });
  const shareBtn = app.querySelector('[data-act="share"]');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => shareRecord(record));
  }
}

async function shareRecord(record) {
  const query = shareQuery(record);
  const url = location.origin + location.pathname + '#/result?' + query;
  const palace = liuren.PALACES[record.cast.hourIdx];
  const text = '小六壬 · 落「' + palace.name + '」' + palace.luck + '｜' + palace.keyword;
  if (navigator.share) {
    try {
      await navigator.share({ title: '小六壬', text, url });
      return;
    } catch (e) {
      if (e && e.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    toast('链接已复制，可粘贴分享');
  } catch (e) {
    toast('分享失败，请复制地址栏链接');
  }
}

/* ---------- 手动择时 ---------- */

const MONTH_OPTIONS = [];
for (let m = 1; m <= 12; m += 1) {
  MONTH_OPTIONS.push({ value: m, label: lunar.lunarMonthName(m, false) });
}
const DAY_OPTIONS = [];
for (let d = 1; d <= 30; d += 1) {
  DAY_OPTIONS.push({ value: d, label: lunar.lunarDayName(d) });
}
const SHICHEN_OPTIONS = [];
for (let i = 0; i < 12; i += 1) {
  const s = lunar.shichenOfHour((i * 2 + 23) % 24);
  SHICHEN_OPTIONS.push({ value: i, label: s.name + ' ' + s.range });
}

function optionsHtml(list, selected) {
  return list
    .map((o) => '<option value="' + o.value + '"' + (o.value === selected ? ' selected' : '') + '>' + esc(o.label) + '</option>')
    .join('');
}

function previewFor(month, day, zhi) {
  const cast = liuren.cast(month, day, zhi);
  const hour = liuren.PALACES[cast.hourIdx];
  return {
    month: liuren.PALACES[cast.monthIdx].name,
    day: liuren.PALACES[cast.dayIdx].name,
    hour: hour.name,
    luck: hour.luck,
    luckClass: hour.luckClass,
  };
}

function viewManual() {
  const now = new Date();
  let lunarYear = now.getFullYear();
  try {
    lunarYear = lunar.solarToLunar(now.getFullYear(), now.getMonth() + 1, now.getDate()).year;
  } catch (e) {
    lunarYear = now.getFullYear();
  }

  shell(
    '<section class="page">' +
      '<header class="head"><h1 class="head-title serif">手动择时</h1><p class="head-sub">以指定的农历月、日、时辰起课</p></header>' +
      '<section class="card form">' +
        '<label class="field"><span class="field-key">农历月</span><select id="selMonth" class="field-select serif">' + optionsHtml(MONTH_OPTIONS, 1) + '</select></label>' +
        '<label class="field field-line"><span class="field-key">农历日</span><select id="selDay" class="field-select serif">' + optionsHtml(DAY_OPTIONS, 1) + '</select></label>' +
        '<label class="field field-line"><span class="field-key">时辰</span><select id="selZhi" class="field-select serif">' + optionsHtml(SHICHEN_OPTIONS, 0) + '</select></label>' +
      '</section>' +
      '<section class="card preview">' +
        '<h3 class="card-title">三 宫</h3>' +
        '<div class="stages">' +
          '<div class="stage"><span class="stage-key">月</span><span class="stage-val serif" id="pvMonth">大安</span></div>' +
          '<span class="stage-arrow">›</span>' +
          '<div class="stage"><span class="stage-key">日</span><span class="stage-val serif" id="pvDay">大安</span></div>' +
          '<span class="stage-arrow">›</span>' +
          '<div class="stage"><span class="stage-key">时</span><span class="stage-val serif" id="pvHour">大安</span></div>' +
        '</div>' +
        '<div class="preview-foot"><span class="preview-foot-label">落宫</span><span class="preview-foot-name serif" id="pvName">大安</span><span class="tag tag-good" id="pvLuck">吉</span></div>' +
      '</section>' +
      '<button class="btn btn-solid cast-btn" id="manualCast">起 课</button>' +
      '<p class="note">闰月按同名月份推算 · 子时自 23:00 起</p>' +
      '<p class="footnote">传统文化 · 仅供参悟 · 不作决策依据</p>' +
    '</section>',
    { nav: { title: '手动择时' } }
  );

  const selMonth = document.getElementById('selMonth');
  const selDay = document.getElementById('selDay');
  const selZhi = document.getElementById('selZhi');

  const refresh = () => {
    const pv = previewFor(Number(selMonth.value), Number(selDay.value), Number(selZhi.value));
    document.getElementById('pvMonth').textContent = pv.month;
    document.getElementById('pvDay').textContent = pv.day;
    document.getElementById('pvHour').textContent = pv.hour;
    document.getElementById('pvName').textContent = pv.hour;
    const luck = document.getElementById('pvLuck');
    luck.textContent = pv.luck;
    luck.className = 'tag tag-' + pv.luckClass;
  };
  [selMonth, selDay, selZhi].forEach((el) => el.addEventListener('change', refresh));

  document.getElementById('manualCast').addEventListener('click', () => {
    const record = liuren.buildRecord({
      mode: 'manual',
      ts: Date.now(),
      month: Number(selMonth.value),
      day: Number(selDay.value),
      zhiIndex: Number(selZhi.value),
      lunarYear,
    });
    storage.addRecord(record);
    location.hash = '#/result?id=' + encodeURIComponent(record.id);
  });

  refresh();
}

/* ---------- 记录页 ---------- */

function viewHistory() {
  const records = storage.listRecords();
  const rows = records
    .map((rec) => {
      const hour = liuren.PALACES[rec.cast.hourIdx];
      const trace = ['monthIdx', 'dayIdx', 'hourIdx']
        .map((key) => liuren.PALACES[rec.cast[key]].name)
        .join(' · ');
      const timeText = rec.mode === 'manual' ? '手动择时' : rec.solarText + (rec.clockText ? ' ' + rec.clockText : '');
      return (
        '<div class="record" data-id="' + esc(rec.id) + '">' +
          '<div class="record-main" data-act="open">' +
            '<div class="record-badge"><span class="record-name serif">' + hour.name + '</span><span class="record-luck luck-' + hour.luckClass + '">' + hour.luck + '</span></div>' +
            '<div class="record-info"><span class="record-time">' + esc(timeText) + '</span><span class="record-trace">' + esc(rec.lunarText) + ' · ' + trace + '</span></div>' +
          '</div>' +
          '<button class="record-del" data-act="del" aria-label="删除">×</button>' +
        '</div>'
      );
    })
    .join('');

  shell(
    '<section class="page">' +
      '<header class="head">' +
        '<div class="head-row"><h1 class="head-title serif">起课记录</h1>' +
        (records.length ? '<button class="clear" data-act="clear">清空</button>' : '') +
        '</div>' +
        (records.length ? '<p class="head-sub">共 ' + records.length + ' 课 · 仅保存在本机</p>' : '') +
      '</header>' +
      (records.length
        ? '<div class="list">' + rows + '</div>'
        : '<div class="empty"><div class="empty-mark serif">空</div><p class="empty-text">还没有起课记录</p><p class="empty-hint">回到起课页，静心掐指一课</p><a class="empty-btn" href="#/cast">去起课</a></div>') +
      '<p class="footnote">记录仅保存在本机 · 不上传</p>' +
    '</section>',
    { tab: 'history' }
  );

  app.querySelectorAll('.record').forEach((row) => {
    const id = row.dataset.id;
    row.querySelector('[data-act="open"]').addEventListener('click', () => {
      location.hash = '#/result?id=' + encodeURIComponent(id);
    });
    row.querySelector('[data-act="del"]').addEventListener('click', (e) => {
      e.stopPropagation();
      if (!confirm('删除这条记录？')) return;
      storage.removeRecord(id);
      render();
    });
  });

  const clear = app.querySelector('[data-act="clear"]');
  if (clear) {
    clear.addEventListener('click', () => {
      if (!confirm('清空全部 ' + records.length + ' 条记录？')) return;
      storage.clearRecords();
      render();
    });
  }
}

/* ---------- 说明页 ---------- */

function viewAbout() {
  const lateZi = !!storage.getSettings().lateZi;
  const palaces = liuren.PALACES.map(
    (p) =>
      '<div class="palace">' +
        '<div class="palace-head"><span class="palace-name serif">' + p.name + '</span>' +
        '<span class="tag tag-' + p.luckClass + '">' + p.luck + '</span>' +
        '<span class="palace-keyword">' + esc(p.keyword) + '</span></div>' +
        '<p class="palace-meta">属' + p.element + ' · ' + p.direction + ' · ' + p.god + ' · 主' + p.numbers + '</p>' +
        '<p class="palace-line">' + esc(p.summary) + '</p>' +
      '</div>'
  ).join('');

  shell(
    '<section class="page">' +
      '<header class="head"><h1 class="head-title serif">小六壬</h1><p class="head-sub">掌上六宫 · 以时断事</p></header>' +
      '<section class="card"><h3 class="card-title">起 源</h3>' +
        '<p class="para">小六壬是民间流传的快速占断法：以左掌六宫为盘，凭农历的月、日、时辰三者依次顺数，看最终落于何宫，再按该宫的吉凶与象意断事。</p>' +
        '<p class="para">它起课极简、随问随断，旧时多用于出行、寻物、问人等日常小事。</p></section>' +
      '<section class="card"><h3 class="card-title">起 课 法</h3>' +
        '<div class="step"><span class="step-no">一</span><span class="step-text">大安起正月，顺数至所问月份，落于「月宫」。</span></div>' +
        '<div class="step"><span class="step-no">二</span><span class="step-text">自月宫起初一，顺数至所问日，落于「日宫」。</span></div>' +
        '<div class="step"><span class="step-no">三</span><span class="step-text">自日宫起子时，顺数至所问时辰，落于「时宫」。</span></div>' +
        '<p class="step-note">月宫看事之始，日宫看事之中，时宫定事之终。六宫循环：大安 → 留连 → 速喜 → 赤口 → 小吉 → 空亡。</p></section>' +
      '<section class="card"><h3 class="card-title">六 宫 一 览</h3>' + palaces + '</section>' +
      '<section class="card"><h3 class="card-title">设 置</h3>' +
        '<label class="setting"><span class="setting-main"><span class="setting-name">晚子时进日</span><span class="setting-desc">23:00 后起课，农历按次日推算</span></span>' +
        '<span class="switch"><input type="checkbox" id="lateZiToggle"' + (lateZi ? ' checked' : '') + '><i></i></span></label>' +
      '</section>' +
      '<section class="card"><h3 class="card-title">安装到主屏幕</h3>' +
        '<p class="para">iPhone：用 Safari 打开本页 → 点底部「分享」→「添加到主屏幕」，即可像 App 一样全屏使用。</p>' +
        '<p class="para">Android：用 Chrome 打开 → 菜单「安装应用 / 添加到主屏幕」。</p></section>' +
      '<section class="card"><h3 class="card-title">说 明</h3>' +
        '<p class="para">所有推算均在本机完成，起课记录只保存在浏览器本地，不会上传。</p>' +
        '<p class="para">六宫断辞取自民间通行歌诀，仅作传统文化体验与参考，不构成决策、医疗、法律或投资建议。</p></section>' +
      '<p class="footnote">小六壬 · 掌上起课</p>' +
    '</section>',
    { tab: 'about' }
  );

  const toggle = document.getElementById('lateZiToggle');
  toggle.addEventListener('change', () => {
    storage.saveSettings({ lateZi: toggle.checked });
    toast(toggle.checked ? '23 点后按次日子时' : '按当日农历起课');
  });
}

/* ---------- 路由 ---------- */

const VIEWS = {
  cast: viewCast,
  result: viewResult,
  manual: viewManual,
  history: viewHistory,
  about: viewAbout,
};

function parseRoute() {
  const raw = (location.hash || '#/cast').replace(/^#\/?/, '');
  const qi = raw.indexOf('?');
  const name = (qi >= 0 ? raw.slice(0, qi) : raw) || 'cast';
  const params = new URLSearchParams(qi >= 0 ? raw.slice(qi + 1) : '');
  return { name, params };
}

function render() {
  stopTimers();
  const route = parseRoute();
  const view = VIEWS[route.name] || VIEWS.cast;
  view(route.params);
  window.scrollTo(0, 0);
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-act="back"]');
  if (!target) return;
  if (history.length > 1) history.back();
  else location.hash = '#/cast';
});

window.addEventListener('hashchange', render);
window.addEventListener('load', () => {
  if (!location.hash) location.replace('#/cast');
  render();
  if ('serviceWorker' in navigator && !/[?&]nosw=1/.test(location.search)) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});

})();