/* ==============================================================
   CMT Medical Travel — runtime
   --------------------------------------------------------------
   Responsibilities (kept deliberately small):
     1. language switch — swaps data-en / data-zh in place
     2. renders the repeated card grids from window.MT
     3. enquiry form behaviour
     4. sticky-header shadow + mobile menu

   Header nav, sub-nav, footer and all page copy are written
   statically by build.cjs, so navigation works even without JS.
   ============================================================== */
(function () {
  'use strict';

  var MT = window.MT;
  if (!MT) { console.error('window.MT missing — data.js not loaded'); return; }

  /* ------------------------------------------------------------
     Language
     ------------------------------------------------------------ */
  var LANG = (function () {
    try {
      var m = /[?&]lang=([^&#]+)/.exec(window.location.search);
      if (m) return /^zh/i.test(decodeURIComponent(m[1])) ? 'zh' : 'en';
    } catch (e) {}
    try {
      var s = window.localStorage.getItem('cmt-lang');
      if (s === 'zh' || s === 'en') return s;
    } catch (e) {}
    return 'en';
  })();

  function pick(pair) {
    if (!pair) return '';
    return LANG === 'zh' ? (pair[1] !== undefined ? pair[1] : pair[0]) : pair[0];
  }
  function tx(key) {
    var t = MT.T[LANG] || MT.T.en;
    if (t[key] !== undefined) return t[key];
    return (MT.T.en[key] !== undefined) ? MT.T.en[key] : key;
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  /* itinerary slots are [time, en, zh] */
  function slot(s) {
    return LANG === 'zh' ? (s[2] !== undefined ? s[2] : s[1]) : s[1];
  }
  function cityById(id) {
    for (var i = 0; i < MT.CITIES.length; i++) if (MT.CITIES[i].id === id) return MT.CITIES[i];
    return null;
  }
  /* Day tours that belong to a destination: either catalogued under it
     (`city`) or cross-listed via `alsoIn` — e.g. the Fuxian Lake tour runs
     at Chengjiang but assembles in Kunming, so it shows on both pages. */
  function cityTours(id) {
    return MT.DAYTOURS.filter(function (d) {
      return d.city === id || (d.alsoIn || []).indexOf(id) > -1;
    });
  }

  /* ------------------------------------------------------------
     Icons
     ------------------------------------------------------------ */
  var S = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  var I = {
    arrow: '<svg ' + S + '><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    arrowUpRight: '<svg ' + S + '><path d="M7 17 17 7M7 7h10v10"/></svg>',
    chev: '<svg ' + S + '><path d="M9 6l6 6-6 6"/></svg>',
    tick: '<svg ' + S + ' stroke-width="2.2"><path d="M20 6 9 17l-5-5"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M3 12h18"/><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',
    cal: '<svg ' + S + '><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/></svg>',
    pin: '<svg ' + S + '><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>',
    clock: '<svg ' + S + '><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    info: '<svg ' + S + '><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>',
    health: '<svg ' + S + '><path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1z"/></svg>',
    transport: '<svg ' + S + '><path d="M4 16V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9"/><path d="M4 16h16M7 20h.01M17 20h.01M6 10h12"/></svg>',
    meal: '<svg ' + S + '><path d="M5 3v8a3 3 0 0 0 6 0V3M8 11v10M17 3c-1.7 1.6-2 3.4-2 5.5S16 12 17 12s2-.4 2-3.5S18.7 4.6 17 3zM17 12v9"/></svg>',
    stay: '<svg ' + S + '><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></svg>',
    service: '<svg ' + S + '><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    insurance: '<svg ' + S + '><path d="M12 3l8 3v6c0 5-3.4 8.4-8 9.7C7.4 20.4 4 17 4 12V6z"/><path d="M9 12l2 2 4-4"/></svg>'
  };

  /* 日游卡右上角的圆形箭头（Flora 2026-09-22）：整张卡本身就是 <a href="day-tour-*.html">，
     箭头只承担「点进去看详情」的视觉提示与点击热区，不需要额外挂 JS。
     外观（半透明白圆底 + 深色箭头）全在 style.css 的 .prog__arrow 里，这里只出标记。 */
  var ARROW_CIRCLE = '<span class="prog__arrow">' + I.arrow + '</span>';

  /* ------------------------------------------------------------
     i18n — swap text on any element carrying data-en / data-zh
     ------------------------------------------------------------ */
  function applyI18n() {
    var isZh = LANG === 'zh';
    document.documentElement.lang = isZh ? 'zh-CN' : 'en';

    document.querySelectorAll('[data-en]').forEach(function (el) {
      var v = el.getAttribute(isZh ? 'data-zh' : 'data-en');
      if (v !== null) el.textContent = v;
    });
    document.querySelectorAll('[data-hen]').forEach(function (el) {
      var v = el.getAttribute(isZh ? 'data-hzh' : 'data-hen');
      if (v !== null) el.innerHTML = v;
    });
    document.querySelectorAll('[data-ph-en]').forEach(function (el) {
      var v = el.getAttribute(isZh ? 'data-ph-zh' : 'data-ph-en');
      if (v !== null) el.setAttribute('placeholder', v);
    });
    document.querySelectorAll('[data-attr]').forEach(function (el) {
      var attr = el.getAttribute('data-attr');
      var v = el.getAttribute(isZh ? 'data-attr-zh' : 'data-attr-en');
      if (attr && v !== null) el.setAttribute(attr, v);
    });

    var title = document.documentElement.getAttribute(isZh ? 'data-title-zh' : 'data-title-en');
    if (title) document.title = title;

    document.querySelectorAll('.lang button').forEach(function (b) {
      b.className = (b.getAttribute('data-lang') === LANG) ? 'on' : '';
    });
  }

  /* keep the choice across page loads without relying on storage */
  function syncLangParam() {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || /^(https?:|mailto:|tel:|#|\/)/.test(href)) return;
      if (!/\.html(\?|$)/.test(href)) return;
      var parts = href.split('?');
      var params = new URLSearchParams(parts[1] || '');
      if (LANG === 'zh') params.set('lang', 'zh'); else params.delete('lang');
      var q = params.toString();
      a.setAttribute('href', parts[0] + (q ? '?' + q : ''));
    });
  }

  function setLang(l) {
    LANG = l;
    try { window.localStorage.setItem('cmt-lang', l); } catch (e) {}
    renderBlocks();
    applyI18n();
    syncLangParam();
    lbRefresh();
  }
  window.setLang = setLang;

  /* ------------------------------------------------------------
     Card renderers
     ------------------------------------------------------------ */
  function mediaCard(o) {
    var badges = (o.badges || []).filter(function (b) { return b; });
    /* o.img 是可选的实拍封面；没有就退回原型色块（.ph-N）。
       alt 走 data-attr 三件套，跟静态页里的图片同一套双语机制。 */
    var photo = o.img
      ? '<img class="prog__img" src="' + o.img.src + '" alt="' + esc(o.img.alt[0]) + '"' +
        ' data-attr="alt" data-attr-en="' + esc(o.img.alt[0]) + '"' +
        ' data-attr-zh="' + esc(o.img.alt[1]) + '" loading="lazy" decoding="async">'
      : '';
    return '<a class="prog" href="' + o.href + '"' + (o.city ? ' data-city="' + o.city + '"' : '') + '>' +
      '<span class="prog__media ' + o.ph + (o.img ? ' prog__media--photo' : '') + '"' +
        (o.ratio ? ' style="aspect-ratio:' + o.ratio + '"' : '') + '>' +
        photo +
        badges.map(function (b, i) {
          return '<span class="badge' + (i === 1 ? ' badge--dark' : '') + '">' + esc(b) + '</span>';
        }).join('') +
        /* 日游卡的右上角圆箭头（o.arrowCircle）。.prog__media 是 flex + space-between：
           只剩「城市徽标 + 箭头」两个子项时，徽标自然靠左、箭头自然靠右，
           正好落在原来「一日游」徽标的位置。 */
        (o.arrowCircle ? ARROW_CIRCLE : '') +
        (o.overlay ? '<b>' + esc(o.overlay) + '</b>' : '') +
      '</span>' +
      '<span class="prog__body">' +
        '<h3>' + esc(o.title) + '</h3>' +
        (o.meta ? '<span class="prog__meta">' + esc(o.meta) + '</span>' : '') +
        (o.text ? '<p>' + esc(o.text) + '</p>' : '') +
        /* 底部一行：标签在左、「查看详情」在右，不再单独占一行（Flora 2026-09-21）。
           只有带标签的卡（行程卡）合并成 .prog__foot；日游卡 / 资源卡没有标签，
           前往链接仍单独一行，形态不变。
           o.noCta（日游卡，2026-09-22）：CTA 已经上移到封面右上角的圆箭头里，底部整行不再输出。 */
        (o.noCta
          ? ''
          : ((o.tags && o.tags.length)
              ? '<span class="prog__foot">'
                  + '<span class="tags">' + o.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</span>'
                  + '<span class="prog__go">' + esc(o.cta) + I.arrow + '</span>'
                + '</span>'
              : '<span class="prog__go">' + esc(o.cta) + I.arrow + '</span>')) +
      '</span></a>';
  }

  function cityCards() {
    return MT.CITIES.map(cityCard).join('');
  }
  /* 单张目的地卡；被 cityCards() 与 citySplitCards() 复用。
     c.img 是可选的实拍封面，跟行程卡 (mediaCard) 同一套：认到就输出 <img> 并给容器加
     --photo 修饰类，没有就退回 .ph-N 色块。运行时没有 at() 可用，alt 要手写 data-attr 三件套。 */
  function cityCard(c) {
    var n = cityTours(c.id).length;
    var count = n
      ? n + ' ' + (LANG === 'zh' ? '条日游' : (n > 1 ? 'day tours' : 'day tour'))
      : (c.heldBack
          ? (LANG === 'zh' ? '日游暂缓收录' : 'Day tours held back')
          : (LANG === 'zh' ? '暂无日游' : 'No day tours'));
    var photo = c.img
      ? '<img class="city__img" src="' + c.img.src + '" alt="' + esc(c.img.alt[0]) + '"' +
        ' data-attr="alt" data-attr-en="' + esc(c.img.alt[0]) + '"' +
        ' data-attr-zh="' + esc(c.img.alt[1]) + '" loading="lazy" decoding="async">'
      : '';
    return '<a class="city" href="' + c.slug + '.html">' +
      '<span class="city__ph ' + c.ph + (c.img ? ' city__ph--photo' : '') + '">' +
        photo + '<b>' + esc(pick(c.t)) + '</b></span>' +
      '<span class="city__body"><span>' + esc(pick(c.region)) + '</span>' +
      '<span class="tag">' + count + '</span></span></a>';
  }
  /* 目的地聚合页的分栏展示：左栏放一张主卡（澄江，占满整栏高度），
     右栏其余四张排成 2×2。主页那 5 张并排的横向带仍走 cityCards()。 */
  function citySplitCards() {
    var items = MT.CITIES.slice();
    var lead = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === 'chengjiang') { lead = items.splice(i, 1)[0]; break; }
    }
    if (!lead) return cityCards();
    return '<div class="city-split">' +
      '<div class="city-split__lead">' + cityCard(lead) + '</div>' +
      '<div class="city-split__grid">' + items.map(cityCard).join('') + '</div>' +
    '</div>';
  }

  /* 首页行程卡走精简版（data-compact）：去掉卡片里的整段描述（行程详情页已有），
     只留媒体、标题、标签与前往链接；列表页 / 产品线页 / 目的地页仍保留描述。 */
  function journeyCards(el) {
    var compact = !!(el && el.hasAttribute('data-compact'));
    return MT.JOURNEYS.map(function (j) {
      var c = cityById(j.cities[0]);
      var card = {
        href: j.slug + '.html',
        ph: j.ph,
        img: j.img,
        badges: [pick(j.tag), j.days + ' ' + tx('p.days')],
        overlay: c ? pick(c.t) : '',
        title: pick(j.t),
        meta: pick(j.dates),
        tags: MT.LINES.filter(function (l) { return j.lines.indexOf(l.id) > -1; }).map(function (l) { return pick(l.t); }),
        cta: tx('p.view')
      };
      if (!compact) card.text = pick(j.summary);
      return mediaCard(card);
    }).join('');
  }

  /* 首页行程卡（全出血图）：图片即卡片，宽高随图片比例缩放（一行两张）。
     标题 / 产品线标签 / 前往链接浮在图片底部，半透明白圆角条、白字。
     团期（dates「按需」）不进卡片。 */
  function journeysHeroCards() {
    return MT.JOURNEYS.map(function (j) {
      var photo = j.img
        ? '<img class="jcard__img" src="' + j.img.src + '" alt="' + esc(j.img.alt[0]) + '"' +
          ' data-attr="alt" data-attr-en="' + esc(j.img.alt[0]) + '"' +
          ' data-attr-zh="' + esc(j.img.alt[1]) + '" loading="lazy" decoding="async">'
        : '';
      var tags = MT.LINES
        .filter(function (l) { return j.lines.indexOf(l.id) > -1; })
        .map(function (l) { return '<span class="jcard__tag">' + esc(pick(l.t)) + '</span>'; })
        .join('');
      return '<a class="jcard" href="' + j.slug + '.html">' +
        photo +
        '<span class="jcard__badge">' + esc(pick(j.tag)) + '</span>' +
        '<span class="jcard__body">' +
          '<h3>' + esc(pick(j.t)) + '</h3>' +
          '<span class="jcard__row">' +
            (tags ? '<span class="jcard__tags">' + tags + '</span>' : '') +
            '<span class="jcard__go">' + esc(tx('p.view')) + I.arrow + '</span>' +
          '</span>' +
        '</span>' +
      '</a>';
    }).join('');
  }

  function cityTourCards(cityId) {
    var list = cityId ? cityTours(cityId) : MT.DAYTOURS;
    return list.map(function (d) {
      var c = cityById(d.city);
      /* 时长（一日游 / 半日游 / 多日游）原本是右上角的深色徽标，2026-09-22 Flora 要求撤掉，
         该位置让给「看详情」圆箭头；dur 仍留着，日后要换回文字或挪到别处都不用重算。 */
      var dur = d.type === 'half' ? tx('p.half') : (d.type === 'multi' ? tx('p.multi') : tx('p.full'));
      var text = d.intro ? pick(d.intro) : (d.stops.length + ' ' + tx('p.stops') + ' · ' + slot(d.stops[0]));
      return mediaCard({
        href: 'day-tour-' + d.slug + '.html',
        ph: c ? c.ph : 'ph-1',
        ratio: '21/9',
        city: d.city,
        /* 可选实拍封面，跟行程卡同一套：认到就出 <img> 并给容器加 --photo。 */
        img: d.img,
        /* 只留城市徽标（左上），右上交给圆箭头。 */
        badges: [c ? pick(c.t) : ''],
        title: pick(d.t),
        text: text,
        arrowCircle: true,   /* 右上角半透明白圆 + 右箭头：整卡是链接，箭头即「看详情」 */
        noCta: true          /* 底部不再输出「查看详情」整行 */
      });
    }).join('') +
    /* 目的地页（有 cityId）把「想了解更多」做成与日游卡同尺寸的卡，接在最后一张后面；
       日游列表页（cityId 为 null）不出现，它整页有自己的转化入口。 */
    (cityId && list.length ? wantMoreCard(cityId) : '');
  }

  /* 「想了解更多」转化卡：外框沿用日游卡的 .prog（同款边框与圆角，作为 grid3 子项宽高自动
     对齐同行的日游卡），内部仍是原 ctaCard 模块那套内容——「Questions?」标签、目的地名、
     说明文字、在线咨询与预约回电两个按钮，不做成日游卡那种『媒体图+标题』的结构。
     （2026-09-21 依 Flora 修正） */
  /* 「按钮组」——与 build.cjs 的 btnPair() 是同一套标记，改一边要想着另一边。
     主按钮（实心）在左、次按钮（描边）在右，尾随圆钮里是 ↗。
     wantMoreCard 是运行时渲染的（生成器够不着），所以这里必须再写一份。
     文案按当前 LANG 现算，不挂 data-en —— 切语言时 renderBlocks() 会整块重渲染。 */
  function btnPair(a, b, opts) {
    var light = !!(opts && opts.light);
    var sm = !!(opts && opts.sm);
    function item(it, skin) {
      return '<a class="btnpair__btn btnpair__btn--' + skin + '" href="' + it[0] + '">' +
        '<span>' + esc(it[1]) + '</span>' +
        '<span class="btnpair__ico">' + I.arrowUpRight + '</span></a>';
    }
    return '<div class="btnpair' + (light ? ' btnpair--onlight' : '') + (sm ? ' btnpair--sm' : '') + '">' +
      item(a, 'solid') + item(b, 'ghost') + '</div>';
  }

  function wantMoreCard(cityId) {
    var c = cityId ? cityById(cityId) : null;
    var zh = LANG === 'zh';
    var body = zh
      ? '从健康体检到中医康养，告诉我们你感兴趣的和你想要的出发时间，我们会据此为你规划一条包含这座城市的专属行程。'
      : 'Tell us what interests you and when you’d like to go, and we’ll shape a plan that includes this place.';
    return '<div class="prog prog-more">' +
      '<p class="ctacard__label">' + esc(zh ? '想了解更多？' : 'Questions?') + '</p>' +
      (c ? '<b class="ctacard__subject">' + esc(pick(c.t)) + '</b>' : '') +
      '<p>' + esc(body) + '</p>' +
      btnPair(['request.html', zh ? '预约回电' : 'Request a Call'],
              [MT.SITE.wa, zh ? '在线咨询' : 'Online Consultation'],
              { light: true, sm: true }) +
    '</div>';
  }

  function dayTourSection() {
    var cities = [];
    MT.DAYTOURS.forEach(function (d) {
      if (cities.indexOf(d.city) < 0) cities.push(d.city);
    });
    var chips = '<button type="button" class="on" data-city="all">' + esc(tx('filter.all')) +
      ' <b>' + MT.DAYTOURS.length + '</b></button>' +
      cities.map(function (id) {
        var c = cityById(id);
        return '<button type="button" data-city="' + id + '">' + esc(pick(c.t)) +
          ' <b>' + cityTours(id).length + '</b></button>';
      }).join('');
    return '<div class="filterbar" id="dtFilter">' + chips + '</div>' +
      '<div class="grid3" id="dtGrid">' + cityTourCards(null) + '</div>';
  }

  /* STEPS and FAQ are stored as two parallel language rows:
       [ ['<en heading>', '<en body>'], ['<zh heading>', '<zh body>'] ]
     not as a [en, zh] pair — bi() re-pairs them for pick(). */
  function bi(rows, i) {
    return [rows[0][i], rows[1][i]];
  }

  /* 首页四步（values 行版式）：图标 + 全大写小标题 + 描述，不再用编号圆。
     图标只从站内 I 表里取现成的四个，别新增一份图标表（两份表不同步是历史坑）。 */
  var STEP_ICONS = ['service', 'info', 'cal', 'meal'];
  function stepBand() {
    return MT.STEPS.slice(0, 4).map(function (s, i) {
      return '<li><span class="journey__ico">' + (I[STEP_ICONS[i]] || I.tick) + '</span>' +
        '<h3>' + esc(pick(bi(s, 0))) + '</h3><p>' + esc(pick(bi(s, 1))) + '</p></li>';
    }).join('');
  }

  /* about 页「从健康项目到云南旅程」用的「六张/四张错落卡」版式（Flora 2026-09-22 参考稿）。
     卡面只有「标题 → 描述 → 底部胶囊标签」，一行铺开、偶数位整体下移。
     ⚠ 2026-09-23 Flora 更正：这套样式**从首页搬到 about**（首页换了 .assplit「左图右列」）。
     首页不再用它 —— 渲染目标只在 about.html，别在别处挂 [data-render="assureBand"]。
     数据结构与首页六项承诺无关：about 那四条是「从健康项目到云南旅程」的事实带，
     所以文案不走 MT.ASSURANCE，由 build.cjs 直接出静态 <article>，不经这个渲染器。
     这个 renderer 目前没有页面在用，保留是因为 .assure 样式还在 about —— 要启用就把
     about 的静态块换成 <div data-render="assureBand">。 */
  function assuranceCards() {
    return MT.ASSURANCE.map(function (a) {
      var tags = (a.tag || []).map(function (t) {
        return '<span class="assure__tag">' + esc(pick(t)) + '</span>';
      }).join('');
      return '<article><h3>' + esc(pick(a.t)) + '</h3><p>' + esc(pick(a.d)) + '</p>' +
        (tags ? '<div class="assure__tags">' + tags + '</div>' : '') + '</article>';
    }).join('');
  }

  /* 首页六项承诺 · 「左图右列」版式（Flora 2026-09-23 参考图）：每条 = 小图标 + 标题 + 描述。
     数据结构完全复用 MT.ASSURANCE —— 只把 a.ico 用起来，换成每条前面那枚小图标。 */
  function assuranceSplitCards() {
    return MT.ASSURANCE.map(function (a) {
      var ico = I[a.ico] || I.info;
      return '<li class="assplit__item">' +
        '<span class="assplit__ico" aria-hidden="true">' + ico + '</span>' +
        '<div class="assplit__txt">' +
          '<h3>' + esc(pick(a.t)) + '</h3>' +
          '<p>' + esc(pick(a.d)) + '</p>' +
        '</div></li>';
    }).join('');
  }

  function faqList() {
    return MT.FAQ.map(function (q, i) {
      return '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(pick(bi(q, 0))) + '</summary>' +
        '<div class="faq__body">' + esc(pick(bi(q, 1))) + '</div></details>';
    }).join('');
  }

  function resourceCards() {
    return MT.RESOURCES.map(function (r) {
      return mediaCard({
        href: 'resources.html', ph: r.ph, ratio: '21/9',
        badges: [pick(r.tag)],
        title: pick(r.t), text: pick(r.d), cta: tx('p.read')
      });
    }).join('');
  }

  function resourceRows() {
    return MT.RESOURCES.map(function (r) {
      return '<article><span class="artlist__ph ' + r.ph + '"></span>' +
        '<div><h3>' + esc(pick(r.t)) + '</h3><p>' + esc(pick(r.d)) + '</p></div>' +
        '<span class="artlist__meta"><span class="tag">' + esc(pick(r.tag)) + '</span>' +
        '<span>' + esc(tx('p.read')) + '</span>' + I.arrow + '</span></article>';
    }).join('');
  }

  /* ------------------------------------------------------------
     request.html — the only form in the build.
     The "感兴趣" dropdown is grouped by line / journey / day tour /
     destination (MT 表可直接用于填充)。
     ------------------------------------------------------------ */
  function interestGroups() {
    return [
      { key: 'grp.journeys', items: MT.JOURNEYS.map(function (j) { return { value: j.slug, label: j.t }; }) },
      { key: 'grp.daytours', items: MT.DAYTOURS.map(function (d) { return { value: 'day-tour-' + d.slug, label: d.t }; }) },
      { key: 'grp.cities', items: MT.CITIES.map(function (c) { return { value: c.slug, label: c.t }; }) }
    ];
  }

  function options() {
    var out = '<option value="">' + esc(tx('form.select')) + '</option>';
    interestGroups().forEach(function (group) {
      out += '<optgroup label="' + esc(tx(group.key)) + '">' +
        group.items.map(function (item) {
          return '<option value="' + esc(item.value) + '">' + esc(pick(item.label)) + '</option>';
        }).join('') +
      '</optgroup>';
    });
    out += '<optgroup label="—"><option value="other">' + esc(tx('form.other')) + '</option></optgroup>';
    return out;
  }

  function enquiryForm() {
    /* form.channel 里含「电子邮箱 / 电话 / WhatsApp 账号」；选电话或 WhatsApp 时，
       右侧这一格（data-chv）才会出现输入框（channel-change 监听在 bind() 里）。 */
    var chanValue = '<div class="full" data-chv hidden><label id="chanValLbl"></label>' +
      '<input id="chanValue" name="chanValue" autocomplete="off" autocapitalize="off" spellcheck="false"' +
      ' data-ph-en="e.g. +86 138 0000 0000" data-ph-zh="例如 +86 138 0000 0000"></div>';
    return '<form class="enq reqform" id="enqForm" novalidate>' +
      '<div><label>' + esc(tx('form.name')) + ' *</label><input name="name" autocomplete="name" required data-ph-en="Full name" data-ph-zh="姓名"></div>' +
      '<div><label>' + esc(tx('form.email')) + ' *</label><input name="email" type="email" autocomplete="email" required placeholder="you@example.com"></div>' +
      '<div><label>' + esc(tx('form.country')) + ' *</label><input name="country" autocomplete="country-name" required data-ph-en="Which country are you in?" data-ph-zh="你来自哪里"></div>' +
      '<div><label>' + esc(tx('form.interest')) + '</label><select name="interest">' + options() + '</select></div>' +
      '<div><label>' + esc(tx('form.channel')) + '</label><select name="channel" id="chanSel">' +
        '<option value="">' + esc(tx('form.select')) + '</option>' +
        '<option value="email">' + esc(tx('form.chanEmail')) + '</option>' +
        '<option value="phone">' + esc(tx('form.chanPhone')) + '</option>' +
        '<option value="whatsapp">' + esc(tx('form.chanWhats')) + '</option>' +
      '</select></div>' +
      '<div><label>' + esc(tx('form.slot')) + '</label><select name="slot">' +
        '<option value="">' + esc(tx('form.select')) + '</option>' +
        '<option value="morning">' + esc(tx('form.slotAm')) + '</option>' +
        '<option value="afternoon">' + esc(tx('form.slotPm')) + '</option>' +
        '<option value="evening">' + esc(tx('form.slotEve')) + '</option>' +
      '</select></div>' +
      chanValue +
      '<div class="full"><label>' + esc(tx('form.msg')) + '</label><textarea name="msg" rows="5"></textarea></div>' +
      '<label class="reqform__check full"><input type="checkbox" name="consent" required>' +
        '<span>' + esc(tx('form.consent')) + '</span></label>' +
      '<label class="reqform__check full"><input type="checkbox" name="nomed" required>' +
        '<span>' + esc(tx('form.nomed')) + '</span></label>' +
      '<div class="full reqform__foot">' +
        '<button class="submit" type="submit">' + esc(tx('form.submit')) + '</button>' +
        '<span class="reqform__hint"></span>' +
      '</div>' +
    '</form>';
  }

  function successPanel() {
    return '<div class="reqok">' +
      '<span class="reqok__ico">' + I.tick + '</span>' +
      '<h2>' + esc(tx('ok.title')) + '</h2>' +
      '<p>' + esc(tx('ok.body')) + '</p>' +
      '<p class="reqok__meta">' + esc(tx('ok.meta')) + '</p>' +
      '<a class="btn-solid btn-solid--sm" href="index.html">' + esc(tx('ok.cta')) + I.arrow + '</a>' +
    '</div>';
  }

  var RENDERERS = {
    cities: cityCards,
    journeys: function (el) { return journeyCards(el); },
    journeysHero: journeysHeroCards,
    daytours: dayTourSection,
    citytours: function (el) { return cityTourCards(el.getAttribute('data-city')); },
    stepband: stepBand,
    assurance: assuranceCards,
    assuranceSplit: assuranceSplitCards,
    faq: faqList,
    rescards: resourceCards,
    resrows: resourceRows,
    enquiry: function () { return enquiryForm(); },
    citySplit: citySplitCards
  };

  function renderBlocks() {
    document.querySelectorAll('[data-render]').forEach(function (el) {
      /* an already-submitted form keeps its confirmation across a language switch */
      if (el.hasAttribute('data-submitted')) { el.innerHTML = successPanel(); return; }
      var fn = RENDERERS[el.getAttribute('data-render')];
      if (fn) el.innerHTML = fn(el);
    });
  }

  /* ------------------------------------------------------------
     Interactions
     ------------------------------------------------------------ */
  function toggleMenu() {
    var m = document.getElementById('mnav');
    if (m) m.classList.toggle('on');
  }
  window.toggleMenu = toggleMenu;

  /* ------------------------------------------------------------
     行程配图的看图灯箱
     --------------------------------------------------------------
     只认 [data-zoom]（build.cjs 的 photoStrip 生成）。分页范围是
     整个页面上的配图，所以一趟行程里可以左右键一路看完。
     说明文字直接取 <img alt>——alt 已由 applyI18n 跟着语言换过，
     所以灯箱不用自己再存一份双语文案。
     ------------------------------------------------------------ */
  var lb = { box: null, items: [], i: 0 };

  function lbBuild() {
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.innerHTML =
      '<span class="lightbox__count"></span>' +
      '<button class="lightbox__close" type="button" data-attr="aria-label" data-attr-en="Close" data-attr-zh="关闭">×</button>' +
      '<button class="lightbox__nav lightbox__nav--prev" type="button" data-attr="aria-label" data-attr-en="Previous image" data-attr-zh="上一张">‹</button>' +
      '<button class="lightbox__nav lightbox__nav--next" type="button" data-attr="aria-label" data-attr-en="Next image" data-attr-zh="下一张">›</button>' +
      '<div class="lightbox__stage"><img class="lightbox__img" alt=""><p class="lightbox__caption"></p></div>';
    document.body.appendChild(box);
    box.querySelector('.lightbox__close').addEventListener('click', lbClose);
    box.querySelector('.lightbox__nav--prev').addEventListener('click', function () { lbStep(-1); });
    box.querySelector('.lightbox__nav--next').addEventListener('click', function () { lbStep(1); });
    box.addEventListener('click', function (e) { if (e.target === box) lbClose(); });
    lb.box = box;
  }

  function lbPaint() {
    var a = lb.items[lb.i];
    if (!a || !lb.box) return;
    var img = a.querySelector('img');
    lb.box.querySelector('.lightbox__img').setAttribute('src', a.getAttribute('href') || (img && img.getAttribute('src')));
    lb.box.querySelector('.lightbox__caption').textContent = (img && img.getAttribute('alt')) || '';
    lb.box.querySelector('.lightbox__count').textContent = (lb.i + 1) + ' / ' + lb.items.length;
    var many = lb.items.length > 1 ? '' : 'none';
    lb.box.querySelector('.lightbox__nav--prev').style.display = many;
    lb.box.querySelector('.lightbox__nav--next').style.display = many;
  }

  function lbOpen(anchor) {
    if (!lb.box) lbBuild();
    lb.items = Array.prototype.slice.call(document.querySelectorAll('[data-zoom]'));
    lb.i = lb.items.indexOf(anchor);
    if (lb.i < 0) lb.i = 0;
    applyI18n();                 /* 新建的按钮标签也要过一遍语言 */
    lbPaint();
    lb.box.classList.add('on');
    document.documentElement.style.overflow = 'hidden';
  }
  function lbClose() {
    if (!lb.box) return;
    lb.box.classList.remove('on');
    lb.box.querySelector('.lightbox__img').setAttribute('src', '');
    document.documentElement.style.overflow = '';
  }
  function lbStep(d) {
    if (lb.items.length < 2) return;
    lb.i = (lb.i + d + lb.items.length) % lb.items.length;
    lbPaint();
  }
  function lbRefresh() { if (lb.box && lb.box.classList.contains('on')) lbPaint(); }

  function lightbox() {
    document.querySelectorAll('[data-zoom]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); lbOpen(a); });
    });
    document.addEventListener('keydown', function (e) {
      if (!lb.box || !lb.box.classList.contains('on')) return;
      if (e.key === 'Escape') lbClose();
      else if (e.key === 'ArrowLeft') lbStep(-1);
      else if (e.key === 'ArrowRight') lbStep(1);
    });
    var x0 = null;
    document.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    document.addEventListener('touchend', function (e) {
      if (!lb.box || !lb.box.classList.contains('on') || x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) lbStep(dx > 0 ? -1 : 1);
      x0 = null;
    }, { passive: true });
  }

  function bind() {
    lightbox();
    /* request.html form — the only one in the build */
    document.addEventListener('submit', function (e) {
      var f = e.target;
      if (!f || f.id !== 'enqForm') return;
      e.preventDefault();
      if (typeof f.reportValidity === 'function' && !f.reportValidity()) return;

      var holder = f.parentNode;
      holder.setAttribute('data-submitted', '');
      holder.innerHTML = successPanel();
      var panel = holder.querySelector('.reqok');
      if (panel) {
        var box = panel.getBoundingClientRect();
        window.scrollTo({ top: box.top + window.scrollY - 120, behavior: 'smooth' });
      }
    });

    /* request form —— 偏好联系渠道：选电话 / WhatsApp 时，右侧出现号码输入框，
       并跟着所选渠道换标签；重选或清空时收起。 */
    document.addEventListener('change', function (e) {
      var t = e.target;
      if (!t || t.id !== 'chanSel') return;
      var v = t.value;
      var holder = document.querySelector('[data-chv]');
      var show = (v === 'phone' || v === 'whatsapp');
      if (!holder) return;
      holder.hidden = !show;
      if (show) {
        var lbl = document.getElementById('chanValLbl');
        if (lbl) lbl.textContent = v === 'phone' ? tx('form.phone') : tx('form.whatsapp');
        var input = document.getElementById('chanValue');
        if (input) {
          input.required = true;
          applyI18n();
        }
      } else {
        var inp2 = document.getElementById('chanValue');
        if (inp2) inp2.required = false;
      }
    });

    /* day-tour city filter */
    document.addEventListener('click', function (e) {
      var b = e.target.closest('#dtFilter button');
      if (!b) return;
      var city = b.getAttribute('data-city');
      document.querySelectorAll('#dtFilter button').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      document.querySelectorAll('#dtGrid > .prog').forEach(function (card) {
        if (!card.hasAttribute('data-city')) return;
        card.style.display = (city === 'all' || card.getAttribute('data-city') === city) ? '' : 'none';
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var m = document.getElementById('mnav');
        if (m) m.classList.remove('on');
      }
    });

    var header = document.getElementById('siteHeader');
    if (header) {
      var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* 右下角悬浮按钮组：footer 顶部滚进视口下半部（压住按钮所在区域）时隐藏，
       离开 footer（后退滚动到 footer 完全翻出屏幕底部）再出现。 */
    var floaters = document.querySelector('.floaters');
    var footer = document.querySelector('.site-footer');
    var updateFloaters = function () {
      if (!floaters || !footer) return;
      var visible = footer.getBoundingClientRect().top >= window.innerHeight;
      floaters.classList.toggle('is-hidden', !visible);
    };
    if (floaters && footer) {
      updateFloaters();
      window.addEventListener('scroll', updateFloaters, { passive: true });
      window.addEventListener('resize', updateFloaters);
    }
  }

  /* ------------------------------------------------------------
     Boot
     ------------------------------------------------------------ */
  function boot() {
    renderBlocks();
    applyI18n();
    syncLangParam();
    bind();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
