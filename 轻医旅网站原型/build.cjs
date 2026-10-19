/* ==============================================================
   CMT Medical Travel — prototype build
   --------------------------------------------------------------
   Emits every page of the prototype from the shared content model
   in assets/data.js + assets/data-content.js.

     node build.cjs

   Generated files start with a GENERATED banner — edit the data
   or this script, not the .html.
   ============================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const MT = require('./assets/data-content.js');

const DIR = __dirname;
const FILES = [];

/* ---------------------------------------------------------------
   Small helpers
   --------------------------------------------------------------- */
const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/* 数量表达：英文写单词、中文写汉字数词（「Three priorities, five destinations」）。
   只覆盖十位以内，超了退回阿拉伯数字。 */
const EN_NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const ZH_NUM = ['零', '一', '两', '三', '四', '五', '六', '七', '八', '九', '十'];
const numEn = (n) => (EN_NUM[n] !== undefined ? EN_NUM[n] : String(n));
const numZh = (n) => (ZH_NUM[n] !== undefined ? ZH_NUM[n] : String(n));

/* 一行地名列表的连词：EN「a, b and c」/ ZH「a、b与c」。 */
const listEn = (a) => (a.length < 2 ? a[0] || '' : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
const listZh = (a) => (a.length < 2 ? a[0] || '' : a.slice(0, -1).join('、') + '与' + a[a.length - 1]);

/* 只作「旅行目的地」的城市 = 全部目的地去掉承担临床落地（昆明）与康养基地
   （澄江 · 抚仙湖）的两处。跟着 MT.CITIES 走，新增城市自动进来。 */
const TOURING = MT.CITIES.filter((c) => !['kunming', 'chengjiang'].includes(c.id));
const CITY_NAMES = (i) => MT.CITIES.map((c) => c.short[i]).join(' · ');
const TOURING_NAMES = (i) => TOURING.map((c) => c.short[i]).join(' · ');

/* bilingual attribute pair */
const d = (en, zh) => `data-en="${esc(en)}" data-zh="${esc(zh)}"`;
/* same, but the value may contain markup — swapped with innerHTML */
const h = (en, zh) => `data-hen="${esc(en)}" data-hzh="${esc(zh)}"`;
/* element whose text swaps with the language */
const P = (tag, en, zh, attrs) =>
  `<${tag}${attrs ? ' ' + attrs : ''} ${d(en, zh)}>${esc(en)}</${tag}>`;
const A = (href, en, zh, attrs) =>
  `<a href="${href}"${attrs ? ' ' + attrs : ''} ${d(en, zh)}>${esc(en)}</a>`;
/* bilingual attribute — aria-label / placeholder / alt / title.
   site.js swaps [data-attr] with data-attr-en / data-attr-zh. */
const at = (name, en, zh) =>
  `data-attr="${name}" data-attr-en="${esc(en)}" data-attr-zh="${esc(zh)}"`;
/* a slot time label is either one string used in both languages,
   or a [en, zh] pair. */
const timeLabel = (t) => Array.isArray(t)
  ? `<time ${d(t[0], t[1])}>${esc(t[0])}</time>`
  : `<time>${esc(t)}</time>`;

/* ---------------------------------------------------------------
   客户给的实拍图（替换原型里的渐变色块）
   ---------------------------------------------------------------
   原型的默认口径是「一切图都是 CSS 色块」，每个色块容器上还压着
   一层纹理网格（.hero__media::after / .prog__media::after）。
   换成真图时**必须同时关掉那层网格**，否则每张照片都被套一层格子。
   做法：带图容器多一个 `--photo` 修饰类，样式里由它负责关网格 + 压暗。
   --------------------------------------------------------------- */
const HERO_PHOTO = 'assets/images/fuxianhu-hero.jpg';
/* 装饰性背景（父级已 aria-hidden），alt 留空即可。
   mobileSrc：可选的竖构图版（art direction）。传了就输出 <picture>，窄屏（≤640px）
   换竖图、桌面仍是原横图 —— 一张 16:9 横图在 390px 屏上只露出中间一条，
   怎么调取景都是残的，只能换构图。
   取景位置刻意不在这里写死：窄屏要另设取景，而行内样式优先级高于样式表、
   会顶掉媒体查询，所以取景一律交给页头的修饰类 + CSS（见 .pagehead--cover-left）。
   不传 mobileSrc 时输出与旧版逐字节一致（其余带图页头不受影响）。 */
const heroPhoto = (src, mobileSrc) => {
  const img = `<img src="${src}" alt="" loading="eager" decoding="async" fetchpriority="high">`;
  return mobileSrc
    ? `<picture><source media="(max-width:640px)" srcset="${mobileSrc}">${img}</picture>`
    : img;
};

const ICON = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  tick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  cross: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
  /* 按钮组尾随圆钮里的那个 ↗（Flora 2026-09-22 参考稿，两枚按钮都用它） */
  arrowUpRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M7 7h10v10"/></svg>'
};

/* WhatsApp 在线咨询按钮：原型态只渲染、不跳转（占位用 MT.SITE.wa）。
   上线时把 assets/data.js 的 SITE.wa 换成 https://wa.me/<number> 即可全站生效。 */
const WA = ['Online Consultation', '在线咨询'];

const BANNER = '<!-- GENERATED by build.cjs — edit assets/data*.js or build.cjs, then re-run: node build.cjs -->';

/* ---------------------------------------------------------------
   Single conversion entry point.
   No page carries a form. Every collecting CTA points at
   request.html, optionally carrying ?for=<slug> so the form can
   show what the enquiry is about. Same pattern as request-call in
   cmt-shopify-headless.
   --------------------------------------------------------------- */
const REQ = 'request.html';
const req = (slug) => REQ + (slug ? '?for=' + encodeURIComponent(slug) : '');

/* ---------------------------------------------------------------
   Shared chrome
   顶部导航 2026-09-22（Flora）：删掉右侧的「预约回电」按钮，菜单整体靠右
   （对齐方式在 style.css 的 .site-header__menu）。
   ⚠ 移动端抽屉底部那枚 .navcta 没删 —— 窄屏下它是 header 里唯一的转化入口。
   --------------------------------------------------------------- */
function header(active) {
  const nav = MT.NAV.map((n) =>
    `<a class="site-header__link" href="${n.href}"${active === n.id ? ' aria-current="page"' : ''} ${d(n.t[0], n.t[1])}>${esc(n.t[0])}</a>`
  ).join('\n        ');

  return `<header class="site-header" id="siteHeader">
  <div class="site-header__inner shell">
    <div class="site-header__identity">
      <a class="brand" href="index.html" aria-label="CMT Health">
        <img class="brand__logo" src="brand/cmt-health-horizontal-black-logo.svg" alt="CMT Health" width="168" height="42">
      </a>
      <div class="lang">
        <button type="button" data-lang="en" onclick="setLang('en')">EN</button>
        <button type="button" data-lang="zh" onclick="setLang('zh')">中文</button>
      </div>
    </div>
    <nav class="site-header__menu" ${at('aria-label', 'Main navigation', '主导航')}>
        ${nav}
    </nav>
    <div class="site-header__actions">
      <button class="menu-toggle" type="button" onclick="toggleMenu()" ${at('aria-label', 'Menu', '菜单')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        <span ${d('Menu', '菜单')}>Menu</span>
      </button>
    </div>
  </div>
</header>`;
}

/* 栏目内二级导航（subnav）2026-09-20 已删除。
   它夹在 sticky header 与 <main> 之间，等于在 hero 上面多压一条 55px 白带，
   而它自身不吸顶——吃完第一屏就消失。同层切换改由页面内的列表承担：
   cities（首页 + destinations）、journeys、daytours。
   删除前已逐页核对：13 个 subnav 目标页全部仍由上述列表可达，没有产生孤儿页。 */

