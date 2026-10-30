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
