/* ==============================================================
   CMT Medical Travel — content model
   --------------------------------------------------------------
   Plain script (no ES modules) so it loads over file:// as well as
   over HTTP. Dual-target: browser gets window.MT, Node gets
   module.exports (the build script reads the same data).

   Bilingual content is stored as [en, zh] tuples everywhere.
   Anything the *build* writes into HTML uses data-en / data-zh
   attributes; only JS-rendered lists read these tuples directly.

   Source material: 资料/旅游/
     · 确定版--新加坡仲景中医学院云南抚仙湖养生.pdf
     · 法国团6天5晚行程安排.xlsx
     · 昆明医疗旅游产品清单.xlsx
     · 云南日游产品行程/*.pdf (33 itineraries)
   ============================================================== */
(function (root) {
  'use strict';

  var MT = {};

  /* ------------------------------------------------------------
     Site shell
     ------------------------------------------------------------ */
  MT.SITE = {
    brand: 'CMT Health',
    line: 'CMT Medical Travel',
    /* 联系邮箱 / 电话 / 地址（footer「联系我们」列）。Email 与电话两种语言通用，
       地址为 [en, zh] 双语对。 */
    email: 'support@cmedtrip.com',
    phone: '+86 199 8775 8890',
    address: [['Room 1523A, 15/F, Star House, 3 Salisbury Road, Tsim Sha Tsui, Hong Kong',
               '香港尖沙咀梳士巴利道3號星光行15樓1523A房']],
    /* 在线咨询按钮的原型占位链接。上线前换成真实 WhatsApp 入口
       https://wa.me/<number>（号码不带 +）。当前为占位、不跳转。 */
    wa: 'javascript:void(0)',
    /* 临床项目需提前确认的天数。首页信任条与四步说明都读这一处 ——
       要改就改这里，别再往文案里写死数字。 */
    leadDays: 7,
    year: '2026'
  };

  /* Top-level menu. `id` also drives the aria-current state on
     both the header nav and the sub-navigation tabs. */
  MT.NAV = [
    { id: 'home', href: 'index.html', t: ['Home', '首页'] },
    { id: 'journeys', href: 'journeys.html', t: ['Journeys', '行程'] },
    { id: 'destinations', href: 'destinations.html', t: ['Destinations', '目的地'] },
    { id: 'about', href: 'about.html', t: ['About', '关于我们'] }
  ];

  /* ------------------------------------------------------------
     UI strings used by JS-rendered markup only.
     Page copy lives inline in the HTML as data-en / data-zh.
     ------------------------------------------------------------ */
  MT.T = {
    en: {
      'nav.menu': 'Menu',
      'nav.cta': 'Request a Call',
      'p.days': 'days',
      'p.day': 'day',
      'p.nights': 'nights',
      'p.view': 'View journey',
      'p.detail': 'View details',
      'p.read': 'Read',
      'p.items': 'programmes',
      'p.available': 'Available',
      'p.full': 'Full day',
      'p.half': 'Half day',
      'p.multi': 'Multi-day',
      'p.stops': 'stops',
      'p.from': 'From',
      'p.onrequest': 'On request',
      'filter.all': 'All cities',
      'filter.showing': 'Showing',
      'form.name': 'Your name',
      'form.email': 'Email',
      'form.country': 'Country',
      'form.month': 'Target month',
      'form.msg': 'Anything you would like us to know (diet, health notes, questions)',
      'form.submit': 'Send my enquiry',
      'form.about': 'Enquiry about',
      'form.interest': 'What are you interested in',
      'form.select': 'Select one',
      'form.other': 'Something else / not sure yet',
      'form.channel': 'Preferred contact channel',
      'form.phone': 'Phone number',
      'form.whatsapp': 'WhatsApp account',
      'form.slot': 'Preferred call-back time',
      'form.chanEmail': 'Email',
      'form.chanPhone': 'Phone',
      'form.chanWhats': 'WhatsApp',
      'form.slotAm': 'Morning',
      'form.slotPm': 'Afternoon',
      'form.slotEve': 'Evening',
      'form.consent': 'CMT Medical Travel may use these details to answer this enquiry.',
      'form.nomed': 'I understand this form is not for medical advice or emergencies.',
      'grp.journeys': 'Group journeys',
      'grp.daytours': 'Yunnan day tours',
      'grp.cities': 'Destinations',
      'ok.title': 'Enquiry received',
      'ok.body': 'We will tailor a proposal, itinerary and price for you.',
      'ok.meta': 'Prototype: nothing was actually sent. In the build this posts to the CRM and triggers an acknowledgement email.',
      'ok.cta': 'Keep browsing'
    },
    zh: {
      'nav.menu': '菜单',
      'nav.cta': '获取方案',
      'p.days': '天',
      'p.day': '天',
      'p.nights': '晚',
      'p.view': '查看行程',
      'p.detail': '查看详情',
      'p.read': '阅读',
      'p.items': '个项目',
      'p.available': '可预订',
      'p.full': '一日游',
      'p.half': '半日游',
      'p.multi': '多日游',
      'p.stops': '个停留点',
      'p.from': '起',
      'p.onrequest': '按需排期',
      'filter.all': '全部城市',
      'filter.showing': '当前显示',
      'form.name': '你的称呼',
      'form.email': '邮箱',
      'form.country': '所在国家 / 地区',
      'form.month': '目标月份',
      'form.msg': '想提前告诉我们的信息（饮食偏好、健康情况、你的问题）',
      'form.submit': '提交咨询',
      'form.about': '咨询项目',
      'form.interest': '你对什么感兴趣',
      'form.select': '请选择',
      'form.other': '其他 / 还不确定',
      'form.channel': '偏好联系渠道',
      'form.phone': '联系电话',
      'form.whatsapp': 'WhatsApp 账号',
      'form.slot': '偏好回电时间段',
      'form.chanEmail': '电子邮箱',
      'form.chanPhone': '电话',
      'form.chanWhats': 'WhatsApp 账号',
      'form.slotAm': '上午',
      'form.slotPm': '下午',
      'form.slotEve': '晚上',
      'form.consent': '同意 CMT Medical Travel 使用以上信息回复本次咨询。',
      'form.nomed': '我理解此表单不用于医疗建议或紧急情况。',
      'grp.journeys': '跟团行程',
      'grp.daytours': '云南日游',
      'grp.cities': '目的地',
      'ok.title': '已收到你的咨询',
      'ok.body': '我们会为你定制行程与报价。',
      'ok.meta': '原型说明：实际上没有发送任何数据。正式版本会提交到 CRM 并触发确认邮件。',
      'ok.cta': '继续浏览'
    }
  };

  /* ------------------------------------------------------------
     Programme lines — 4
     Source: 昆明医疗旅游产品清单.xlsx (体检 / 中医 / 牙科 + 定制)
     ------------------------------------------------------------ */
  MT.LINES = [
    {
      id: 'screening', slug: 'programme-screening', ph: 'ph-1',
      t: ['Health screening', '健康体检'],
      tagline: ['Diagnostics and full-body screening', '诊断与全身筛查'],
      lead: [
        'Four standard panels delivered in Kunming, scheduled so a group can combine them with a Yunnan tour. Every guest leaves with a bilingual report and a specialist read-out.',
        '四类标准化体检套餐落地昆明，可与云南游览行程组合排期。每位客人离开时拿到双语报告与专科解读。'
      ],
      procedures: [
        ['Executive / white-collar panel', '常规白领体检'],
        ['MRI-focused screening', 'MRI 扫描专项体检'],
        ['Cardiovascular panel', '心血管专项体检'],
        ['Painless gastroscopy & colonoscopy', '无痛肠胃镜体检']
      ],
      services: [
        ['Screening-centre booking', '体检中心预约'],
        ['Bilingual accompanying and guidance', '双语陪诊、引导'],
        ['Bilingual screening report', '双语体检报告'],
        ['Report walk-through with the guest', '体检报告解读']
      ],
      timing: [
        ['08:30 – 12:00. Screening happens on day 1 in Kunming; reports are collected before the group flies home.', '早 8:30 – 中午 12:00。行程第 1 天在昆明体检，返程前领取体检报告。']
      ],
      notes: [
        ['If endoscopy is included, the guest must fast from the previous evening — no dinner is arranged that night.', '若体检项目包含肠胃镜检查，前一天晚需空腹，则无需为客户安排晚餐。'],
        ['Screening slots and packages must be confirmed 7 days in advance.', '需提前 7 天确认体检时间与体检套餐。']
      ],
      tour: [
        ['Typically paired with a 7–9 day in-depth Yunnan tour covering Dali, Lijiang, Shangri-La and Kunming, with local guide, interpreter, driver and meals.', '通常搭配 7–9 日云南深度游，涵盖大理、丽江、香格里拉、昆明，含地陪、翻译、司机与餐食。']
      ]
    },
    {
      id: 'tcm', slug: 'programme-tcm', ph: 'ph-3',
      t: ['TCM & wellness', '中医康养'],
      tagline: ['Traditional Chinese medicine', '传统中医调理'],
      lead: [
        'Acupuncture, tuina, cupping, gua sha and moxibustion in Kunming, plus the Sheng\'ai retreat base at Fuxian Lake for multi-day programmes with daily constitutional review.',
        '针灸、推拿、拔罐、刮痧、艾灸落地昆明；多日康养则以抚仙湖圣爱健康基地为依托，每日做体质跟踪。'
      ],
      procedures: [
        ['Acupuncture', '针灸'],
        ['Tuina massage', '推拿'],
        ['Cupping', '拔罐'],
        ['Gua sha scraping', '刮痧'],
        ['Moxibustion', '艾灸']
      ],
      services: [
        ['TCM clinic booking and physician scheduling', '中医馆预约、医生安排'],
        ['Bilingual guidance and accompanying', '双语引导、陪诊'],
        ['Constitution identification (nine body types)', '九种体质辨识'],
        ['Daily treatment log', '每日调理记录']
      ],
      timing: [
        ['10:00 – 18:00. On a tour day, the TCM session runs on the morning of day 1 or day 2 in Kunming.', '早 10:00 – 下午 6:00。在地游行程中，中医体验安排在第一天或第二天上午进行。']
      ],
      notes: [
        ['Keep the day\'s food plain — no chilli, no cold dishes, and avoid prolonged contact with cold water.', '中医体验当天饮食需清淡，忌辛辣、忌寒，不得长时间接触冷水。'],
        ['The clinic and the treatment list must be confirmed 7 days in advance.', '需提前 7 天确认体验项目与体验医院。']
      ],
      tour: [
        ['Multi-day retreats run at the Sheng\'ai base on Fuxian Lake (Chengjiang), including fourteen-meridian tuina, moxibustion, herbal foot baths and bespoke herbal soaks.', '多日康养在抚仙湖（澄江）圣爱健康基地执行，含十四经络推拿、艾灸、中药沐足与私人定制中药泡浴。']
      ]
    },
    {
      id: 'dental', slug: 'programme-dental', ph: 'ph-2',
      t: ['Dental care', '口腔诊疗'],
      tagline: ['Outpatient procedures', '门诊类项目'],
      lead: [
        'Two tiers, split by recovery time: low-trauma check-ups and cleaning, and higher-trauma surgery such as wisdom-tooth extraction or veneers — the latter scheduled at the end of a trip so the guest can recover before flying.',
        '按恢复期分两档：低创伤检查与洗牙，以及拔智齿、牙贴片等创伤较大的项目——后者排在行程后段，留出恢复时间再乘机。'
      ],
      procedures: [
        ['Non-invasive or low-trauma check-ups, e.g. scaling and cleaning', '无创或低创伤类牙科检查，如洗牙'],
        ['Higher-trauma surgery, e.g. wisdom-tooth extraction, veneers', '创伤较大的牙科手术，如拔智齿、牙贴片等']
      ],
      services: [
        ['Dental clinic booking and dentist scheduling', '牙科诊所预约、医生安排'],
        ['Bilingual accompanying and guidance', '双语陪诊、引导'],
        ['Bilingual examination report', '双语检查报告'],
        ['Report walk-through in English', '英语报告解读']
      ],
      timing: [
        ['10:00 – 18:00. Higher-trauma surgery is placed in the last two days of the itinerary, with two days of local Kunming touring running alongside.', '早 10:00 – 下午 6:00。创伤较大的手术安排在行程后两天，同步安排两天昆明在地游。']
      ],
      notes: [
        ['After higher-trauma surgery such as wisdom-tooth extraction, the guest must wait 24 hours before flying.', '创伤较大的手术如拔智齿等，需等待 24 小时之后再乘坐飞机。'],
        ['Treatment items and the treating clinic must be confirmed 7 days in advance.', '需提前 7 天确认治疗项目与治疗时间。']
      ],
      tour: [
        ['Scheduled so that the clinical appointment sits inside a Kunming city stay; the rest of the trip continues unchanged.', '临床预约嵌入昆明市内停留期间，行程其余部分不受影响。']
      ]
    },
    {
      id: 'custom', slug: 'programme-custom', ph: 'ph-4',
      t: ['Bespoke programmes', '专项定制'],
      tagline: ['When the standard products do not fit', '标准化产品覆盖不到时'],
      lead: [
        'Dental implants, specialised TCM treatment and long-stay recovery for oncology patients fall outside the standardised products. These are quoted and built case by case.',
        '牙科种植牙、中医药特殊治疗、癌症康复期长程疗养等不在标准化产品范围内，需按个案专项定制与报价。'
      ],
      procedures: [
        ['Dental implants', '牙科种植牙'],
        ['Specialised TCM treatment', '中医药特殊治疗'],
        ['Long-stay recovery for oncology patients', '癌症康复期长程疗养'],
        ['Any programme needing a named specialist or a fixed date', '需要指定专家或固定档期的项目']
      ],
      services: [
        ['Named-specialist sourcing and scheduling', '指定专家对接与排期'],
        ['Medical records review before quotation', '报价前病历资料预审'],
        ['Case-by-case clinical pathway draft', '按个案起草诊疗路径'],
        ['Dedicated bilingual coordinator for the whole stay', '全程专属双语协调员']
      ],
      timing: [
        ['Lead time depends on the department. Records must reach us before a quotation can be issued.', '周期取决于科室排期。需先收到病历资料，才能出具报价。']
      ],
      notes: [
        ['A bespoke programme starts from the guest\'s own records — imaging, diagnosis and current medication.', '专项定制从客人自身资料出发——影像、诊断与当前用药。']
      ],
      tour: [
        ['Built around the clinical calendar rather than a sightseeing itinerary.', '以临床日程为中心排期，而非以观光行程为中心。']
      ]
    }
  ];

  /* ------------------------------------------------------------
     Destinations — 5
     Every one of these has first-hand client material. Lijiang and
     Shangri-La appear on the 7–9 day in-depth route only; no
     destination detail was ever supplied for them, so they are not
     carried as destination pages (see MT.ROUTE_ONLY below).
     ------------------------------------------------------------ */
  /* 每个城市还带 short —— 一行地名列表专用的单名（页脚品牌语、about 事实条）。
     合并型目的地（澄江 · 抚仙湖）的整名 t 自带「 · 」，会和外层列表分隔符打架，
     所以列表一律读 short，不读 t。 */
  MT.CITIES = [
    {
      id: 'kunming', slug: 'destination-kunming', ph: 'ph-1',
      t: ['Kunming', '昆明'],
      short: ['Kunming', '昆明'],
      region: ['Yunnan province, capital', '云南省 · 省会'],
      img: {
        src: 'assets/images/kunming-destination-card-400x250.jpg',
        alt: ['Pavilions and gardens above Dianchi Lake, Kunming', '昆明滇池畔的亭台与园林']
      },
      summary: [
        'The City of Eternal Spring — Dianchi Lake below Xishan, Green Lake in the old centre and Guandu old town. Old quarters and lake scenery in one city.',
        '春城——西山之下的滇池、老城中心的翠湖，以及官渡古镇的街巷。省会城市，风景都嵌在城里。'
      ],
      highlights: [
        ['Health screening, TCM and dental appointments', '体检、中医、牙科三类临床预约'],
        ['Haidong wetland and Dianchi Lake red-billed gulls (winter)', '海埂大坝与滇池红嘴鸥（冬季）'],
        ['Yunnan Baicao Village', '云南百草村'],
        ['Stone Forest and Jiuxiang karst', '石林与九乡溶洞'],
        ['Xishan and the Yunnan Ethnic Village', '西山与云南民族村'],
        ['Jiaozishan snow mountain', '轿子雪山'],
        ['Mushroom foraging (seasonal)', '捡菌（季节性）'],
        ['Dounan flower market', '斗南花市']
      ]
    },
    {
      id: 'chengjiang', slug: 'destination-chengjiang', ph: 'ph-5',
      t: ['Chengjiang · Fuxian Lake', '澄江 · 抚仙湖'],
      short: ['Fuxian Lake', '抚仙湖'],
      region: ['Yuxi, Yunnan · 70 km from Kunming', '玉溪市 · 距昆明 70 公里'],
      img: {
        src: 'assets/images/fuxianfu-card.jpg',
        alt: ['Tea on a lakeside terrace above Fuxian Lake', '抚仙湖畔的观景茶席']
      },
      summary: [
        'The wellness base. Retreats run from the Sheng\'ai health base, with courtyard rooms at Liuhe Xiaoyuan and a lake calm enough for morning practice outdoors.',
        '康养基地所在。多日康养以圣爱健康基地为依托，住宿在六合小院庭院式酒店；湖面常年平静，适合每天早上做户外晨练。'
      ],
      highlights: [
        ['Sheng\'ai health base and TCM therapy rooms', '圣爱健康基地与中医理疗区'],
        ['Liuhe Xiaoyuan — TCM-themed courtyard hotel', '圣爱六合小院——中医主题庭院式酒店'],
        ['Luchong scenic area (national AAAA) and Bijia mountain', '禄充风景区（国家 AAAA）与笔架山'],
        ['Fuhaiwan wetland park', '抚海湾湿地公园'],
        ['Fuxian Lake boat cruise', '抚仙湖游船'],
        ['Chengjiang Fossil Site museum', '澄江化石地博物馆'],
        ['Bronze ware museum, Jiangchuan', '江川青铜器博物馆'],
        ['Intangible-heritage lotus-root starch workshop', '澄江藕粉非遗工坊'],
        ['Xiaowan village and Yunnan coffee tasting', '小湾村与云南咖啡品鉴'],
        ['Shihua Garden wet market', '柿花园菜市场']
      ]
    },
    {
      id: 'dali', slug: 'destination-dali', ph: 'ph-2',
      t: ['Dali', '大理'],
      short: ['Dali', '大理'],
      region: ['Dali Bai autonomous prefecture', '大理白族自治州'],
      img: {
        src: 'assets/images/dali-destination-card-400x250.jpg',
        alt: ['Erhai Lake with the Cangshan range behind, Dali', '大理洱海与苍山']
      },
      summary: [
        'The cultural half of the programme. Bai architecture at Xizhou, the Erhai shoreline, and Cangshan — the sightseeing layer around a Kunming or Fuxian Lake stay.',
        '行程中的文化板块。喜洲白族建筑、洱海沿岸与苍山，作为昆明或抚仙湖临床停留之外的观光层。'
      ],
      highlights: [
        ['Three Pagodas of Chongsheng Temple (AAAAA)', '崇圣寺三塔（AAAAA）'],
        ['Erhai Lake cruise to Nanzhao Island', '洱海大游船 · 南诏风情岛'],
        ['Xizhou ancient town', '喜洲古镇'],
        ['Cangshan Gantong cableway', '苍山感通索道'],
        ['Shuanglang and the Erhai ecological corridor', '双廊与洱海生态廊道'],
        ['Jizu mountain — pilgrimage site', '鸡足山——佛教圣地'],
        ['Butterfly Spring', '蝴蝶泉']
      ]
    },
    {
      id: 'puer', slug: 'destination-puer', ph: 'ph-6',
      t: ['Pu\'er', '普洱'],
      short: ['Pu\'er', '普洱'],
      region: ['Pu\'er, southern Yunnan', '云南南部 · 普洱'],
      img: {
        src: 'assets/images/puer-destination-card-400x250.jpg',
        alt: ['Tea terraces and a hillside pavilion in Pu\'er', '普洱茶山梯田与山间亭台']
      },
      /* 2026-09-21：普洱从「暂缓收录」转为已收录 —— 客户口头/图文补了两条茶咖与雨林
         主题的一日游（见 data-content.js 的 Pu'er 段）。heldBack / heldBackCount
         已撤掉；页面上的日游网格与数量标签会跟着 MT.DAYTOURS 自动变。 */
      summary: [
        'Tea and coffee country — tea mountains, coffee estates and the ancient Tea Horse Road.',
        '茶与咖啡产区——茶山、咖啡庄园与茶马古道。'
      ],
      highlights: [
        ['Jingmai mountain (1 and 2 day options)', '景迈山（1 日 / 2 日）'],
        ['Ancient Tea Horse Road', '茶马古道'],
        ['Nake Li village', '那柯里'],
        ['Pu\'er Tea Museum', '茶博苑'],
        ['Beibiao Garden', '北标园'],
        ['Yinsheng tea estate', '银生茶庄园'],
        ['Coffee estates — choose one of five', '咖啡庄园——五选一']
      ]
    },
    {
      id: 'lincang', slug: 'destination-lincang', ph: 'ph-4',
      t: ['Lincang', '临沧'],
      short: ['Lincang', '临沧'],
      region: ['Lincang, southwest Yunnan', '云南西南部 · 临沧'],
      img: {
        src: 'assets/images/lincang-tea-destination-card-400x250.jpg',
        alt: ['Tea mountains in Lincang', '临沧茶山']
      },
      /* 2026-09-21：西双版纳换成临沧。临沧暂未收录日游（无客户行程资料），
         呈现为可用目的地、日游数先标「暂无」，不沿用原西双版纳的 heldBack 说明。 */
      summary: [
        'Tea country — the high tea mountains of Fengqing and Menghai\'s Mengku, crossed by the Lancang River. A quiet corner for the gentlest kind of recovery travel.',
        '临沧——云南著名茶乡，凤庆、勐库茶山腹地，澜沧江穿境而过。适合最安静、最慢节奏的康养旅行。'
      ],
      highlights: [
        ['Bingdao old tea trees', '冰岛古茶树'],
        ['Xigui tea village', '昔归古村'],
        ['Mengku Daxue Mountain', '勐库大雪山'],
        ['Lancang River valley', '澜沧江峡谷']
      ]
    }
  ];

  /* ------------------------------------------------------------
     Route-only place names
     Stops that appear on a journey routing but are NOT carried as
     destination pages: the client supplied no destination detail
     and no day-tour content for them, so their pages were removed
     rather than published as empty placeholders. They render as
     plain text on the itinerary (no link), so the stated route
     stays faithful to the client's own product definition.
     See removed-content.md.
     ------------------------------------------------------------ */
  MT.ROUTE_ONLY = [
    { id: 'lijiang', t: ['Lijiang', '丽江'] },
    { id: 'shangrila', t: ['Shangri-La', '香格里拉'] }
  ];

  /* ------------------------------------------------------------
     Process — 4 steps
     NOTE the shape: two parallel language ROWS, not a [en, zh] pair
       [ ['<en heading>', '<en body>'], ['<zh heading>', '<zh body>'] ]
     site.js re-pairs them with bi() before calling pick().
     ⚠ 这四条是「我方归纳」的康养口径流程，不是客户给的原文。素材来源：
       · 客户确认的 CMT Health 临床就医五步流程
         （资料/客户发回的文案确认/CMT-Health-流程介绍文案确认.xlsx，step-1~5）
       · 新加坡仲景团 8 日行程里的餐饮禁忌 / 体质辨识细节
         （资料/旅游/确定版--新加坡仲景中医学院云南抚仙湖养生.pdf）
       「出行前 7 天确认」这个数字同样来自临床站 FAQ。需客户确认后才算数。
     ------------------------------------------------------------ */
 MT.STEPS = [
  [
    ['Tell Us What You Need', 'The care you are considering, how many travellers, approximate dates, and anything health-related we should know.'],
    ['说出你的需要', '想体验的项目、同行人数、预计时间，以及需要提前关注的健康情况。']
  ],
  [
    ['Receive Your Personal Plan', 'A shortlist of recommended providers, a draft itinerary, and an estimated cost per person.'],
    ['收到专属方案', '甄选合适机构与项目，提供行程草案与单人费用参考。']
  ],
  [
    ['Confirm Your Wellness Journey', 'Checkups, TCM, dental care and other bookings are all confirmed seven days before departure.'],
    ['确认康养行程', '体检、中医、口腔等预约安排，出行前 7 天完成最终确认。']
  ],
  [
    ['Share Your Preferences', 'Allergens, dietary restrictions and vegetarian needs — every meal is screened and labelled, with TCM constitution review where relevant.'],
    ['告知你的偏好', '过敏原、饮食禁忌与素食需求；涉及中医时先做体质辨识。每一餐都会提前筛查并标注禁忌。']
  ]
];

  /* ------------------------------------------------------------
     Assurance — 6 commitments
     Source（逐条对应，非原创）: 新加坡仲景团 专属保障服务
       资料/旅游/确定版--新加坡仲景中医学院云南抚仙湖养生.pdf 第 12 页
     shape: { ico, t:['en','zh'], d:['en','zh'], tag:[[en,zh], ...] }
     - tag（2026-09-22 Flora 参考稿）：卡片底部的胶囊标签，**纯摘要**——
       每条的两个词都是从它自己那句 d 里提出来的，没有新增任何医疗事实。
     - ico 现在没有渲染器在读（参考稿的卡面只有 标题 / 描述 / 标签），
       留着是为了 Flora 改主意要图标时一行就能挂回去。
     ------------------------------------------------------------ */
  MT.ASSURANCE = [
    {
      ico: 'health',
      t: ['Health cover', '健康保障'],
      d: ['A clinician travels with the group throughout. Emergency response and hospital green channels are pre-arranged, and emergency medication is carried.',
          '全程配备医护人员跟团，协调急救保障及绿色通道等，应急药品齐全。'],
      tag: [['Clinician on tour', '随团医护'], ['Green channel', '急救绿色通道']]
    },
    {
      ico: 'transport',
      t: ['Transport cover', '交通保障'],
      d: ['Dedicated coach, point-to-point transfers, no mid-journey changes.',
          '专属大巴，点对点接送，避免中途换乘。'],
      tag: [['Dedicated coach', '专属大巴'], ['Point to point', '点对点接送']]
    },
    {
      ico: 'meal',
      t: ['Dietary cover', '饮食保障'],
      d: ['All meals are screened for allergens in advance and labelled with the therapeutic purpose and contraindications of each medicinal dish. Vegetarian and restricted diets are catered for separately.',
          '所有餐饮提前筛查过敏原，标注药膳功效与禁忌，并根据素食者及饮食禁忌者定制饮食。'],
      tag: [['Allergen screening', '过敏原筛查'], ['Custom diets', '饮食定制']]
    },
    {
      ico: 'stay',
      t: ['Accommodation cover', '住宿保障'],
      d: ['Rooms are fitted with non-slip provisions, umbrellas and power adapters, and are disinfected and ventilated daily.',
          '酒店房间配备防滑设施、雨伞、充电转换头，每日消毒通风。'],
      tag: [['Non-slip rooms', '防滑设施'], ['Daily disinfection', '每日消毒通风']]
    },
    {
      ico: 'service',
      t: ['Service cover', '服务保障'],
      d: ['A staff member travels with the group, with 24-hour emergency response.',
          '有一位工作人员随团，24 小时应急响应。'],
      tag: [['Staff on tour', '随团工作人员'], ['24-hour response', '24 小时响应']]
    },
    {
      ico: 'insurance',
      t: ['Insurance', '保险保证'],
      d: ['Travel accident insurance is purchased for every guest.',
          '为每位客户购买旅游意外险。'],
      tag: [['Travel accident cover', '旅游意外险'], ['Every guest', '每位客户']]
    }
  ];

  /* ------------------------------------------------------------
     FAQ
     Same parallel-row shape as STEPS:
       [ ['<en question>', '<en answer>'], ['<zh question>', '<zh answer>'] ]
     ------------------------------------------------------------ */
  MT.FAQ = [
    [
      ['How far ahead do appointments have to be confirmed?', 'Seven days before the group arrives, for screening, TCM and dental alike.'],
      ['临床预约需要提前多久确认？', '体检、中医、牙科一致：团队抵达前 7 天。']
    ],
    [
      ['What language are the reports in?', 'Bilingual. Screening and dental reports are issued in Chinese and English, and the read-out with the guest is done in English.'],
      ['报告是什么语言？', '双语。体检与牙科报告为中英双语，向客人的解读用英文进行。']
    ],
    [
      ['Is there language support during appointments?', 'Yes — bilingual accompanying and guidance is part of every clinical product, not an add-on.'],
      ['就诊期间有语言支持吗？', '有。双语陪诊与引导属于每个临床产品的标准配置，不是附加项。']
    ],
    [
      ['How are dietary restrictions handled?', 'Allergens are screened in advance, every medicinal dish is labelled with its purpose and contraindications, and vegetarian or restricted diets are prepared separately.'],
      ['饮食禁忌如何安排？', '提前筛查过敏原，每道药膳标注功效与禁忌，素食与饮食禁忌另行安排。']
    ],
    [
      ['Can a group combine several lines in one trip?', 'Yes. A common pattern is screening or a dental appointment in Kunming at the start of the trip, then touring, then a multi-day TCM stay at Fuxian Lake.'],
      ['一个团能在一次行程里组合多条线吗？', '可以。常见做法是抵达后先在昆明做体检或牙科，随后游览，最后到抚仙湖做多日中医康养。']
    ],
    [
      ['What is not covered by the standard products?', 'Dental implants, specialised TCM treatment and long-stay recovery for oncology patients. These need a bespoke quotation.'],
      ['标准产品覆盖不到哪些？', '牙科种植牙、中医药特殊治疗、癌症康复期长程疗养等，需要专项定制与单独报价。']
    ]
  ];

  /* ------------------------------------------------------------
     Resources
     ------------------------------------------------------------ */
  MT.RESOURCES = [
    {
      tag: ['Guide', '指南'], ph: 'ph-1',
      t: ['What to check before your screening day',
          '做体检前需要注意什么'],
      d: ['Fasting windows, endoscopy scheduling, report turnaround and why the 7-day confirmation rule exists.',
          '空腹时段、肠胃镜排期、报告交付周期，以及 7 天确认规则从何而来。']
    },
    {
      tag: ['Destinations', '目的地'], ph: 'ph-5',
      t: ['Why Fuxian Lake works as a wellness base',
          '抚仙湖为什么适合做康养基地'],
      d: ['Altitude, lake calm, courtyard accommodation and the therapy facilities at the Sheng\'ai base.',
          '海拔、湖面风况、庭院式住宿，以及圣爱基地的理疗设施。']
    },
    {
      tag: ['Clinical', '临床'], ph: 'ph-3',
      t: ['The nine body types, and what overseas guests should expect from identification',
          '九种体质辨识：海外客人该期待什么'],
      d: ['What the assessment actually involves, how long it takes, and how it feeds the herbal prescription.',
          '辨识实际包含哪些环节、需要多长时间，以及它如何决定中药处方。']
    },
    {
      tag: ['Guide', '指南'], ph: 'ph-4',
      t: ['The twelve two-hour periods: how a TCM day is actually scheduled',
          '十二时辰：中医康养的一天是怎么排的'],
      d: ['Why a retreat programme is built around meridian time slots rather than clock hours.',
          '为什么康养行程按经络时辰编排，而不是按钟点编排。']
    }
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = MT;
  root.MT = MT;
})(typeof globalThis !== 'undefined' ? globalThis : this);