function footer(extraClass) {
  /* footer nav: 第一列「浏览」沿用 header 菜单（MT.NAV）；
     第二列「法律文件」纯展示（Flora 2026-09-22 新增）；
     第三列「联系我们」（邮箱 / 电话 / 地址）。 */
  const browse = MT.NAV.map((n) => `<li>${A(n.href, n.t[0], n.t[1])}</li>`).join('\n        ');
  /* 法律文件列：五项都还没有落地页或外链，所以不生成 <a>（避免凭空造断链），
     改用 <span> 承载 data-en / data-zh，语言切换照常生效。 */
  const legal = [
    ['Privacy Policy', '隐私政策'],
    ['Cookie Policy', 'Cookie政策'],
    ['Terms of Use', '网站使用条款'],
    ['Medical & Service Disclaimer', '医疗及服务免责声明'],
    ['Cookie Settings', 'Cookie设置'],
  ].map((it) => `<li><span ${d(it[0], it[1])}>${esc(it[0])}</span></li>`).join('\n        ');
  /* 品牌语里的地名 = 五个目的地，跟 MT.CITIES 走；读 short 而不是 t，
     否则「澄江 · 抚仙湖」会多出一个地名。 */
  const DEST_LINE = [CITY_NAMES(0), CITY_NAMES(1)];
  const addr = MT.SITE.address ? MT.SITE.address[0] : ['', ''];
  /* 电话 icon（ICON 里没有 phone，这里单独给一个） */
  const pHone = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.7a2 2 0 0 1 1.7 2z"/></svg>';
  return `<footer class="site-footer${extraClass ? ' ' + extraClass : ''}">
  <div class="site-footer__watermark" aria-hidden="true">
    <svg viewBox="0 0 300 300" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">
      <rect x="48" y="48" width="204" height="204" rx="44" stroke-width="25"/>
      <path d="M91 211V111Q91 96 106 96H194Q209 96 209 111V211" stroke-width="22"/>
      <path d="M119 133H181M150 133V211" stroke-width="22"/>
    </svg>
  </div>
  <div class="site-footer__inner shell site-footer__main">
    <div class="site-footer__brand-block">
      <a class="brand" href="index.html" aria-label="CMT Health">
        <img class="brand__logo" src="brand/cmt-health-horizontal-white.svg" alt="CMT Health" width="168" height="42">
      </a>
      <p ${d('Personal health-and-wellness trips in Yunnan: ' + DEST_LINE[0] + '.',
             '在云南为你定制健康与康养之旅：' + DEST_LINE[1] + '。')}>Personal health-and-wellness trips in Yunnan.</p>
    </div>

    <div class="site-footer__col">
      <h2 ${d('Browse', '浏览')}>Browse</h2>
      <ul>
        ${browse}
      </ul>
    </div>
    <div class="site-footer__col site-footer__col--legal">
      <h2 ${d('Legal', '法律文件')}>Legal</h2>
      <ul>
        ${legal}
      </ul>
    </div>
    <div class="site-footer__col site-footer__col--contact">
      <h2 ${d('Contact us', '联系我们')}>Contact us</h2>
      <ul>
        <li>${ICON.mail}<span class="ctxt">${esc(MT.SITE.email)}</span></li>
        <li>${pHone}<span class="ctxt">${esc(MT.SITE.phone)}</span></li>
        <li>${ICON.pin}<span class="ctxt" ${d(addr[0], addr[1])}>${esc(addr[0])}</span></li>
      </ul>
    </div>
  </div>
  <div class="site-footer__bottom">
    <div class="site-footer__inner shell">
      <p ${d('© 2026 CMT Health — CMT Medical Travel. Structural prototype, not final content.',
             '© 2026 CMT Health — CMT Medical Travel。结构原型，非最终内容。')}>© 2026 CMT Health — CMT Medical Travel.</p>
      <p ${d('This site provides non-clinical coordination information only and does not constitute medical advice. Nothing on this prototype is submitted anywhere.',
             '本站仅提供非临床协调信息，不构成医疗建议。本原型不提交任何数据。')}>Non-clinical coordination information only.</p>
    </div>
  </div>
</footer>`;
}

function mnav(active) {
  const items = MT.NAV.map((n) =>
    `<a href="${n.href}"${active === n.id ? ' aria-current="page"' : ''} ${d(n.t[0], n.t[1])}>${esc(n.t[0])}</a>`
  ).join('\n    ');
  return `<div class="mnav" id="mnav">
  <div class="mnav__head">
    <a class="brand" href="index.html" onclick="toggleMenu()">
      <img class="brand__logo" src="brand/cmt-health-horizontal-black-logo.svg" alt="CMT Health" width="168" height="42">
    </a>
    <button class="x" type="button" onclick="toggleMenu()" ${at('aria-label', 'Close', '关闭')}>&times;</button>
  </div>
  <nav class="mnav__list" ${at('aria-label', 'Mobile navigation', '移动导航')}>
    ${items}
  </nav>
  <a class="navcta" href="request.html" ${d('Request a Call', '预约回电')}>Request a Call</a>
</div>`;
}

function floaters() {
  return `<div class="floaters">
  <a class="floater" href="request.html" ${at('aria-label', 'Enquiry', '立即咨询')}>${ICON.chat}</a>
  <a class="floater" href="request.html" ${at('aria-label', 'Request a Call', '预约回电')}>${ICON.phone}</a>
</div>`;
}

function page(o) {
  return `${BANNER}
<!DOCTYPE html>
<html lang="en" data-title-en="${esc(o.title[0])}" data-title-zh="${esc(o.title[1])}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.title[0])}</title>
<meta name="description" content="${esc(o.desc[0])}" data-attr="content" data-attr-en="${esc(o.desc[0])}" data-attr-zh="${esc(o.desc[1])}">
<link rel="stylesheet" href="assets/style.css">
</head>
<body>
${header(o.nav)}
<main id="top">
${o.body}
</main>
${footer(o.footerClass)}
${mnav(o.nav)}
${floaters()}
<script src="assets/data.js"></script>
<script src="assets/data-content.js"></script>
<script src="assets/site.js"></script>
</body>
</html>
`;
}

/* ---------------------------------------------------------------
   重建前自动备份（2026-09-21 内建）
   ---------------------------------------------------------------
   build.cjs 会整体重写产物 .html。若有人（Flora / 我）在生成器之外
   直接改过这些文件，重建就会把改动冲掉——2026-09-20 已发生过一次。
   每次 `node build.cjs` 自动做两件事：

     1. 指纹告警：上次构建产物的 md5 记在 tmp/_autobak/_manifest.json。
        本次要写某页时，若它在磁盘上的内容与上次构建产物不符，说明
        **被人在生成器之外改过** → 打印告警。
     2. 覆写前备份：任何「内容将要变化」的页面，改前先存一份到
        tmp/_autobak/<时间戳>/，保留最近 30 份。

   判据只对 .html（产物）告警；生成器源码（build.cjs / data*.js /
   site.js / style.css）本来就是手改对象，只默默存档、不告警。
   --------------------------------------------------------------- */
const crypto = require('crypto');
const BAK_ROOT = fs.existsSync(path.resolve(DIR, '..', '..', 'tmp'))
  ? path.join(path.resolve(DIR, '..', '..', 'tmp'), '_autobak')
  : path.join(DIR, 'tmp', '_autobak');
const MANIFEST = path.join(BAK_ROOT, '_manifest.json');
const SOURCES = ['build.cjs', 'assets/data.js', 'assets/data-content.js',
                 'assets/site.js', 'assets/style.css'];
const KEEP_BAKS = 30;
const hash = (s) => crypto.createHash('md5').update(s, 'utf8').digest('hex').slice(0, 12);

let PREV = {};
try { PREV = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')); } catch (e) { PREV = {}; }
const NEXT = {};
const STAMP = (() => {
  const t = new Date(), p = (n) => String(n).padStart(2, '0');
  return t.getFullYear() + p(t.getMonth() + 1) + p(t.getDate()) + '-' +
         p(t.getHours()) + p(t.getMinutes()) + p(t.getSeconds());
})();
let BAK_DIR = null;
const backedUp = [];
const handEdited = [];

function backup(rel, content) {
  if (BAK_DIR === null) {
    BAK_DIR = path.join(BAK_ROOT, STAMP);
    fs.mkdirSync(BAK_DIR, { recursive: true });
  }
  const dest = path.join(BAK_DIR, rel);
  if (fs.existsSync(dest)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content, 'utf8');
  backedUp.push(rel);
}

/* 磁盘内容与上次构建产物不符 → 有人在生成器之外改过 */
function flagIfHandEdited(rel, current) {
  if (PREV[rel] !== undefined && PREV[rel] !== hash(current)) handEdited.push(rel);
}

function emit(file, html) {
  const dest = path.join(DIR, file);
  let old = null;
  try { old = fs.readFileSync(dest, 'utf8'); } catch (e) { old = null; }
  if (old !== null) {
    flagIfHandEdited(file, old);
    if (old !== html) backup(file, old);
  }
  fs.writeFileSync(dest, html, 'utf8');
  NEXT[file] = hash(html);
  FILES.push(file);
}

/* ---------------------------------------------------------------
   Reusable page fragments
   --------------------------------------------------------------- */
function pagehead(o) {
  const crumb = (o.crumb || []).map((c, i) =>
    i === (o.crumb.length - 1)
      ? `<li><span aria-current="page" ${d(c[0], c[1])}>${esc(c[0])}</span></li>`
      : `<li>${A(c[2], c[0], c[1])}</li>`
  ).join('');
  /* 传了 o.photo 就换成实拍图。pagehead 没有 .hero__scrim，白字直接压图会糊，
     所以带图时必须补一层压暗——文字左对齐，左侧压得更重。
     o.photoMobile：可选的竖构图版；取景位置改成用 o.cls 挂类、在 CSS 里按断点写。 */
  const media = o.photo
    ? `<div class="pagehead__media pagehead__media--photo" aria-hidden="true">${heroPhoto(o.photo, o.photoMobile)}</div>
  <div class="pagehead__scrim" aria-hidden="true"></div>`
    : '<div class="pagehead__media" aria-hidden="true"></div>';
  /* o.hero：两个目录页（行程 / 目的地）的 banner 统一高度标记。
     .pagehead 是 <section>，会吃到全局 section{padding:92px 0 98px}，而各页 hero 文案
     长短不同 → band 高度 470～600 参差。带上这个类，样式里把两页钉在同一高度。 */
  /* o.facts 跟 o.lead 挤在同一行源里：o.facts 为空时，独立成一行会在产物里
     留下 4 个空格的缩进行，所有带 pagehead 的页面都会多一行空白（规矩：只有目标页
     的产物可以变，其余逐字节不动）。
     ⚠ 注释必须写在模板字符串外面 —— 写在里面会连注释原文一起输出到 HTML。 */
  /* o.cls：附加修饰类（如自定义取景），挂在最后 → 不传时 class 属性与旧版一致。 */
  return `<section class="pagehead${o.slim ? ' pagehead--slim' : ''}${o.hero ? ' pagehead--hero' : ''}${o.cls ? ' ' + o.cls : ''}">
  ${media}
  <div class="pagehead__inner">
    ${crumb ? `<ul class="crumb">${crumb}</ul>` : ''}
    ${o.eyebrow ? `<p class="pagehead__eyebrow" ${d(o.eyebrow[0], o.eyebrow[1])}>${esc(o.eyebrow[0])}</p>` : ''}
    ${P('h1', o.h1[0], o.h1[1])}
    ${o.lead ? `<p class="pagehead__lead" ${d(o.lead[0], o.lead[1])}>${esc(o.lead[0])}</p>` : ''}${o.facts ? `<div class="pagehead__facts">${o.facts}</div>` : ''}
    ${o.actions ? `<div class="pagehead__actions">${o.actions}</div>` : ''}
  </div>
</section>`;
}

/* 目的地页的「该目的地的内容」压缩成一行标签（Flora 2026-09-21）。
   原来是带勾的整句列表，单独占一个 section（label + checks + 侧栏 spec 表 + ctaCard）；
   现在精简成标签并进 pagehead，正文直接从日游线路开始。
   items = [[en, zh], …]，直接排进一行，换行交给容器统一处理。 */
function factsRow(items) {
  return items.map((it) => `<span class="tag" ${d(it[0], it[1])}>${esc(it[0])}</span>`).join('');
}

function checks(items) {
  return `<ul class="checks">${items.map((it) =>
    `<li>${ICON.tick}<span>${it[2] ? `<b>${esc(it[2])}</b> ` : ''}${esc(it[0])}</span></li>`
  ).join('')}</ul>`;
}
function checksBi(items) {
  return `<ul class="checks">${items.map((it) =>
    `<li>${ICON.tick}<span ${d(it[0], it[1])}>${esc(it[0])}</span></li>`
  ).join('')}</ul>`;
}
/* 费用不含那一列：条目前用 ✕ 而不是 ✓，配色跟随 muted，跟「含」区分开 */
function crossesBi(items) {
  return `<ul class="checks checks--excl">${items.map((it) =>
    `<li>${ICON.cross}<span ${d(it[0], it[1])}>${esc(it[0])}</span></li>`
  ).join('')}</ul>`;
}

function specTable(rows) {
  return `<dl class="spec">${rows.map((r) =>
    `<div class="spec__row"><dt ${d(r[0][0], r[0][1])}>${esc(r[0][0])}</dt>` +
    `<dd ${d(r[1][0], r[1][1])}>${esc(r[1][0])}</dd></div>`
  ).join('')}</dl>`;
}

/* 行程项配图 —— 原图本来就配在它所解释的那条行程项旁边，
   这里照同样的从属关系挂在该时段下方，不另起一个图库小节。
   imgs 可以是文件名数组（共用 altPair），也可以是 {f, t} 数组（每张自己的说明）。
   <a> 保留 href：JS 没跑起来时仍能直接打开原图；点开放大交给 site.js 的灯箱。 */
function photoStrip(imgs, altPair, small) {
  if (!imgs || !imgs.length) return '';
  const fallback = altPair || ['', ''];
  const items = imgs.map((it) => {
    const f = typeof it === 'string' ? it : it.f;
    const p = typeof it === 'string' ? fallback : (it.t || fallback);
    const altEn = p[0];
    const altZh = p[1] !== undefined ? p[1] : p[0];
    /* alt 写英文底座（无 JS 时图仍有替代文字），data-attr 三件套让 site.js 随语言切换覆盖。
       链接名交给 img 的 alt，所以 <a> 上只挂双语 aria-label，不写字面量（沿用站内惯例）。 */
    return `<a class="photo${small ? ' photo--sm' : ''}" href="assets/images/${f}" data-zoom="${f}"` +
      ` ${at('aria-label', 'Enlarge: ' + altEn, '放大查看：' + altZh)}>` +
      `<img src="assets/images/${f}" alt="${esc(altEn)}" ${at('alt', altEn, altZh)} loading="lazy" decoding="async">` +
      `</a>`;
  }).join('');
  return `<div class="photos${small ? ' photos--sm' : ''}">${items}</div>`;
}

/* ---------------------------------------------------------------
   request 页右侧的目的地图墙（Flora 2026-09-21）
   ---------------------------------------------------------------
   把「5 张目的地卡片封面」按 2 列无缝拼贴（gap 在 CSS 里写 0，格子紧贴）。
   有实拍封面（c.img）就出 <img>，没有的退回该城市的占位纹理 ——
   用的就是列表页目的地卡（site.js 的 cityCard）那套图，不另造素材。
   5 张是奇数：最后一张横跨两列收口，免得右下角留一块空底色；
   跨列格在 CSS 里给 aspect-ratio 3.2/1，与普通格等高，整块仍是方正的网格。
   --------------------------------------------------------------- */
function cityMosaic() {   // ⚠ 已无引用：request 页的「Before you send」区块（含城市 mosaic）由 Flora 2026-09-22 手删，生成器同步移除；留档，要恢复就把那段 <section class="sec-white reqpage"> 加回 REQ body
  const cities = MT.CITIES;
  const last = cities.length - 1;
  return `<div class="mosaic" aria-hidden="true">${cities.map((c, i) => {
    const wide = i === last && cities.length % 2 === 1;
    const cls = 'mosaic__cell' + (c.img ? ' mosaic__cell--photo' : '') + (wide ? ' mosaic__cell--wide' : '');
    if (!c.img) return `<span class="${cls} ${c.ph}"></span>`;
    const altEn = c.img.alt[0];
    const altZh = c.img.alt[1] !== undefined ? c.img.alt[1] : c.img.alt[0];
    return `<span class="${cls}">` +
      `<img src="${c.img.src}" alt="${esc(altEn)}" ${at('alt', altEn, altZh)} loading="lazy" decoding="async"></span>`;
  }).join('')}</div>`;
}

function dayline(items) {
  return `<ul class="dayline">${items.map((it) => {
    const headEn = it.d[0] + ' · ' + it.t[0];
    const headZh = it.d[1] + ' · ' + it.t[1];
    const slots = it.slots.map((s) => {
      const zh = s[2] !== undefined ? s[2] : s[1];
      return `<div class="dayline__slot${s[3] ? ' dayline__slot--media' : ''}">${timeLabel(s[0])}` +
        `<span ${d(s[1], zh)}>${esc(s[1])}</span>${photoStrip(s[3], [s[1], zh])}</div>`;
    }).join('');
    const note = it.note
      ? `<p class="dayline__note" ${d(it.note[0], it.note[1])}>${esc(it.note[0])}</p>` : '';
    return `<li>${P('h3', headEn, headZh)}${slots}${note}</li>`;
  }).join('')}</ul>`;
}

/* a flat list of timed stops, used by the day-tour pages */
/* s[3] is an optional photo list — same shape as dayline()'s, so the stop
   can carry `{f, t:[en,zh]}` shots that open in the lightbox. */
function stopline(stops) {
  return `<ul class="dayline">${stops.map((s) => {
    const zh = s[2] !== undefined ? s[2] : s[1];
    const photos = s[3] ? photoStrip(s[3], [s[1], zh], true) : '';
    return `<li><div class="dayline__slot${s[3] ? ' dayline__slot--media' : ''}">${timeLabel(s[0])}` +
      `<span ${d(s[1], zh)}>${esc(s[1])}</span>${photos}</div></li>`;
  }).join('')}</ul>`;
}

function notice(title, body) {
  return `<div class="notice">${ICON.info}<div>${P('b', title[0], title[1])}${P('p', body[0], body[1])}</div></div>`;
}

/* ---------------------------------------------------------------
   按钮组（Flora 2026-09-22 参考稿）
   ---------------------------------------------------------------
   一组两枚胶囊按钮，各自尾随一枚圆形图标钮（↗）：主按钮（实心）在左、
   次按钮（描边）在右，与参考稿一致。a / b 都是 [href, en, zh]。
     o.light —— 底色是白卡 / 半透明白面板时置 true：参考稿那个白底实心按钮
       压在浅色面上会整个消失，那里改走主色实底。
     o.sm    —— 侧栏卡片里的小一号（对应 .btnpair--sm）。
     o.cls   —— 额外的容器类，用来接住目标位置既有的布局规则（首页
       .hero__actions 的居中与上边距就走这条路）。
   ⚠ 文案必须挂在按钮内的 <span> 上，不能挂在 <a> 上：site.js 的 i18n 对
     [data-en] 用的是 textContent 赋值，挂在 <a> 上会把圆钮里的 SVG 一起
     抹掉 —— 旧版 closing / ctaCard 的箭头就是这么在加载时丢掉的。
   ⚠ 同一套标记在 assets/site.js 里还有一份（wantMoreCard 是运行时渲染的，
     生成器够不着），改这两个地方要一起改。
   --------------------------------------------------------------- */
function btnPair(o) {
  const item = (it, skin) =>
    `<a class="btnpair__btn btnpair__btn--${skin}" href="${it[0]}">` +
    `<span ${d(it[1], it[2])}>${esc(it[1])}</span>` +
    `<span class="btnpair__ico">${ICON.arrowUpRight}</span></a>`;
  const cls = 'btnpair' + (o.light ? ' btnpair--onlight' : '') + (o.sm ? ' btnpair--sm' : '') +
    (o.cls ? ' ' + o.cls : '');
  return `<div class="${cls}">${item(o.a, 'solid')}${item(o.b, 'ghost')}</div>`;
}

/* 单个「预约回电」实心按钮（行程/目的地页头 pagehead 用）。样式对齐首页 hero 的
   btnpair 实心按钮：白底深色箭头。容器 .pagehead__actions 已补上 btnpair 的 solid 变量。 */
function reqCta(slug, label) {
  const L = label || ['Request a Call', '预约回电'];
  return `<a class="btnpair__btn btnpair__btn--solid" href="${req(slug)}">` +
    `<span ${d(L[0], L[1])}>${esc(L[0])}</span>` +
    `<span class="btnpair__ico">${ICON.arrowUpRight}</span></a>`;
}

/* 页脚 CTA 长条的内容（标题 + 说明 + 按钮组）。
   2026-09-22 起全站底部只有「通栏实拍图 + 半透明白面板」这一种形态，
   外壳统一由下面的 closing() 负责。 */
function closingInner(title, text, ctaLabel, slug) {
  return `<div class="closing__inner">
    <div>${P('h2', title[0], title[1])}${P('p', text[0], text[1])}</div>
    ${btnPair({
      light: true,
      a: [req(slug), ctaLabel[0], ctaLabel[1]],
      b: [MT.SITE.wa, WA[0], WA[1]]
    })}
  </div>`;
}

/* 页脚 CTA 长条外壳（Flora 2026-09-22：全站统一成首页那套 —— 通栏实拍图当背景、
   CTA 卡片是半透明白面板浮在图上）。原先那套深色渐变面板（.closing）不再使用。
   只有这一张通栏图（1280x460），全站复用；换大图/换图改这里一处即可。 */
const CTA_BAND_PHOTO = 'assets/images/yunnan-forest-green-hero-1280x460.jpg';
function closing(title, text, ctaLabel, slug) {
  return `<section class="footband footband--cta">
    <img class="footband__photo" src="${CTA_BAND_PHOTO}" alt="" aria-hidden="true">
    <div class="footband__overlay"><div class="shell">${closingInner(title, text, ctaLabel, slug)}</div></div>
  </section>`;
}

/* compact CTA used in page sidebars and inside long articles */
function ctaCard(subject, slug, note, label) {
  const body = note || ['We reply with a tailored itinerary and a clear price.',
                        '我们会回复你定制的行程与报价。'];
  const aLabel = label || ['Request a Call', '预约回电'];
  return `<aside class="ctacard">
    ${P('p', 'Questions?', '想了解更多？', 'class="ctacard__label"')}
    ${subject ? P('b', subject[0], subject[1], 'class="ctacard__subject"') : ''}
    ${P('p', body[0], body[1])}
    ${btnPair({
      light: true, sm: true,
      a: [req(slug), aLabel[0], aLabel[1]],
      b: [MT.SITE.wa, WA[0], WA[1]]
    })}
  </aside>`;
}

/* 「落地执行的六项承诺」区块（Flora 2026-09-21 定，2026-09-22 服务流程页删除后重排）：
   - 首页：完整六条，用「左图右列」版式 → assuranceCommitments()
   - about 页「从健康项目到云南旅程」：**改用首页那套旧版「错落卡」样式** → aboutJourneyAssure()
   2026-09-22 10:40（Flora）：整块从「四步之后」挪到「目的地之后」、页脚通栏图之前。
   2026-09-23（Flora）：两处版式**对调** —— 「左图右列」留在首页；旧版错落卡从首页整套
   搬到 about 那块。所以 .assure 与 .assplit **两套样式都还在**，各归一处，别删也别混。 */

/* 「左图右列」版式（Flora 2026-09-23 参考图）—— **两处共用一套样式**：
   - 首页「让每一步都更安心」六项承诺：右侧是六条「图标 + 标题 + 描述」，由
     [data-render="assuranceSplit"] 运行时渲染。
   - about 页「从健康项目到云南旅程」：右侧是四条「标题 + 描述」事实带（静态文案，
     不走渲染器 —— 那四条含 TOURING_NAMES() 这类构建期算出来的地名列表）。
   两处的差别只是「右侧是不是 <ul data-render>」，所以这一个函数按开关出两种结构，
   不再各写一份 —— 版式规则（图高跟随右列、50% 左列、≤900 单列）只需维护一处。
   o = {
     img, alt,         图（相对 assets/images/ 的文件名；alt 必须是 [en, zh]）
     title: [en,zh],   大标题（h2）
     lead:  [en,zh],   可选导语，排在 h2 下方
     note:  [en,zh],   可选眉题，排在 h2 上方（左对齐、小圆点前缀 —— 与全站 .eyebrow 不同形）
     list:  'assuranceSplit' 之类 → 出一个 <ul data-render="…">；不传则用 html
     html,             右侧静态内容（与 list 二选一）
     id                锚点 id
   }
   2026-09-23（Flora）历史：① 眉题删掉（只留大标题）；② 左图高度改成**跟随右列内容** ——
   原先按 4:5 撑到 770、后来写死 610，但英文文案比中文长，写死就会「右边撑高了、图露白」，
   所以最终方案是 grid stretch + figure:flex，图高 = 右列高，不写死任何像素（见 style.css 的 .assplit）。 */
function assuranceSplitSection(o) {
  const head = [
    o.note ? P('p', o.note[0], o.note[1], 'class="assplit__note"') : '',
    P('h2', o.title[0], o.title[1]),
    o.lead ? P('p', o.lead[0], o.lead[1], 'class="assplit__lead"') : '',
  ].join('\n          ');
  return `<section class="sec-white"${o.id ? ` id="${o.id}"` : ''}><div class="shell">
    <div class="assplit">
      <figure class="assplit__media">
        <img src="assets/images/${o.img}" ${at('alt', o.alt[0], o.alt[1])} loading="lazy" decoding="async">
      </figure>
      <div class="assplit__col">
        <div class="sec-head assplit__head">
          ${head}
        </div>
        ${o.list
          ? `<ul class="assplit__list" data-render="${o.list}"></ul>`
          : `<div class="assplit__facts">${o.html}</div>`}
      </div>
    </div>
  </div></section>`;
}

/* 首页六项承诺（上面那个函数的第一个调用方）。 */
function assuranceCommitments() {
  return assuranceSplitSection({
    id: 'commitments',
    img: 'mountain.png',
    alt: ['Yunnan mountains above the clouds', '云雾之上的云南群山'],
    title: ['Confidence At Every Step', '让每一步都更安心'],
    list: 'assuranceSplit'
  });
}

/* about 页「从健康项目到云南旅程」—— 用**首页那套旧版「错落卡」样式**（Flora 2026-09-23）：
   一行铺开的白卡，每张「小标签 → 正文」，偶数位整体下移（几何全在 .assure 里）。
   ⚠ 与首页六项承诺那个「左图右列」是两套东西，别互相套。
   ⚠ 卡片数（4）跟着 facts 走，改了数量 .assure 的列数要一起看 —— 6 列那档是给六张调的，
     四张会均分剩余宽度（grid 的 repeat(4) 见 .assure--band）。
   ⚠ 四条文案是 Flora 2026-09-22 手改回填的原文，**别顺手改写**；「旅行目的地」那条的地名
   列表由 TOURING_NAMES() 在构建期算出（运行时拿不到）→ 必须静态渲染，不能挂 [data-render]。 */
function aboutJourneyAssure() {
  const facts = [
    ['Healthcare Services', '健康项目',
     'Kunming: screening, TCM and dental care', '昆明：体检、中医与口腔诊疗'],
    ['TCM Wellness', '中医康养',
     'Chengjiang · Fuxian Lake: multi-day wellness stays', '澄江 · 抚仙湖：多日康养与恢复'],
    ['Travel Destinations', '旅行目的地', TOURING_NAMES(0), TOURING_NAMES(1)],
    ['How We Work', '合作方式',
     'CMT coordinates healthcare; partner agencies operate travel services',
     '健康项目由 CMT 协调，旅游行程由合作旅行社执行'],
  ];
  return `<section class="sec-white" id="journey-band"><div class="shell">
    <div class="sec-head">
      ${P('h2', 'From Healthcare To Your Yunnan Journey', '从健康项目到云南旅程')}
    </div>
    <div class="assure assure--band">
      ${facts.map((f) => `<article>
        ${P('h3', f[0], f[1])}
        ${P('p', f[2], f[3])}
      </article>`).join('')}
    </div>
  </div></section>`;
}

/* ---------------------------------------------------------------
   1. Home
   ---------------------------------------------------------------
   首页原「云南一日游」区块（sec-tint：七条一日游 + 昆明/大理条目数）
   已按 Flora 要求整块删除（2026-09-21）：日游入口不再出现在首页，
   改由目的地详情页的日游网格进入。原区块留档于 removed-content.md。
   ⚠ 这类「说明」必须写成 JS 注释，别写成 HTML 注释——HTML 注释会
     进产物，被 tmp/_check-dates.cjs 当作正文里的日期而误报。
   --------------------------------------------------------------- */
/* 首页收尾 footband：CTA 卡片浮在通栏实拍图上，与图合成一个区域（Flora 2026-09-21）。
   注意 aria-hidden 只能挂在图片上 —— CTA 里有链接，整个 section 标 aria-hidden
   会让屏幕阅读器直接忽略掉这个预约入口。 */
emit('index.html', page({
  file: 'index.html', nav: 'home', section: null, footerClass: 'site-footer--home',
  title: ['CMT Medical Travel — health and wellness trips in Yunnan',
          'CMT Medical Travel — 云南体检与康养之旅'],
  desc: ['Health screening, TCM wellness and dental care, paired with a Yunnan trip — a tailored plan, crafted around you.',
         '体检、中医康养与口腔诊疗，配上一趟云南之旅——为你量身定制。'],
  body: `
  <section class="hero" aria-labelledby="heroTitle">
    <div class="hero__media hero__media--video" aria-hidden="true">
      <video autoplay muted loop playsinline preload="auto" poster="assets/desktop_cover.webp">
        <source src="assets/desktop_cover.webp" type="video/webm">
      </video>
    </div>
    <div class="hero__scrim" aria-hidden="true"></div>
    <div class="hero__content">
      <p class="hero__eyebrow" ${d('Light medical care · Yunnan travel', '轻医疗 · 云南之旅')}>Light medical care · Yunnan travel</p>
      <h1 id="heroTitle"><span ${d('See Yunnan.', '看山看水')}>See Yunnan.</span> <span ${d('See to your health.', '颐养身心')}>See to your health.</span></h1>
      <p class="hero__lead" ${d('From mountain lakes to a calmer you — a Yunnan trip crafted around you.',
                                '从湖光山色到身心调养，定制属于你的云南之旅。')}>From mountain lakes to a calmer you — a Yunnan trip crafted around you.</p>
      ${btnPair({
        cls: 'hero__actions',
        a: [REQ, 'Request a Call', '预约回电'],
        b: ['journeys.html', 'Explore Itineraries', '探索行程']
      })}
      <ul class="hero__trust">
        <li>${ICON.tick}<span ${d('Tailor-made to you', '为你量身定制')}>Tailor-made to you</span></li>
        <li>${ICON.tick}<span ${d(MT.CITIES.length + ' destinations in Yunnan', MT.CITIES.length + ' 个云南目的地')}>${MT.CITIES.length} destinations in Yunnan</span></li>
        <li>${ICON.tick}<span ${d('Trusted clinics & care', '甄选机构与医护')}>Trusted clinics &amp; care</span></li>
        <li>${ICON.tick}<span ${d('Confirmed ' + MT.SITE.leadDays + ' days ahead', '出行前 ' + MT.SITE.leadDays + ' 天确认')}>Confirmed ${MT.SITE.leadDays} days ahead</span></li>
      </ul>
    </div>
    <a class="hero__scroll" href="#howband" ${at('aria-label', 'Scroll', '向下浏览')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6M12 4v15"/></svg></a>
  </section>

  <section class="sec-white-2" id="howband"><div class="shell">
    <div class="sec-head sec-head--row">
      <div>
        ${P('h2', 'Find The Journey That Fits You', '选择适合你的行程')}
        ${P('p', 'Explore Each Itinerary, Day By Day.', '查看完整的每日安排，了解每条行程的节奏与特色。', 'class="sec-head__lead"')}
      </div>
      <a class="linkmore" href="journeys.html" ${d('View All', '全部行程')}>View All ${ICON.arrow}</a>
    </div>
    <div class="grid2" data-render="journeysHero"></div>
  </div></section>

  <section class="journey"><div class="shell">
    <div class="journey__head">
      ${P('h2', 'Four simple steps', '简单四步')}
      ${P('p', 'Every step confirmed ' + numEn(MT.SITE.leadDays) + ' days before you fly', '每一步都在出行前 ' + MT.SITE.leadDays + ' 天确认', 'class="journey__note"')}
    </div>
    <ol data-render="stepband"></ol>
  </div></section>

  <section class="sec-white"><div class="shell">
    <div class="sec-head sec-head--row">
      <div>
        ${P('h2', 'Where Would You Like To Go', '看看你想去哪里')}
        ${P('p', 'Lakes, Mountains, And Towns With Their Own Pace Of Healing.', '从湖畔到山间，每个目的地都有自己的疗愈节奏，也藏着值得一去的一日风景。', 'class="sec-head__lead"')}
      </div>
      <a class="linkmore" href="destinations.html" ${d('View All', '全部目的地')}>View All ${ICON.arrow}</a>
    </div>
    <div class="city-arc" data-render="cities"></div>
  </div></section>

  ${assuranceCommitments()}

  ${closing(['Dreaming of a healthier trip to Yunnan? Tell us.', '想来一场更健康的云南之旅？告诉我们。'],
            ['Send us what you have in mind and we will shape a tailored itinerary and price for you.', '告诉我们你的想法，我们会为你定制行程与报价。'],
            ['Request a Call', '预约回电'])}
  `
}));

/* ---------------------------------------------------------------
   4. Journeys overview
   --------------------------------------------------------------- */
emit('journeys.html', page({
  file: 'journeys.html', nav: 'journeys', section: 'journeys',
  title: ['Journeys — CMT Medical Travel', '行程 — CMT Medical Travel'],
  desc: ['Group journeys with full day-by-day outlines: the Fuxian Lake 8-day wellness departure and the France 6-day retreat.',
         '含完整逐日安排的跟团行程：抚仙湖 8 日养生团、法国团 6 天 5 晚。'],
  body: `
  ${pagehead({
    h1: ['One Plan, Your Wellness Journey', '从一份行程起，想象你的康养时光'],
    eyebrow: ['Journeys', '行程'],
    lead: ['Explore Each Itinerary, Day By Day.',
           '查看完整的每日安排，了解每条行程的节奏与特色。'],
    photo: 'assets/images/journeys-hero-1920x690.jpg',
    hero: true,
  })}
  <section class="sec-white"><div class="shell">
    <div class="grid3" data-render="journeys"></div>
  </div></section>

  ${closing(['Different Dates, Duration, Or A Private Group?', '想换日期、天数，或单独组团？'],
            ['Everything above is a sample. Tell us when you can travel and how many are coming, and we will draft the programme, the days and the price to fit.', '以上都是参考行程。告诉我们你能出行的时间与人数，我们按这个起草行程、天数与报价。'],
            ['Request a Call', '预约回电'])}
  `
}));

/* ---------------------------------------------------------------
   5. One page per journey
   --------------------------------------------------------------- */
MT.JOURNEYS.forEach((j) => {
  const file = j.slug + '.html';
  /* Catalogued destinations link to their page; route-only stops
     (no destination page — no client content supplied) stay as
     plain text so the stated route is not silently shortened. */
  const cityList = j.cities.map((id) => {
    const c = MT.CITIES.find((x) => x.id === id);
    if (c) return A(c.slug + '.html', c.t[0], c.t[1]);
    const r = MT.ROUTE_ONLY.find((x) => x.id === id);
    return r ? `<span ${d(r.t[0], r.t[1])}>${esc(r.t[0])}</span>` : '';
  }).filter(Boolean).join(' · ');

  const cost = j.cost ? `<section class="sec-white-2"><div class="shell">
    <div class="split">
      <div>
        <div class="sec-head">
          ${P('p', 'Cost breakdown', '费用明细', 'class="eyebrow"')}
          ${P('h2', 'What the per-person price covers', '人均费用的构成')}
        </div>
        <p class="mt-s" style="color:var(--color-text-muted)">${P('span', j.cost.note[0], j.cost.note[1])}</p>
        <ul class="cost mt-m">
          ${j.cost.rows.map((r) => `<li><span ${d(r[0][0], r[0][1])}>${esc(r[0][0])}</span><b>¥${esc(r[1])}</b></li>`).join('')}
        </ul>
        <div class="cost__sum">
          <span ${d(j.cost.total[0], j.cost.total[1])}>${esc(j.cost.total[0])}</span>
          <b>¥${esc(j.cost.total[2])}</b>
        </div>
      </div>
      <div class="sticky-side">
        <div class="callout"><div>${P('b', 'Indicative price', '参考价格')}${P('p', 'Shown as a per-person indication. Final pricing is confirmed once we know your party size, dates and hotel preference.', '此处为单人参考价。最终价格会在我们确认你的同行人数、日期与酒店偏好后一并确定。')}</div></div>
      </div>
    </div>
  </div></section>` : '';

  emit(file, page({
    file, nav: 'journeys', section: 'journeys',
    title: [j.t[0] + ' — CMT Medical Travel', j.t[1] + ' — CMT Medical Travel'],
    desc: [j.summary[0], j.summary[1]],
    body: `
  ${pagehead({
    h1: j.t,
    eyebrow: j.tag,
    lead: j.summary,
    photo: j.heroImg,
    crumb: [['Home', '首页', 'index.html'], ['Journeys', '行程', 'journeys.html'], j.t],
    actions: reqCta(j.slug)
  })}
  <section class="sec-white"><div class="shell">
    <div class="split">
      <div>
        ${P('p', 'Day by day', '逐日行程', 'class="section-label"')}
        ${dayline(j.itinerary)}
      </div>
      <div class="sticky-side">
        ${specTable(j.spec)}
        <div class="mt-m">
          ${P('p', 'Destinations on this route', '本行程涉及目的地', 'class="section-label"')}
          <div style="font-size:15px;color:var(--color-text)">${cityList}</div>
        </div>
        ${j.gift ? `<div class="mt-m callout"><div>${P('b', 'Included gift', '随团赠礼')}${P('p', j.gift[0], j.gift[1])}${photoStrip(j.giftImgs, null, true)}</div></div>` : ''}
        <div class="mt-m">${ctaCard(['Enquire About This Trip', '预约这条行程'], j.slug, ['Share your dates and group size, and we will confirm availability and pricing.', '留下出行时间和人数，我们会回复档期与报价。'])}</div>
      </div>
    </div>
  </div></section>

  <section class="sec-white-2"><div class="shell">
    <div class="sec-head">
      ${P('p', 'What is included', '费用包含', 'class="eyebrow"')}
      ${P('h2', 'Everything priced into this journey', '本行程已含项目')}
    </div>
    <div class="includes-2col mt-m">${checksBi(j.includes)}</div>
  </div></section>

  ${cost}
  `
  }));
});

/* ---------------------------------------------------------------
   7. One page per day tour
   --------------------------------------------------------------- */
MT.DAYTOURS.forEach((t) => {
  const c = MT.CITIES.find((x) => x.id === t.city);
  const file = 'day-tour-' + t.slug + '.html';
  const dur = t.type === 'half' ? ['Half day', '半日'] : (t.type === 'multi' ? ['2 days', '2 天'] : ['Full day', '一日']);

  /* 老线路的 usp 是空的 —— 空串必须连换行一起省掉，否则模板里多出一行
     只有缩进的空白，产物跟改动前就不是逐字节相同了。 */
  const uspRow = t.usp.length
    ? `
            <div class="tags usp-row">${t.usp.map((u) => `<span class="tag" ${d(u[0], u[1])}>${esc(u[0])}</span>`).join('')}</div>`
    : '';
  /* 费用包含/不含与须知都是可选块 —— 客户新给的两条普洱线路，原始资料里没有
     费用两栏，空列表渲染出来就是两个空标题，所以整块按内容判断要不要出。 */
  /* 缩进刻意与原模板对齐 —— 老线路（七条）的产物因此逐字节不变，
     快照对账时不会被一堆纯空白差异淹没。 */
  const feesBlock = (t.incl.length || t.excl.length)
    ? `
        <div class="split--even split">
          <div>
            ${P('p', 'Included', '费用包含', 'class="section-label"')}
            ${checksBi(t.incl)}
          </div>
          <div>
            ${P('p', 'Not included', '费用不含', 'class="section-label"')}
            ${crossesBi(t.excl)}
          </div>
        </div>`
    : '';
  const notesBlock = t.notes.length
    ? `
        <div${feesBlock ? ' class="mt-l"' : ''}>${P('p', 'Good to know', '参团须知', 'class="section-label"')}${checksBi(t.notes)}</div>`
    : '';
  const detail = (feesBlock || notesBlock)
    ? `<section class="sec-white-2"><div class="shell">${feesBlock}${notesBlock}
      </div></section>`
    : '';

  const body = `<section class="sec-white"><div class="shell">
        <div class="split">
          <div>${uspRow}
            ${P('p', 'Itinerary', '行程安排', 'class="section-label"')}
            ${stopline(t.stops)}
          </div>
          <div class="sticky-side">
            ${specTable([
              [['Region', '区域'], [c.t[0], c.t[1]]],
              [['Duration', '时长'], dur],
              [['Stops', '停留点'], [String(t.stops.length) + ' stops', t.stops.length + ' 个停留点']]
            ])}
            <div class="mt-m">${ctaCard(t.t, 'day-tour-' + t.slug)}</div>
          </div>
        </div>
      </div></section>

      ${detail}`;

  emit(file, page({
    /* 顶部导航高亮跟着面包屑走：日游现在归在「目的地」这一支下。 */
    file, nav: 'destinations', section: 'destinations',
    title: [t.t[0] + ' — CMT Medical Travel', t.t[1] + ' — CMT Medical Travel'],
    desc: [t.intro ? t.intro[0] : t.t[0] + ' — a Yunnan day tour.', t.intro ? t.intro[1] : t.t[1] + ' —— 云南日游。'],
    body: `
  ${pagehead({
    h1: t.t,
    eyebrow: [c.t[0], c.t[1]],
    lead: t.intro ? t.intro : [t.t[0], t.t[1]],
    slim: true,
    /* 日游列表页（day-tours.html）2026-09-21 已按 Flora 要求删除，
       所以面包屑改走「首页 > 目的地 > 该城市 > 本条线路」——这也是现在
       唯一能到达日游的路径（各城市目的地页的 citytours 网格）。 */
    crumb: [['Home', '首页', 'index.html'], ['Destinations', '目的地', 'destinations.html'], [c.t[0], c.t[1], c.slug + '.html'], t.t],
    /* 2026-09-22 Flora：页头这枚按钮原先走的是老的 .hero__cta--primary（墨绿实底），
       跟目的地页头（reqCta / .btnpair__btn--solid，白底深色圆钮）不是一套，看着两样。
       统一改走 reqCta，与 destination-*.html 页头逐字节同款。 */
    actions: reqCta('day-tour-' + t.slug)
  })}
  ${body}
  `
  }));
});

/* ---------------------------------------------------------------
   8. Destinations overview
   --------------------------------------------------------------- */
/* 目的地分栏：左一张主卡（澄江）+ 右 2×2，见 site.js citySplitCards() 与 .city-split 样式 */
emit('destinations.html', page({
  file: 'destinations.html', nav: 'destinations', section: 'destinations',
  title: ['Destinations — CMT Medical Travel', '目的地 — CMT Medical Travel'],
  desc: ['Kunming, Chengjiang and Fuxian Lake, Dali, Pu\'er and Lincang.',
         '昆明、澄江与抚仙湖、大理、普洱与临沧。'],
  body: `
  ${pagehead({
    h1: ['Where Every Stop Restores You', '五处山水，皆是养处'],
    eyebrow: ['Destinations', '目的地'],
    /* 客户给的实拍图（Flora 2026-09-21）。注意这是大理洱海的全景，
       代表「云南目的地」这一层目录页；五个城市页各自需要自己的图，
       在没拿到之前不要把这同一张铺到城市页上（会让普洱/临沧配大理的图）。 */
    photo: 'assets/images/destination-hero.jpg',
    hero: true,
    lead: ['Lakes, Mountains, And Towns With Their Own Pace Of Healing.',
           '从湖畔到山间，每个目的地都有自己的疗愈节奏，也藏着值得一去的一日风景。'],
  })}
  <section class="sec-white"><div class="shell">
    <div class="dest-guide">
      <div class="dest-guide__head">
        ${P('h2', 'Where to begin', '从哪里开始')}
        ${P('p', 'Three priorities, ' + numEn(MT.CITIES.length) + ' destinations', '三种侧重，' + numZh(MT.CITIES.length) + '处目的地', 'class="dest-guide__note"')}
      </div>
      <ol>
        <li>
          <span class="dest-guide__ico">${ICON.cal}</span>
          ${P('h3', 'Start in Kunming', '首选昆明')}
          ${P('p', 'For checkups and clinical programmes.', '做体检和临床项目。')}
        </li>
        <li>
          <span class="dest-guide__ico">${ICON.pin}</span>
          ${P('h3', 'Fuxian Lake, Chengjiang', '澄江抚仙湖')}
          ${P('p', 'Home base for multi-day TCM retreats.', '多日中医康养的驻地。')}
        </li>
        <li>
          <span class="dest-guide__ico">${ICON.clock}</span>
          ${P('h3', 'Slow Recovery', '慢节奏恢复')}
          ${P('p', listEn(TOURING.map((c) => c.short[0])) + ' for gentler recovery travel.', listZh(TOURING.map((c) => c.short[1])) + '，适合恢复期慢慢走。')}
        </li>
      </ol>
    </div>
    <div data-render="citySplit"></div>
  </div></section>

  ${closing(['Plan your destination list', '定制你的目的地路线'],
            ['Tell us the cities and the clinical line you care about, and we will sequence your route around travel times.',
             '告诉我们你想去的城市与关心的项目，我们会结合城市间交通为你排好顺序。'],
            ['Request a Call', '预约回电'])}
  `
}));

/* ---------------------------------------------------------------
   9. One page per destination
   --------------------------------------------------------------- */
MT.CITIES.forEach((c) => {
  const file = c.slug + '.html';
  /* Same rule as cityTours() in assets/site.js: catalogued here, or cross-listed. */
  const tours = MT.DAYTOURS.filter((t) => t.city === c.id || (t.alsoIn || []).indexOf(c.id) > -1);
  /* Tours that run here but are joined from another city — their cards carry
     that base city, so the page says so instead of looking inconsistent. */
  const joinBases = tours
    .filter((t) => t.city !== c.id)
    .map((t) => MT.CITIES.find((x) => x.id === t.city))
    .filter(Boolean)
    .filter((x, i, a) => a.indexOf(x) === i);
  const journeys = MT.JOURNEYS.filter((j) => j.cities.indexOf(c.id) > -1);

  emit(file, page({
    file, nav: 'destinations', section: 'destinations',
    title: [c.t[0] + ' — CMT Medical Travel', c.t[1] + ' — CMT Medical Travel'],
    desc: [c.summary[0], c.summary[1]],
    body: `
  ${pagehead({
    slim: true,
    /* Flora 2026-09-22 手加：5 个 destination-* 页头统一挂一张通用背景图
       （style.css 的 .pagehead--desthero，走 CSS background-image，
       所以这里不加 photo，也就没有 .pagehead__scrim 元素 —— 压暗由 CSS 补）。 */
    cls: 'pagehead--desthero',
    h1: c.t,
    eyebrow: c.region,
    lead: c.summary,
    crumb: [['Home', '首页', 'index.html'], ['Destinations', '目的地', 'destinations.html'], c.t],
    /* 目的地内容不再单独占一个 section，精简成一行标签并进 pagehead；
       带勾的整句列表 → 标签，逐条仍是可核实的项目。落地产品线不在这放。 */
    facts: factsRow(c.highlights),
    actions: reqCta(c.slug)
  })}

  ${tours.length ? `<section class="sec-white-2"><div class="shell">
    <div class="sec-head">
      ${P('p', 'Day tours at this destination', '该地日游', 'class="eyebrow"')}
      ${P('h2', 'Day tours at ' + c.t[0], c.t[1] + ' · 日游线路')}
    </div>
    ${joinBases.length ? `<div class="notice">${ICON.info}<div>${P('b',
      'Joins from ' + joinBases.map((b) => b.t[0]).join(', '),
      joinBases.map((b) => b.t[1]).join('、') + '集合出发')}${P('p',
      'The tour itself runs at ' + c.t[0] + ' — the source itinerary assembles at ' + joinBases.map((b) => b.t[0]).join(', ') + ' and drives out, which is why the card below is badged with the joining city.',
      '线路本身在' + c.t[1] + '，行程原始安排在' + joinBases.map((b) => b.t[1]).join('、') + '集合后乘车前往，因此下方卡片标注的是集合城市。')}</div></div>` : ''}
    <div class="grid3" data-render="citytours" data-city="${c.id}"></div>
  </div></section>`
  : (c.heldBack ? `<section class="sec-white-2"><div class="shell">
    <div class="notice">${ICON.info}<div>${P('b', 'Day tours held back — ' + c.heldBackCount + ' of them', '日游暂缓收录——共 ' + c.heldBackCount + ' 条')}${P('p', 'The client has a full day-tour catalogue for this destination, but every source PDF is an image scan with no text layer, so no itinerary could be extracted. Those products have been removed from the build rather than published as empty pages. They come back as soon as a text version or an OCR pass is available.', '客户在此有完整的日游目录，但源 PDF 全部是无文字层的图片扫描件，提取不出行程。这些产品已从原型中移除，而不是作为空页面发布。一旦拿到文字版或完成 OCR 即可补回。')}</div></div>
  </div></section>` : '')}

  ${journeys.length ? `<section class="sec-white"><div class="shell">
    <div class="sec-head">
      ${P('p', 'Journeys including it', '包含该地的行程', 'class="eyebrow"')}
      ${P('h2', 'On these itineraries', '下列行程会经过')}
    </div>
    <div class="grid3" data-render="journeys"></div>
  </div></section>` : ''}

  ${!tours.length ? `<section class="${journeys.length ? 'sec-white-2' : 'sec-white'}"><div class="shell">
    <div class="solo-card">${ctaCard(c.t, c.slug,
      ['Tell us what interests you and when you\u2019d like to go, and we\u2019ll shape a plan that includes this place.',
       '告诉我们你对什么感兴趣、想什么时候出发，我们会据此规划含这座城市的行程。'])}</div>
  </div></section>` : ''}
  `
  }));
});

/* ---------------------------------------------------------------
   11. Resources
   --------------------------------------------------------------- */
/* Resources page is on hold (no article bodies yet) and is no longer
   generated or linked from the nav/footer. Data stays in MT.RESOURCES
   so it can be re-enabled later. To bring it back: set this to true. */
const SHOW_RESOURCES = false;
/* eslint-disable */
if (SHOW_RESOURCES) emit('resources.html', page({
  file: 'resources.html', nav: 'resources', section: null,
  title: ['Resources — CMT Medical Travel', '资源中心 — CMT Medical Travel'],
  desc: ['Guides, destination notes and plain-language explainers on care in Yunnan.',
         '关于云南健康之旅的指南、目的地笔记与医学科普。'],
  body: `
  ${pagehead({
    h1: ['Resources', '资源中心'],
    eyebrow: ['Resources', '资源中心'],
    lead: ['One content hub for everything you might want to read before you travel — how the care works, what to expect, and why a place suits a calm recovery.',
           '出发前想了解的一切，都在这里——项目怎么做、你会经历什么，以及某个地方为什么适合安静休养。'],
    crumb: [['Home', '首页', 'index.html'], ['Resources', '资源中心']]
  })}
  <section class="sec-white"><div class="shell">
    <div class="artlist" data-render="resrows"></div>
    <div class="mt-l">${notice(['Article bodies are not written yet', '文章正文尚未撰写'],
      ['The four pieces below are titles and summaries only — they need source material from the clinical and operations side before they can be drafted.', '以下四篇目前只有标题与摘要——需要临床与运营侧提供素材后才能起草正文。'])}</div>
  </div></section>

  <section class="sec-white-2"><div class="shell">
    <div class="sec-head">
      ${P('p', 'Categories', '分类', 'class="eyebrow"')}
      ${P('h2', 'What you’ll find here', '这里有什么')}
    </div>
    <div class="grid3">
      <article class="step"><span class="step__n">01</span>${P('h3', 'Guides', '指南')}${P('p', 'Plain-language guides — what to confirm, when, and why it matters.', '平实的指南——该确认什么、什么时候确认、为什么重要。', 'style="margin-top:8px;font-size:15px;line-height:1.75;color:var(--color-text-muted)"')}</article>
      <article class="step"><span class="step__n">02</span>${P('h3', 'Destinations', '目的地')}${P('p', 'Why a place suits a calm recovery or a good day trip, and the practicalities.', '某个地方为什么适合安静休养或一日游，以及实际安排。', 'style="margin-top:8px;font-size:15px;line-height:1.75;color:var(--color-text-muted)"')}</article>
      <article class="step"><span class="step__n">03</span>${P('h3', 'Clinical', '临床')}${P('p', 'Plain-language explainers on what a treatment involves and what to expect.', '用平实语言解释某项治疗包含什么、你会期待什么。', 'style="margin-top:8px;font-size:15px;line-height:1.75;color:var(--color-text-muted)"')}</article>
    </div>
  </div></section>

  ${closing(['Want the source pack?', '需要资料包？'],
            ['Hospital and base profiles, product lists and the day-tour PDFs are available on request.', '医院与基地介绍、产品清单及日游 PDF 可按需提供。'],
            ['Ask for the pack', '索取资料包'])}
  `
}));

/* ---------------------------------------------------------------
   12. About
   --------------------------------------------------------------- */
const TOTALS = [   // ⚠ 已无引用：about 页顶部的四个数字卡（grid4）由 Flora 2026-09-22 手删，生成器同步移除；留档，要恢复就把 grid4 三行加回 about 段
  [String(MT.LINES.length), ['care services', '种健康服务']],
  [String(MT.CITIES.length), ['destinations', '个目的地']],
  [String(MT.JOURNEYS.length), ['sample journeys', '条参考行程']],
  ['7', ['days of lead time', '天规划周期']]
];
/* about 页「三点」—— 中轴 zigzag 图文（Flora 2026-09-22 给的三张配套实拍图）。
   图片规格：1600×1067（3:2），与 .zigzag__media img 的 aspect-ratio:3/2 一致 → 零裁切。
   奇数项（下标 0/2）图在左、偶数项（下标 1）图在右，由 --flip 类负责翻转。
   正文按 Flora 2026-09-23 给的新版回填：三条讲的是
   不同的事（提供什么 / 怎么协调 / 服务边界），改文案时别让它们互相重复。 */
const ZIGZAG = [
  {
    img: 'about-coordination-1600x1067.jpg',
    alt: ['An advisor walking a guest through a printed itinerary',
          '顾问与客人一起翻看行程手册'],
    h3: ['What We Offer', '我们为你安排什么'],
    p: ['We connect you with health screening, TCM wellness, dental care and bespoke programmes in Yunnan, coordinating providers, appointments, bilingual support and travel arrangements.',
        '在云南为你连接健康体检、中医康养、口腔诊疗与专项定制，并协助安排机构、预约、双语陪诊和相关行程衔接。']
  },
  {
    img: 'about-consultation-space-1600x1067.jpg',
    alt: ['A quiet consultation room looking out over a lake',
          '面朝湖景的安静咨询室'],
    h3: ['How We Coordinate', '我们如何协调'],
    p: ['Tell us what you are looking for, when you plan to travel and what matters to you. We then outline suitable healthcare options and travel arrangements. Clinical services are provided by partner institutions, while travel services are operated by a partner travel agency.',
        '你告诉我们想了解的项目、出行时间和基本需求，我们整理适合的健康项目与行程建议。临床服务由合作机构提供，旅游行程由合作旅行社负责执行。']
  },
  {
    img: 'about-lakeside-wellness-1600x1067.jpg',
    alt: ['Two guests sharing tea on a lakeside deck',
          '两位客人在湖畔平台上喝茶'],
    h3: ['The Scope Of Our Service', '我们的服务边界'],
    p: ['CMT Health coordinates healthcare services but does not provide medical diagnoses or operate the travel itinerary. Travel services require a separate contract with the travel agency, whose terms govern pricing, changes, cancellations and responsibilities.',
        'CMT Health 负责健康项目的沟通与协调，不提供医疗诊断，也不是旅游行程的实际承运方。旅游服务需与旅行社另行签署合同，具体费用、退改和责任以旅行社合同为准。']
  }
];
/* ⚠ 关于 about.html：
   ① 页头实拍图 = 首页 hero 视频的封面 assets/desktop_cover.webp（1280×720, 16:9），
      ≤640px 走 <picture> 换竖构图版 assets/mobile_cover.webp（400×736）；
      两版的取景都在 style.css 的 .pagehead--cover-left 里写（photoPos 已废弃——
      行内样式会顶掉窄屏取景规则，取景一律用修饰类走 CSS）。
   ② 「从健康项目到云南旅程」这块（aboutJourneySplit()）：
      文案来自 Flora 2026-09-22 的手改回填（当时是 sec-head mt-l + .facts--band 四点，
      而生成器里原是「Where we work」+ Clinical delivery / Wellness base / Touring /
      Get in touch）。2026-09-23 她要新版式，四条原文照搬进 aboutJourneySplit()，
      只换版式不改文案。手改内容只存在于产物里的话，重跑 build 就会被冲掉 —— 已回填。
   ③ 模板串内部的纯文本区会原样进产物：要写说明请写到这里，或写进 ${} 表达式里
      （表达式里的注释是正常 JS 注释，不会输出）；别把块注释摆在模板串的纯文本区。 */
emit('about.html', page({
  file: 'about.html', nav: 'about', section: null,
  title: ['About — CMT Medical Travel', '关于我们 — CMT Medical Travel'],
  desc: ['CMT Medical Travel arranges health screening, TCM wellness, dental care and bespoke programmes in Yunnan — every trip tailored to you.',
         'CMT Medical Travel 在云南为你安排体检、中医康养、口腔诊疗与个性化定制——每一趟都围绕你打造。'],
  body: `
  ${pagehead({
    h1: ['About CMT Medical Travel', '关于 CMT Medical Travel'],
    eyebrow: ['About us', '关于我们'],
    /* 首页那条 hero 视频的封面图（1280×720, 16:9）复用到这里当页头实拍。
       图比 pagehead 高，按 16:9 铺满宽幅会被裁掉主体（人物偏右下）→
       宽屏取左下（裁掉上方天空，留下湖面与亭台）；≤640px 换竖构图版
       assets/mobile_cover.webp（400×736，同一场景的中心裁切，人物居中），
       否则横图在手机上横向只露一条，怎么调取景都救不回来。
       取景写在 CSS 的 .pagehead--cover-left 里，按断点分化。 */
    cls: 'pagehead--cover-left',
    photo: 'assets/images/about-hero-1920x690.jpg',
    photoMobile: 'assets/mobile_cover.webp',
    lead: ['We arrange health care and quiet recovery in Yunnan, tailored to you. Tell us what you need and we shape the plan, the clinic and the itinerary around it — then you finalise in your own way.',
           '我们在云南为你安排健康项目与宁静的休养行程，一切都围绕你定制。告诉我们你的需求，我们会据此安排项目、机构与行程。'],
  })}

  <section class="sec-white"><div class="shell">
    <div class="sec-head">
      ${P('h2', 'Why CMT', '为什么选 CMT')}
    </div>

    <div class="zigzag">
      ${ZIGZAG.map((z, i) => `
      <div class="zigzag__item${i % 2 ? ' zigzag__item--flip' : ''}">
        <figure class="zigzag__media">
          <img src="assets/images/${z.img}" alt="${esc(z.alt[0])}" ${at('alt', z.alt[0], z.alt[1])} loading="lazy" decoding="async">
        </figure>
        <div class="zigzag__copy">
          ${P('h3', z.h3[0], z.h3[1])}
          ${P('p', z.p[0], z.p[1])}
        </div>
      </div>`).join('')}
    </div>
  </div></section>

  ${aboutJourneyAssure()}

  <section class="sec-white"><div class="shell">
    <div class="sec-head">
      ${P('h2', 'FAQ', '常见问题')}
    </div>
    <div class="faq" data-render="faq"></div>
  </div></section>

  ${closing(['Plan your trip with us', '定制你的专属之旅'],
            ['Every trip is shaped around you — tell us what you would like and we will send a tailored plan and price.',
             '每一趟都围绕你打造——告诉我们你的想法，我们为你定制行程与报价。'],
            ['Request a Call', '预约回电'])}
  `
}));

/* ---------------------------------------------------------------
   13. Request a proposal — the only page in the build with a form.
       Everything else links here.
   --------------------------------------------------------------- */
emit(REQ, page({
  file: REQ, nav: '', section: null,
  title: ['Request a Call — CMT Medical Travel', '预约回电 — CMT Medical Travel'],
  desc: ['Tell us what you’re looking for and we will tailor a health-and-travel plan and price for you.',
         '告诉我们你的想法，我们会为你定制一整套健康与旅行方案和报价。'],
  body: `
  <section class="reqhero" aria-labelledby="reqTitle">
    <div class="shell reqhero__inner">
      <div class="reqhero__copy">
        ${P('p', 'Request a Call', '预约回电', 'class="reqhero__eyebrow"')}
        <h1 class="reqhero__title" id="reqTitle"><span ${d('Tell us what you need.', '告诉我们你的想法')}>Tell us what you need.</span> <span ${d('We will shape the rest.', '剩下的交给我们')}>We will shape the rest.</span></h1>
        <p class="reqhero__lead" ${d(
          'Every trip is shaped around you — tell us what you would like and we will send a tailored plan and price.',
          '每一趟都围绕你打造——告诉我们你的想法，我们为你定制行程与报价。'
        )}>Every trip is shaped around you — tell us what you would like and we will send a tailored plan and price.</p>
      </div>
      <div class="reqhero__card">
        ${P('p', 'Tell us about your trip', '说说你的计划', 'class="section-label"')}
        <div data-render="enquiry"></div>
      </div>
    </div>
  </section>`
}));

/* ---------------------------------------------------------------
   收尾：记录本轮指纹 + 轮转旧备份
   --------------------------------------------------------------- */
fs.mkdirSync(BAK_ROOT, { recursive: true });
SOURCES.forEach((src) => {
  const p = path.join(DIR, src);
  if (!fs.existsSync(p)) return;
  const cur = fs.readFileSync(p, 'utf8');
  if (PREV[src] !== undefined && PREV[src] !== hash(cur)) backup(src, cur);
  NEXT[src] = hash(cur);
});
fs.writeFileSync(MANIFEST, JSON.stringify(NEXT, null, 1), 'utf8');
const oldBaks = fs.readdirSync(BAK_ROOT).filter((n) => /^\d{8}-\d{6}$/.test(n)).sort();
oldBaks.slice(0, Math.max(0, oldBaks.length - KEEP_BAKS))
  .forEach((n) => fs.rmSync(path.join(BAK_ROOT, n), { recursive: true, force: true }));

/* ---------------------------------------------------------------
   Done
   --------------------------------------------------------------- */
if (backedUp.length) {
  console.log('\n覆写前已备份 ' + backedUp.length + ' 个文件 → ' +
              path.relative(DIR, BAK_DIR));
}
if (handEdited.length) {
  console.log('\n⚠ 以下产物与上次构建不一致，疑似在生成器之外被手改过（已备份）：');
  handEdited.forEach((f) => console.log('   · ' + f));
  console.log('  改文案请改 build.cjs / assets/data*.js —— 直接改 .html 下次重建照样会丢。');
}
console.log('Wrote ' + FILES.length + ' pages to ' + DIR);
console.log(FILES.join('\n'));
