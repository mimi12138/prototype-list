/* ==============================================================
   CMT Medical Travel — journeys + day tours
   Merges into window.MT / module.exports alongside data.js.

   JOURNEYS  2 group itineraries with first-hand source material
   DAYTOURS  9 Yunnan day tours: the 7 out of 资料/旅游/云南日游产品行程
             whose source PDFs carry a text layer, plus 2 Pu'er tours the
             client typed up from screenshots (2026-09-21, "选中的两份普洱资料").
             That Pu'er copy was OCR'd, so its spellings were corrected and
             unreadable passages dropped — see the note above those two entries.
             The other 26 PDFs are image-only with no extractable outline, so
             they were removed from the build entirely rather than shipped as
             empty pages (see project memory for the list of what was dropped).
   ============================================================== */
(function (root, factory) {
  'use strict';
  var MT = (typeof module !== 'undefined' && module.exports)
    ? require('./data.js')
    : root.MT;
  if (!MT) throw new Error('data.js must load first');
  factory(MT);
  if (typeof module !== 'undefined' && module.exports) module.exports = MT;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (MT) {
  'use strict';

  /* ============================================================
     JOURNEYS
     ============================================================ */
  MT.JOURNEYS = [

    /* ---------------------------------------------------------
       J1 — Singapore Zhongjing TCM College, Fuxian Lake, 8 days
       --------------------------------------------------------- */
    {
      id: 'fuxianhu-8d', slug: 'journey-fuxianhu-8d', ph: 'ph-5',
      /* 客户给的实拍封面，替换 ph-5 色块。卡片图位是 16:10，
         这张原图 1586×992 = 1.599，比例正好一致，不需要裁。 */
      img: {
        src: 'assets/images/fuxianfu-card.jpg',
        alt: ['Tea on a lakeside terrace above Fuxian Lake', '抚仙湖畔的观景茶席']
      },
      /* 详情页顶部 banner 用的实拍图（与首页 hero 同一张，Flora 2026-09-20 指定）。
         原图 2091×752 = 2.78:1，banner 约 4:1 → 纵向会裁掉约三成，
         取景靠 object-position 微调，别改这里的文件。 */
      heroImg: 'assets/images/fuxianhu-hero.jpg',
      t: ['Singapore Zhongjing TCM College — Fuxian Lake Wellness Journey',
          '新加坡仲景中医学院 · 云南抚仙湖养生之旅'],
      tag: ['Group departure', '团体出行'],
      days: 8, nights: 7,
      /* 团期统一口径：全站不出现具体日期。行程只是 sample，天数／价格／日期一律走咨询。
         所以 dates 永远写「按需」，不要回填真实日期——一填就开始倒计时过期。 */
      dates: ['Dates on request', '团期按需'],
      cities: ['kunming', 'chengjiang'],
      lines: ['tcm'],
      summary: [
        'A confirmed eight-day group departure for a Singapore TCM college, built as a teaching journey rather than a spa stay: three lectures delivered by the college\'s own physicians sit alongside daily baduanjin practice, meridian tuina, moxibustion and food therapy.',
        '已确认成行的 8 日团体行程，为新加坡中医学院定制。定位是「教学型康养」而非单纯疗养：学院专家主讲三场中医讲座，与每日八段锦、经络推拿、艾灸与药膳并行。'
      ],
      spec: [
        [['Duration', '时长'], ['8 days / 7 nights', '8 天 7 夜']],
        [['Dates', '团期'], ['On request — we fit the dates to you', '按需排期——按你的时间安排']],
        [['Route', '线路'], ['Kunming → Chengjiang · Fuxian Lake → Kunming', '昆明 → 澄江·抚仙湖 → 昆明']],
        [['Getting around', '交通接驳'], ['38-seat coach, airport meet and greet', '38 座大巴，机场接机']],
        [['Night 1 hotel', '第 1 晚住宿'], ['4-star or above in Kunming (tentatively Hilton Kunming Dianchi)', '昆明携程四星以上酒店（暂定昆明滇池希尔顿酒店）']],
        [['Nights 2–8 hotel', '第 2–8 晚住宿'], ['Sheng\'ai TCM healing resort — Liuhe Xiaoyuan courtyard hotel, with herbal foot bath and soak facilities', '圣爱中医疗愈度假酒店——圣爱六合小院（中医主题庭院式酒店，含中药沐足／泡浴配套）']],
        [['Physician lectures', '专家授课'], ['3 sessions — Dr Zhang Yan ×2, Dr Zheng Aizhu ×1', '3 场——张彦博士 ×2、郑爱珠医师 ×1']]
      ],
      itinerary: [
        {
          d: ['Day 1', '第 1 天'],
          t: ['Arrival in Kunming — the programme opens', '抵达昆明 · 养生启幕'],
          slots: [
            ['16:35–18:00', 'Airport pick-up. Group arrives at Changshui on the 12:20–16:35 flight; 38-seat coach meets the group.', '机场接机（东方航空 12:20–16:35 抵达长水机场，38 座大巴接机）'],
            ['18:00–20:00', 'Welcome dinner at a restaurant on the shore of Dianchi Lake.', '欢迎晚宴（滇池边餐厅）'],
            ['20:00–', 'Check-in, rest, free time. Tentative hotel: Hilton Kunming Dianchi.', '办理入住及休息、自由活动（暂定昆明滇池希尔顿酒店）']
          ]
        },
        {
          d: ['Day 2', '第 2 天'],
          t: ['Herbal memory, then moving to the lake', '焕新百草记忆 · 传承白药传奇'],
          slots: [
            ['07:00–08:00', 'Breakfast.', '早餐'],
            ['08:00–09:30', 'Haidong dam on Dianchi Lake — Siberian black-headed gulls.', '游览昆明海埂大坝（西伯利亚红嘴鸥）'],
            ['09:30–11:30', 'Yunnan Baicao Village, a working herbal plant collection.', '参观游览云南百草村', ['p01-03.jpg', 'p01-04.jpg']],
            ['11:30–12:30', 'Transfer to the Sheng\'ai health base at Fuxian Lake.', '前往抚仙湖圣爱健康基地'],
            ['12:30–13:30', 'Medicinal food therapy lunch, served at table.', '养生药膳桌餐'],
            ['13:00–14:30', 'Check in and rest at Liuhe Xiaoyuan.', '办理入住、午休（六合小院）', ['p01-01.jpg', 'p01-02.jpg']],
            ['14:30–15:30', 'Guided tour of the base — therapy rooms, treatment menu, the grounds.', '圣爱健康基地参观，了解健康基地、中医理疗及养生环境介绍', ['p02-01.jpg']],
            ['15:30–16:00', 'Welcome ceremony. Each guest receives a fresh flower.', '欢迎仪式（每人赠送一支鲜花）'],
            ['16:00–18:00', 'Hands-on mugwort hammer workshop — herbal ingredients explained, made by hand, taken home.', '中药手工艾草锤制作（中药材讲解 + 手工实操，成品可带走）', ['p02-02.jpg']],
            ['18:00–20:00', 'Fuxian Lake dinner: copper-pot fish, copper-pot potato rice, light medicinal sides. Ingredients and their rationale explained.', '仙湖特色晚宴：抚仙湖特色铜锅鱼、铜锅洋芋饭、药膳清淡开胃小菜，讲解食材养生原理', ['p02-03.jpg', 'p02-04.jpg']],
            ['20:00–21:00', 'Starlight night market and bonfire gathering.', '游览星光夜市、篝火晚会', ['p03-01.jpg', 'p03-02.jpg']],
            ['21:00–', 'Return to the hotel. Herbal foot bath with a dehumidifying formula, plus soaking guidance.', '返回酒店休息。房间中药沐足（祛湿配方，配泡脚指导）', ['p03-03.jpg']]
          ],
          note: ['The hotel issues a comfort kit — dental floss, sunscreen, wipes, nail clippers, disposable towel set, herbal tea sachets. Umbrellas and power adapters are provided in-room. Halal, vegetarian and restricted diets are arranged separately for every meal on request.',
                 '酒店发放省心套装（牙线、防晒、湿巾、指甲刀、一次性浴巾套装、养生小罐茶等）；雨伞、电源转换头均有配备。每餐可为素食者及饮食禁忌者特殊安排，我方会提供相关信息。']
        },
        {
          d: ['Day 3', '第 3 天'],
          t: ['Building the TCM foundation', '中医筑基 · 身心初调'],
          slots: [
            ['07:30–08:00', 'Morning practice — baduanjin consolidation, coach correcting each movement.', '晨练养生：八段锦巩固练习，教练纠正动作细节', ['p03-04.jpg']],
            ['08:00–09:00', 'Buffet breakfast.', '养生自助早餐'],
            ['09:00–11:00', 'Sheng\'ai fourteen-meridian tuina session.', '圣爱·调养十四经络推拿体验'],
            ['11:00–12:00', 'Herbal tea blending workshop.', '圣爱养生茶饮 DIY 制作体验'],
            ['12:00–14:30', 'Lunch and rest. Medicinal food therapy matched to body type; a full 1.5 hours of rest is protected.', '午餐 + 午休：九种体质养生药膳，保证 1.5 小时休息时间'],
            ['14:30–17:00', 'Fuhaiwan wetland park — scenery, deep-breathing, flower fields, free time with a staff escort.', '抚海湾湿地公园：赏景、深呼吸，花海打卡，自由活动（专人陪同）', ['p04-01.jpg', 'p04-02.jpg']],
            ['17:30–18:30', 'Medicinal dinner — full therapy menu, spring liver-nourishing theme.', '药膳晚餐：全药膳宴，春日养肝主题', ['p04-03.jpg', 'p04-04.jpg']],
            ['19:30–21:30', 'TCM lecture by the Singapore Zhongjing college. Dr Zhang Yan — "The Stillness of Fuxian Lake and the Flow of Emotion: Balancing the Seven Emotions in TCM".', '中医主题讲座（新加坡仲景中医学院专家授课）。讲者：张彦博士；题目《抚仙湖的静谧与心绪的流动——中医七情平衡之道》'],
            ['21:00–', 'Rest. Herbal foot bath and a sleep-supporting tea.', '休息。房间中药沐足，提供助眠茶饮']
          ]
        },
        {
          d: ['Day 4', '第 4 天'],
          t: ['Nature and culture', '自然康养 · 文化浸润'],
          slots: [
            ['07:30–08:00', 'Morning practice — baduanjin.', '晨练养生：八段锦巩固练习'],
            ['08:00–09:00', 'Buffet breakfast.', '养生自助早餐'],
            ['09:00–12:00', 'Luchong scenic area. Gentle shoreline walk with commentary.', '禄充风景区康养游览：漫步抚仙湖岸（沿平缓路线），景区讲解', ['p05-02.jpg', 'p05-03.jpg']],
            ['12:00–14:00', 'Lunch and rest. Yunnan wellness cuisine.', '午餐 + 午休：云南特色养生餐'],
            ['14:00–18:00', 'Chengjiang lotus-root starch, an intangible cultural heritage: workshop visit, hands-on simplified production, tasting plain and medicinal versions (with osmanthus and goji).', '澄江藕粉非遗体验：参观藕粉制作工坊，亲手制作藕粉（简化操作流程），品尝原味／药膳味藕粉（加桂花、枸杞）', ['p05-04.jpg', 'p05-05.jpg', 'p05-06.jpg']],
            ['18:00–19:30', 'Medicinal dinner — full therapy menu, spleen-and-stomach theme.', '药膳晚餐：全药膳宴（健脾养胃主题）'],
            ['19:30–21:30', 'TCM lecture. Dr Zheng Aizhu — "Clouds Unfolding, Clouds Settling: The Wisdom of Body–Mind Harmony in the Yellow Emperor\'s Inner Canon".', '中医主题讲座。讲者：郑爱珠医师；题目《云卷云舒皆养生——黄帝内经中的身心调和智慧》'],
            ['21:30–', 'Rest.', '休息']
          ]
        },
        {
          d: ['Day 5', '第 5 天'],
          t: ['Science, then therapy', '科普探秘 · 身心疗愈'],
          slots: [
            ['07:30–08:00', 'Morning practice — baduanjin.', '晨练养生：八段锦'],
            ['08:00–09:00', 'Buffet breakfast. Fresh lotus-root starch added to the line-up.', '养生自助早餐：面包、牛奶咖啡、培根，新增当日鲜制藕粉'],
            ['09:00–12:00', 'Chengjiang Fossil Site museum — a guided walk through palaeontology and what it says about ecology.', '化石地博物馆研学：专业讲解员科普古生物与生态环境的关系', ['p06-01.jpg', 'p06-02.jpg']],
            ['12:00–14:00', 'Lunch and rest. Yunnan crossing-the-bridge noodles, light and tonic broths available.', '午餐 + 午休：云南特色过桥米线（分清淡／滋补汤底）', ['p06-03.jpg', 'p06-04.jpg']],
            ['14:30–17:30', 'Moxibustion targeted at neck, shoulder, spleen and stomach, plus a gentle Sheng\'ai therapy session. Therapists take questions.', '圣爱健康基地艾灸（针对肩颈、脾胃调理）+ 调养理疗（轻柔手法），配理疗师答疑', ['p07-01.jpg', 'p07-02.jpg']],
            ['17:30–19:00', 'Wild mushroom hotpot — medicinal broth, lung-nourishing theme.', '野生菌火锅晚餐：药膳野生菌火锅（滋阴润肺主题）', ['p07-03.jpg', 'p07-04.jpg']],
            ['19:00–20:30', 'TCM music therapy — guzheng and erhu recordings with acupressure instruction, guided by the college physician travelling with the group.', '中医音乐疗法：古筝、二胡等传统乐器音频播放，搭配穴位按摩教学（新加坡中医学院随团中医师进行指导）'],
            ['20:30–21:30', 'Private herbal soak in each room, blended to the guest\'s constitution identification, with guidance on use.', '私人定制中药泡浴：在各自房间进行，根据体质辨识结果配药包，专人指导使用'],
            ['21:30–', 'Rest.', '休息']
          ]
        },
        {
          d: ['Day 6', '第 6 天'],
          t: ['Therapy and tea', '中医理疗 · 茶道静心'],
          slots: [
            ['07:30–08:00', 'Morning practice — baduanjin plus meridian stretching.', '晨练养生：八段锦 + 经络拉伸'],
            ['08:00–09:00', 'Buffet breakfast.', '养生自助早餐'],
            ['09:00–11:30', 'Bronze ware museum in Jiangchuan, Yuxi — the first specialist bronze museum in central Yunnan, opened 1994, holding major Dian-kingdom bronzes including the ox-and-tiger table.', '参观青铜器博物馆：滇中首家专业青铜馆（1994 开馆），坐落玉溪江川，藏牛虎铜案等古滇重器', ['p08-01.jpg', 'p08-02.jpg']],
            ['11:30–14:30', 'Lunch and rest. Yunnan regional dishes.', '午餐 + 午休：云南特色菜'],
            ['14:30–15:30', 'Health talk by the base physician on common misconceptions about daily health care in later life, with open Q&A.', '中医健康讲座：基地中医分享「中老年日常保健误区」，互动答疑'],
            ['15:30–18:00', 'Sheng\'ai ethnic-medicine hot compress session.', '圣爱调养·民族医药热敷体验', ['p08-03.jpg']],
            ['18:00–19:00', 'Medicinal dinner — full therapy menu, qi-and-blood theme.', '药膳晚餐：全药膳宴（补气养血主题）'],
            ['19:00–21:00', 'Herbal handicraft — women make herbal earrings, necklaces or bead bracelets; men make bead bracelets.', '中药手工制作（女士：中药耳环／项链／手串；男士：中药手串）', ['p08-04.jpg', 'p08-05.jpg']],
            ['21:00–', 'Rest. Herbal foot bath, free conversation.', '休息。中药沐足，自由交流']
          ]
        },
        {
          d: ['Day 7', '第 7 天'],
          t: ['Town, market, and an all-lotus banquet', '小镇漫游 · 全藕养生'],
          slots: [
            ['07:30–08:00', 'Morning practice — baduanjin, outdoors where the site allows.', '晨练养生：八段锦练习（适合户外场地）'],
            ['08:00–09:00', 'Buffet breakfast.', '养生自助早餐'],
            ['09:00–11:00', 'Shihua Garden wet market in Chengjiang — lake fish, wild mushrooms, coloured glutinous rice balls, freshly fried potato cakes.', '柿花园菜市场打卡：抚仙湖鱼鲜、野生菌、七彩糯米饭团、现炸洋芋粑粑', ['p09-01.jpg', 'p09-02.jpg']],
            ['11:00–12:00', 'Pu\'er tea tasting — raw and ripe, health effects explained, served with medicinal tea snacks.', '茶道养生体验：云南普洱茶品鉴（生普／熟普分类），讲解茶疗功效，搭配药膳茶点', ['p09-03.jpg', 'p09-04.jpg']],
            ['12:00–14:00', 'Lunch and rest. Dumpling banquet with wellness fillings — chive and egg, shiitake and wood ear, shrimp and lotus root.', '午餐 + 午休：饺子宴（养生馅料：韭菜鸡蛋、香菇木耳、虾仁莲藕）', ['p10-01.jpg']],
            ['14:00–16:00', 'Chengjiang Municipal Hospital of TCM — herbal wax compress. Warm, non-invasive, used for cold-pain in the joints and soft-tissue recovery.', '澄江市中医院——中药蜡疗热敷体验：温经通络、消肿止痛，针对关节冷痛、软组织损伤恢复'],
            ['16:30–18:00', 'Xiaowan village and Yunnan coffee tasting. A former farming and fishing village on the west shore, now a national rural-tourism demonstration village.', '小湾村游览 + 云南咖啡品鉴：抚仙湖西岸，背靠笔架山，全国乡村旅游重点村', ['p10-02.jpg', 'p10-03.jpg']],
            ['18:00–19:00', 'All-lotus banquet — more than ten preparations of lotus root, explained by a nutritionist.', '全藕宴：藕片、藕丁、藕饼等 10 余种做法，营养师讲解', ['p11-01.jpg', 'p11-02.jpg']],
            ['19:00–21:00', 'Lecture. Dr Zhang Yan — "The Fuxian Lake Breeze that Clears the Mind: Practical Tools for Everyday Emotional Adjustment".', '专家授课。张彦博士《抚仙湖的微风，吹散心中的阴霾——日常心理调适的实用锦囊》'],
            ['21:00–21:30', 'Herbal sachet workshop — a licensed pharmacist guides the selection of calming, sleep-supporting herbs.', '中药香囊制作：中医执业药师指导选料（助眠、安神），自由交流养生心得', ['p11-03.jpg']],
            ['21:00–', 'Foot bath and rest.', '沐足休息']
          ]
        },
        {
          d: ['Day 8', '第 8 天'],
          t: ['Departure — the programme continues at home', '返程 · 养生延续'],
          slots: [
            ['07:30–08:00', 'Morning practice — baduanjin plus meridian stretching.', '晨练养生：八段锦 + 经络拉伸'],
            ['08:00–09:00', 'Buffet breakfast, light and easy to digest for travel.', '养生自助早餐：清淡易消化，适合旅途'],
            ['09:00–11:00', 'Wellness salon and sharing session. Guests compare notes; the physician summarises individual recommendations.', '养生沙龙·分享会：团员分享 8 日养生体验与收获，中医师总结个性化养生建议'],
            ['12:00–14:30', 'Lunch (nine-body-type medicinal menu), rest, check out.', '午餐（九种体质养生药膳）+ 午休 + 退房'],
            ['14:30–17:00', 'Dounan flower market, the largest fresh-cut flower trading market in Asia.', '逛斗南花市（亚洲最大的鲜花交易市场）', ['p12-01.jpg', 'p12-02.jpg']],
            ['17:00–18:00', 'Transfer to the airport. The group is seen to the gate and given departure wellness notes on travel diet and rest.', '前往机场，返程；目送团员登机，提供返程养生小贴士（如旅途饮食、作息建议）'],
            ['21:25', 'Flight departs.', '航班起飞（21:25）']
          ]
        }
      ],
      includes: [
        ['Airport meet and greet, dedicated 38-seat coach throughout', '机场接机，全程 38 座专属大巴'],
        ['7 nights — 1 night Kunming, 6 nights Sheng\'ai Liuhe Xiaoyuan', '7 晚住宿——昆明 1 晚，圣爱六合小院 6 晚'],
        ['All meals, medicinal food therapy menus, allergen screening', '全程餐食、药膳菜单、过敏原筛查'],
        ['Daily baduanjin practice with a coach', '每日八段锦晨练，配教练'],
        ['Fourteen-meridian tuina, moxibustion, herbal wax compress, hot compress, music therapy', '十四经络推拿、艾灸、中药蜡疗、民族医药热敷、音乐疗法'],
        ['Private herbal soak and daily herbal foot bath', '私人定制中药泡浴与每日中药沐足'],
        ['Three physician lectures', '三场专家讲座'],
        ['Both museums, the lotus workshop, the flower market', '两处博物馆、非遗藕粉工坊、斗南花市'],
        ['Clinician travelling with the group, 24-hour emergency response', '随团医护人员，24 小时应急响应'],
        ['Travel accident insurance for every guest', '每位客人旅游意外险']
      ],
      gift: [
        'The college presents each guest with a Yunnan gift box valued at close to RMB 500: Jianshui purple clay ware, plateau crimson rose, Fuxian Lake lotus-root starch, polygonatum-and-jade-bamboo lotus starch, and a wellness pack.',
        '仲景中医学院赠送每位顾客一份价值近五百元云南特色大礼包，包含云南建水紫陶、高原墨红玫瑰、抚仙湖藕粉、黄精玉竹藕粉、养生包。'
      ],
      giftImgs: [
        { f: 'p12-03.jpg', t: ['Jianshui purple clay ware', '云南建水紫陶'] },
        { f: 'p12-04.jpg', t: ['Polygonatum & jade-bamboo lotus starch', '黄精玉竹藕粉'] },
        { f: 'p12-05.jpg', t: ['Fuxian Lake lotus-root starch', '抚仙湖藕粉'] },
        { f: 'p12-06.jpg', t: ['Plateau crimson rose', '高原墨红玫瑰'] },
        { f: 'p12-07.jpg', t: ['Wellness pack', '养生包'] }
      ]
    },

    /* ---------------------------------------------------------
       J2 — France group, 6 days / 5 nights
       --------------------------------------------------------- */
    {
      id: 'france-6d', slug: 'journey-france-6d', ph: 'ph-4',
      /* 客户给的实拍封面（Flora 2026-09-21），替换 ph-4 色块。
         卡片图位 16:10，原图 1586×992 = 1.599，比例一致不用裁。 */
      img: {
        src: 'assets/images/france-card.jpg',
        alt: ['Morning taiji practice on a lakeside deck at Fuxian Lake',
              '抚仙湖畔木台上的晨间太极']
      },
      /* 详情页 banner 实拍图。原图 2092×752 = 2.78:1，banner 约 4:1，
         纵向裁掉约三成，取景靠 object-position 微调。 */
      heroImg: 'assets/images/france-hero.jpg',
      t: ['France Group — Sheng\'ai Wellness Retreat, 6 Days / 5 Nights',
          '法国团 · 圣爱康养 6 天 5 晚'],
      tag: ['Group departure', '团体出行'],
      days: 6, nights: 5,
      dates: ['Dates on request', '团期按需'],
      cities: ['chengjiang'],
      lines: ['tcm'],
      summary: [
        'A six-day stay at the Fuxian Lake base for a French group, structured by the twelve two-hour periods of the meridian clock rather than by clock hours. Every day carries the same spine — practice, breakfast, then either a consultation, a lecture, therapy or an excursion — with the evening closing on a herbal foot bath.',
        '为法国团设计的抚仙湖 6 日停留，按十二时辰经络节律编排而非按钟点。每日结构一致：功法实训、早餐，随后是看诊、讲座、理疗或游览，晚间以中药泡足收尾。'
      ],
      spec: [
        [['Duration', '时长'], ['6 days / 5 nights', '6 天 5 晚']],
        [['Dates', '团期'], ['On request — we fit the dates to you', '按需排期——按你的时间安排']],
        [['Base', '基地'], ['Sheng\'ai health base, Fuxian Lake, Chengjiang', '澄江抚仙湖圣爱健康基地']],
        [['Structure', '编排方式'], ['Twelve two-hour periods (meridian clock)', '十二时辰（经络节律）']],
        [['Daily practice', '每日功法'], ['Taiji or baduanjin, every morning', '太极或八段锦，每日晨间']],
        [['Per-person cost', '人均费用'], ['RMB 11,000 (see breakdown)', '11,000 元／人（见费用明细）']]
      ],
      itinerary: [
        {
          d: ['Day 1', '第 1 天'],
          t: ['Arrival and introductions', '抵达与相识'],
          slots: [
            [['Mao hour 06:00–07:00', '卯时 06:00–07:00'], 'Airport pick-up; check-in; briefing on the six-day programme.', '机场接机服务；办理入住；6 天行程讲解'],
            [['Wu hour (11:00–13:00)', '午时'], 'Lunch and rest.', '午餐 + 午休'],
            [['Wei hour 14:00–', '未时 14:00–'], 'Guided tour of the Sheng\'ai health base.', '参观圣爱健康基地'],
            [['Shen hour 15:30–', '申时 15:30–'], 'Herbal tea break, then a workshop making traditional pill, powder, paste and pellet preparations.', '下午茶（品尝中医养生茶）；体验丸散膏丹制作'],
            [['You hour 18:00–19:30', '酉时 18:00–19:30'], 'Nutritional dinner and rest.', '营养晚餐及休息'],
            [['Xu hour 20:00–', '戌时 20:00–'], 'Sino-French welcome gathering — introductions all round.', '中法交流欢迎会（自我介绍及互相认识）'],
            [['Hai hour 21:30–', '亥时 21:30–'], 'Herbal foot bath, formula adjusted to need. Rest.', '中药泡足（按需定制足浴方）；休息']
          ]
        },
        {
          d: ['Day 2', '第 2 天'],
          t: ['Consultation and lecture', '看诊与讲座'],
          slots: [
            [['Mao hour 06:00–07:00', '卯时 06:00–07:00'], 'Run along the Caohai wetland (optional).', '草海跑步（自愿参加）'],
            [['Chen hour (07:00–09:00)', '辰时'], 'Taiji or baduanjin practice, then breakfast, then physician consultation with nine-body-type identification and a treatment plan where needed.', '中医功法实训（太极或八段锦）；早餐；医师看诊（九种体质检测）及按需制定诊疗方案'],
            [['Si hour 10:30–', '巳时 10:30–'], 'Meditation lecture.', '禅修讲座'],
            [['Wu hour (11:00–13:00)', '午时'], 'Lunch and rest.', '午餐 + 午休'],
            [['Wei hour 14:00–', '未时 14:00–'], 'TCM health lecture, then a half-day visit to the Cambrian fossil museum.', '中医养生讲座；寒武纪博物馆半日游'],
            [['Xu hour 20:00–', '戌时 20:00–'], 'Free time.', '自由活动'],
            [['Hai hour 21:30–', '亥时 21:30–'], 'Herbal foot bath.', '中药泡足（按需定制足浴方）']
          ]
        },
        {
          d: ['Day 3', '第 3 天'],
          t: ['Lake and fire', '湖上与篝火'],
          slots: [
            [['Chen hour (07:00–09:00)', '辰时'], 'Taiji or baduanjin practice, breakfast, then a herbal wellness morning tea.', '中医功法实训（太极或八段锦）；早餐；中医养生早茶（品尝中医养生茶）'],
            [['Si hour 10:30–', '巳时 10:30–'], 'Rest, then tuina for neck, shoulder or head.', '休息；中医推拿（肩颈按摩或头部按摩）'],
            [['Wu hour (11:00–13:00)', '午时'], 'Lunch and rest.', '午餐 + 午休'],
            [['Wei hour 14:00–', '未时 14:00–'], 'Boating on Fuxian Lake with local specialities.', '抚仙湖划船及品尝特色美食'],
            [['Xu hour 20:00–', '戌时 20:00–'], 'Bonfire gathering.', '篝火晚会'],
            [['Hai hour 21:30–', '亥时 21:30–'], 'Herbal foot bath.', '中药泡足（按需定制足浴方）']
          ]
        },
        {
          d: ['Day 4', '第 4 天'],
          t: ['Ridge walk and treatment', '徒步与治疗'],
          slots: [
            [['Chen hour (07:00–09:00)', '辰时'], 'Taiji or baduanjin practice, breakfast, then rest after the meal.', '中医功法实训（太极或八段锦）；早餐；餐后休息'],
            [['Si hour 09:30–', '巳时 09:30–'], 'Jianshan ridge walk.', '尖山徒步游'],
            [['Wu hour (11:00–13:00)', '午时'], 'Lunch and rest.', '午餐 + 午休'],
            [['Wei hour 14:00–', '未时 14:00–'], 'Herbal tea break.', '下午茶（品尝中医养生茶）'],
            [['Shen hour 16:00–', '申时 16:00–'], 'TCM treatment — acupuncture, moxibustion and similar.', '中医治疗（针灸、艾灸等）'],
            [['Xu hour 20:00–', '戌时 20:00–'], 'Free time.', '自由活动'],
            [['Hai hour 21:30–', '亥时 21:30–'], 'Herbal foot bath.', '中药泡足（按需定制足浴方）']
          ]
        },
        {
          d: ['Day 5', '第 5 天'],
          t: ['The island', '孤岛半日'],
          slots: [
            [['Chen hour (07:00–09:00)', '辰时'], 'Taiji or baduanjin practice, breakfast, then rest after the meal.', '中医功法实训（太极或八段锦）；早餐；餐后休息'],
            [['Si hour 09:30–', '巳时 09:30–'], 'Tuina for neck, shoulder or head, then a meditation lecture.', '中医推拿（肩颈按摩或头部按摩）；禅修讲座'],
            [['Wu hour (11:00–13:00)', '午时'], 'Lunch and rest.', '午餐 + 午休'],
            [['Wei hour 14:00–', '未时 14:00–'], 'Half-day excursion to the island.', '孤岛半日游'],
            [['Xu hour 20:00–', '戌时 20:00–'], 'Free time.', '自由活动'],
            [['Hai hour 21:30–', '亥时 21:30–'], 'Herbal foot bath.', '中药泡足（按需定制足浴方）']
          ]
        },
        {
          d: ['Day 6', '第 6 天'],
          t: ['Departure', '离开'],
          slots: [
            [['Chen hour (07:00–09:00)', '辰时'], 'Taiji or baduanjin practice, breakfast, then rest after the meal.', '中医功法实训（太极或八段锦）；早餐；餐后休息'],
            [['Si hour 09:30–', '巳时 09:30–'], 'Visit and shop the Sheng\'ai product area.', '圣爱产品区参观购买'],
            [['Wei hour 14:00–', '未时 14:00–'], 'Departure.', '离开']
          ]
        }
      ],
      cost: {
        note: ['Per person, in RMB. Shown as an indication — final pricing is confirmed with your itinerary.', '按人均计，人民币。此处为参考——最终价格会随你的行程一并确认。'],
        rows: [
          [['TCM four-diagnosis and nine-body-type identification', '中医四诊及九种体质辨识'], '1,000'],
          [['Sheng\'ai therapy and tuina — 500 × 3 sessions', '中医调养治疗及推拿：500 元／人／次 × 3'], '1,500'],
          [['Meals — 300 × 6 days', '餐食：300 元／人／天 × 6 天'], '1,800'],
          [['Hotel — 800 × 5 nights', '酒店：800 元／人／天 × 5 天'], '4,000'],
          [['Fuxian Lake excursions', '抚仙湖周边游'], '1,000'],
          [['Bonfire gathering', '篝火晚会'], '200'],
          [['Meditation lecture', '禅修讲座'], '200'],
          [['Herbal tea breaks', '下午茶'], '100'],
          [['Pill, powder, paste and pellet workshop', '丸散膏丹制作'], '200'],
          [['Herbal foot bath — 200 × 5', '中药泡足：200 元／人 × 5'], '1,000']
        ],
        total: ['Total per person', '费用合计', '11,000']
      },
      includes: [
        ['Five nights at the base, all meals included', '基地住宿 5 晚，含全程餐食'],
        ['Physician consultation and nine-body-type identification', '医师看诊与九种体质辨识'],
        ['Three therapy or tuina sessions', '3 次理疗或推拿'],
        ['Daily taiji or baduanjin instruction', '每日太极或八段锦指导'],
        ['Meditation and TCM health lectures', '禅修讲座与中医养生讲座'],
        ['Fuxian Lake excursions, boating and the island trip', '抚仙湖周边游、划船与孤岛游览'],
        ['Nightly herbal foot bath', '每晚中药泡足'],
        ['Bonfire gathering and welcome reception', '篝火晚会与欢迎会'],
        ['Herbal tea breaks', '中医养生茶下午茶'],
        ['Workshops — pill/powder/paste/pellet and product area visit', '丸散膏丹制作与圣爱产品区参观']
      ]
    },
  ];

  /* ============================================================
     DAY TOURS — 7 items, every one with a real stop-by-stop outline.
     Split across Kunming (3) and Dali (4); Pu'er and Lincang
     are not in this list yet.
     ============================================================ */
  var T = function (city, slug, en, zh, type, opts) {
    var o = opts || {};
    return {
      /* `city` is the base the tour is catalogued under (drives the day-tour
         filter bar). `alsoIn` lists other destinations the tour should also
         appear on — e.g. a Fuxian Lake tour that joins from Kunming. */
      city: city, slug: slug, t: [en, zh],
      alsoIn: o.alsoIn || [],
      type: type, /* 'full' | 'half' | 'multi' */
      intro: o.intro || null,   /* [en, zh] — the one-line summary on the card and page lead */
      /* Selling points, one short phrase each — rendered as a tag row on the
         day-tour page. Only set it when the client's own copy lists them. */
      usp: o.usp || [],
      img: o.img || null,       /* { src, alt:[en, zh] } — the card cover */
      stops: o.stops || [],
      incl: o.incl || [],
      excl: o.excl || [],
      notes: o.notes || []
    };
  };

  MT.DAYTOURS = [

    /* ---------------- Kunming ---------------- */
    T('kunming', 'fuxianhu-chengjiang',
      'Chengjiang & Fuxian Lake day trip',       '昆明澄江抚仙湖纯玩 1 日游', 'full', {
      intro: ['Luchong fishing village, the only pink sand beach in China and a 90-minute lake cruise — the Fuxian Lake circuit out of Kunming.',
              '禄充千年渔村、国内唯一的粉红沙滩，加 90 分钟湖上游船——从昆明出发的抚仙湖环线。'],
      /* Runs at Fuxian Lake but assembles in Kunming, so it belongs on both
         destination pages. Catalogued under Kunming, as the client groups it. */
      alsoIn: ['chengjiang'],
      stops: [
        ['07:40–08:10', 'Assemble at Yongfeng Road and board.', '永丰路集合乘车'],
        ['08:10–09:30', 'Drive to Fuhaiwan Wetland Park on Fuxian Lake — 70 km from Kunming, about 1.5 hours.', '乘车前往抚仙湖【抚海湾湿地公园】（距离昆明 70 公里，约 1.5 小时车程）'],
        ['09:30–10:30', 'Flower fields along the wetland.', '游览网红地，观花海'],
        ['10:30–12:00', 'Hongshanzui and the pink sand beach — the only one of its kind in China.', '前往新晋网红打卡地红山咀；游览国内唯一的【粉红沙滩】'],
        ['12:00–13:00', 'Local lunch: copper-pot fish and potato-braised rice.', '特色中餐：铜锅鱼、洋芋焖饭'],
        ['13:00–14:30', 'Luchong scenic area, a national AAAA site and a working fishing village. Climb Bijia mountain for the full lake panorama, walk Boxi bay, see the Luchong fish caves and the protected Kanglang fish.', '游览千年渔村【抚仙湖禄充风景区】国家 AAAA 级景区；登【笔架山】俯览湖面全景，漫步波息湾，游览禄充鱼洞，观抗浪鱼体验区'],
        ['14:30–16:00', 'Fuxian Lake by boat — the cruise is included, about 90 minutes on the water.', '乘游船游览【抚仙湖】（含游船，约 90 分钟）'],
        ['16:00–16:40', 'Dragon King Temple and the ancient trees, then free time on Golden Sand beach.', '游览【龙王庙】【千年古树】，嬉戏金沙滩，自由活动'],
        ['16:40–18:10', 'Return to Kunming, Guanshang Convention Centre. Trip ends.', '乘车抵达昆明关上会展中心，结束行程']
      ],
      incl: [
        ['Air-conditioned coach, return', '全程空调旅游汽车往返'],
        ['Lunch — copper-pot fish and potato-braised rice', '中餐：特色铜锅鱼、洋芋焖饭'],
        ['Attraction tickets and the lake cruise', '景点门票、游船票'],
        ['Licensed Mandarin-speaking guide throughout', '专职持国语证导游讲解和服务'],
        ['Vehicles under 9 seats operate with the driver doubling as guide', '备注：9 座以下司机兼导游']
      ],
      excl: [
        ['Travel accident insurance', '旅游意外险'],
        ['Other paid activities inside the scenic area', '景区内其他娱乐项目'],
        ['Additional costs arising from force majeure', '因不可抗力因素所引起的额外费用']
      ],
      notes: [
        ['Children are charged half price for the meal and the seat.', '儿童含半价正餐及车位（特殊情况另附说明）。'],
        ['If force majeure changes the itinerary or increases cost, the guest bears the cost and we assist in resolving it.', '若因不可抗因素造成行程更改或费用增加，由客人承担，我社有义务协助解决。'],
        ['Bring a valid ID; children need a household register booklet.', '请携带有效身份证件，小孩带户口簿。'],
        ['Return travel falls in peak traffic and the trip may run late — plan connections accordingly.', '因返程时间为交通高峰期，可能延时结束行程，请合理安排时间。'],
        ['The coach plate number is texted to you the evening before departure.', '车牌号于出发前一日晚，以短信发送到你手机上。'],
        ['On the lake, follow crew instructions and wear a life jacket. Swimming or diving is strictly prohibited.', '抚仙湖乘船期间，游客需听从工作人员安排，穿救生衣，严禁私自下水游泳、潜水等。']
      ]
    }),
    T('kunming', 'shilin-jiuxiang',
      'Stone Forest & Jiuxiang day trip',       '昆明石林九乡纯玩 1 日游', 'full', {
      intro: ['Two karst landscapes in one day: the 5A Stone Forest above ground, the 4A Jiuxiang caves below.',
              '一天看两处喀斯特：地上 5A 石林，地下 4A 九乡溶洞。'],
      stops: [
        ['08:00', 'Assemble at the designated point; depart 08:00–08:20 for the national 5A Stone Forest scenic area, about 1.5 hours by road.', '8:00 以前到指定地点集合，8:00–8:20 乘车出发，赴国家 5A 级【石林风景名胜区】（车程约 1.5 小时）'],
        [['Morning', '上午'], 'Two and a half hours in the Stone Forest: major and minor stone forests, Shilin Lake, the stone screen, the classic viewpoints, the cat rock, the lotus pond and the Ashima formation.', '游览景区约 2.5 小时：大、小石林（石林湖、石屏风、石林胜景、千钧一发、望峰亭、猫石、莲花池、阿诗玛化身等）'],
        ['12:30–13:30', 'Lunch, shared table.', '享用午餐，团队用餐'],
        ['13:30–15:00', 'Jiuxiang scenic area, national 4A: Yincui gorge, Jinghun gorge, Lion Hall, Immortal Cave, the male-and-female waterfall, Shentian terraces, the Yi village, the underground stone forest, and the Jiuxiang cableway.', '前往 4A 级【九乡风景名胜区】游览荫翠峡、惊魂峡、雄狮大厅、仙人洞、雌雄瀑、神田、彝家寨、地下倒石林、乘坐九乡旅游索道'],
        ['17:00–18:30', 'Return to Kunming, about 1.5 hours. Trip ends at Wanxing pedestrian street, Kunming International Trade Centre.', '乘车返回昆明（行车 1.5 小时左右）；18:30 左右返回到昆明国贸中心万兴步行街散团，结束行程']
      ],
      incl: [
        ['Lunch at RMB 15 per person — eight dishes and a soup for a table of ten, with a Yili roast duck', '餐饮：午餐餐标 15 元/人，十人一桌八菜一汤，赠送宜良烤鸭'],
        ['Vehicle sized to the group, one proper seat per person', '交通：根据人数调车，确保 1 人 1 个正座'],
        ['Licensed guide throughout', '导游：全程持证导游讲解'],
        ['First-gate tickets for all listed sites, plus a one-way Jiuxiang cableway ticket', '门票：行程所列景点首道门票、九乡单程索道']
      ],
      excl: [
        ['Stone Forest shuttle bus, RMB 25 per person', '石林景区的电瓶车费用 25 元/人'],
        ['Travel accident insurance', '旅游意外险'],
        ['Personal spending and anything outside the inclusions', '其他个人消费及费用包含以外的所有费用']
      ],
      notes: [
        ['The operator may adjust the order of sites.', '我社有权对景点先后顺序进行调整。']
      ]
    }),
    T('kunming', 'shilin-dianchi',
      'Stone Forest & Dianchi Lake day trip',       '昆明石林滇池纯玩 1 日游', 'full', {
      intro: ['Dianchi Lake in the morning, the Stone Forest in the afternoon — the classic Kunming day out.',
              '上午滇池，下午石林——昆明最经典的一日线路。'],
      stops: [
        ['08:10', 'Assemble at Yongfeng Road and board.', '永丰路集合乘车'],
        ['08:30', 'Depart for Dianchi Lake scenic area — 10 km, about 30 minutes. Guide introduces the day and checks the group in.', '乘车出发，前往【滇池风景名胜区】（10 公里，车程约 30 分钟）'],
        ['09:00', 'Dianchi Lake — the largest freshwater lake in Yunnan. From October to March, black-headed gulls arrive from Lake Baikal in Siberia.', '游玩【滇池风景名胜区】：云南省最大的淡水湖，有高原明珠之称。每年 10 月至次年 3 月，红嘴鸥从西伯利亚贝加尔湖飞来'],
        ['11:10', 'Lunch, Ashima-style local cooking, shared table.', '午餐，感受阿诗玛的风味，团队用餐'],
        ['12:00', 'Stone Forest scenic area, about two hours: major and minor stone forests, Shilin Lake, the stone screen, the classic viewpoints, the cat rock, the lotus pond and the Ashima formation.', '前往【石林风景名胜区】（游览时间 2 小时左右）：大、小石林（石林湖、石屏风、石林胜景、千钧一发、望峰亭、猫石、莲花池、阿诗玛化身等）'],
        ['15:00', 'Return to Kunming, Guanshang old street.', '乘车返回昆明关上老街'],
        ['16:30', 'Trip ends on site.', '就地散团，愉快结束行程']
      ],
      incl: [
        ['Air-conditioned coach, return', '全程空调旅游汽车往返'],
        ['Lunch at RMB 15 per person — eight dishes and a soup for a table of ten, with a Yili roast duck', '午餐餐标 15 元/人，十人一桌八菜一汤，赠送宜良烤鸭'],
        ['First-gate tickets for all listed sites', '行程所列景点首道门票'],
        ['Licensed guide throughout', '全程持证导游讲解、服务']
      ],
      excl: [
        ['Stone Forest shuttle bus, RMB 25 per person', '石林景区的电瓶车费用 25 元/人'],
        ['Travel accident insurance', '旅游意外险'],
        ['Personal spending and anything outside the inclusions', '其他个人消费及费用包含以外的所有费用']
      ],
      notes: [
        ['Return traffic in peak season runs late. Ask before booking if you have an onward connection.', '假期返程时间会延迟，下午赶时间的游客请咨询客服后再下单。'],
        ['The coach plate number is texted to you the evening before departure.', '车牌号于出发前一日晚，以短信发送到你手机上。'],
        ['Bring a valid ID; children need a household register booklet.', '请携带有效身份证件，小孩带户口簿。']
      ]
    }), /* ---------------- Dali ---------------- */
    T('dali', 'dali-three-pagodas',
      'Three Pagodas & Erhai cruise day trip',       '大理三塔线纯玩 1 日游', 'full', {
      intro: ['Three Pagodas, Xizhou old town and a deluxe Erhai cruise out to Nanzhao Island.',
              '崇圣寺三塔、喜洲古镇，加一趟洱海豪华游船到南诏风情岛。'],
      stops: [
        ['08:00–09:30', 'Depart from Dali old town by coach.', '大理古城乘车出发'],
        [['First stop', '第一站'], 'Chongsheng Temple and the Three Pagodas, a national AAAAA site and the emblem of Dali. The main pagoda, Qianxun, is 69.13 m — a square, sixteen-storey dense-eave pagoda of the Tang type. Continue along the axis: bell tower, rain-bronze Guanyin hall, main hall, Chongsheng Temple.', '【崇圣寺—三塔】国家级 AAAAA 景区，大理「文献名邦」的象征。主塔千寻塔高 69.13 米，方形 16 层密檐式塔，与西安大小雁塔同为唐代典型建筑。沿中轴线依次有大钟楼、雨铜观音殿、大雄宝殿、崇圣寺。（不含电瓶车 35 元/人）'],
        [['Second stop', '第二站'], 'Lunch — Bai regional cooking.', '【中餐—白族风味餐】'],
        [['Third stop', '第三站'], 'Xizhou ancient town: more than a hundred courtyards of Bai residential architecture spanning the Ming, Qing, Republican and contemporary periods.', '【喜洲古镇】共有明代、清代、民国以及当代各个时期各具特色的上百院白族民居建筑（不含电瓶车 20 元/人）'],
        [['Fourth stop', '第四站'], 'Erhai deluxe cruise from Shuanglang pier to Nanzhao Island, with the Bai three-course tea song-and-dance performance on board. Disembark at Shuanglang and return to Dali old town.', '【洱海豪华游船—南诏风情岛】双廊码头乘豪华大游船游览洱海，船上欣赏「白族三道茶歌舞表演」，双廊码头下船，返回大理古城']
      ],
      incl: [
        ['Dali coach, 18–30 seats, sized to the group', '交通：大理 18—30 座旅游车，根据人数确定，正规平台用车'],
        ['Group meals as listed in the itinerary', '餐饮：团队餐（具体所含餐食以行程安排为准）'],
        ['First-gate tickets for all listed sites', '门票：行程中所列景点首道门票'],
        ['Licensed guide throughout. Groups of six or fewer travel with the driver doubling as guide.', '导游：全程持证导游讲解；如人数少于 6（含）人司机兼职导游'],
        ['Travel agency liability insurance', '保险：旅行社责任险，不含旅游意外险']
      ],
      excl: [
        ['Travel accident insurance — purchase separately if required', '旅游意外险（如需要请自行购买）'],
        ['Optional items inside the itinerary and anything outside it', '行程中的自理项目及行程表以外行程费用'],
        ['Personal spending', '一切个人消费'],
        ['Loss arising from the traveller\'s breach, fault or illness', '旅游者因违约、自身过错或自身疾病引起的人身和财产损失'],
        ['Additional costs from traffic delays, weather or other force majeure', '因交通延阻、天气等不可抗力原因所引致的额外费用'],
        ['Costs from matters outside the operator\'s control, such as natural disasters or site maintenance', '非我社所能控制因素下引起的额外费用，如自然灾害、民俗禁忌、景点维修等']
      ],
      notes: [
        ['Tickets are policy-priced. No refund is given for not entering a site, or for holding a student, senior or military discount card.', '门票为政策性门票，不进景区或持学生证、老年证、军官证等一系列优惠证件的门票费用一概不退。'],
        ['The driver may reorder sites to work around traffic or crowding, without dropping any.', '行程根据情况师傅会调整顺序（堵车、景区拥挤等），在不减少景点的情况下，师傅有权调整景点游览先后顺序。'],
        ['Times shown are indicative; actual times depend on the day.', '以上行程标注时间只是作为参考时间，具体时间以实际操作时间为准。']
      ]
    }),
    T('dali', 'dali-gantong',
      'Gantong cableway & Erhai cruise day trip',       '大理感通线纯玩 1 日游', 'full', {
      intro: ['Gantong cableway up to 2,700 m on Cangshan, then an Erhai cruise from Shuanglang pier.',
              '感通索道上苍山 2700 米，再从双廊码头乘游船游洱海。'],
      stops: [
        ['08:30', 'Depart from Dali old town.', '大理古城出发'],
        [['First stop', '第一站'], 'Cangshan national geological park — the Gantong cableway, rising to 2,700 m. Views over Qingbi stream, the Zhenlong chess formation, Cangshan gorge and the Yundai path, with the snow peaks above and Erhai, Dali old town and the Three Pagodas below.', '【苍山国家地质公园—感通索道】沿感通索道上至苍山中段，海拔 2700 米，观清碧溪、珍珑棋局、苍山大峡谷、云游玉带路。可仰望苍山雪峰，俯瞰百里洱海和大理古城、三塔崇圣寺'],
        [['Second stop', '第二站'], 'Lunch — Bai regional cooking.', '【中餐—白族风味餐】'],
        [['Third stop', '第三站'], 'Xizhou ancient town.', '【喜洲古镇】（不含电瓶车 20 元/人）'],
        [['Fourth stop', '第四站'], 'Erhai cruise from Shuanglang pier to Nanzhao Island, with the Bai three-course tea performance on board. Disembark at Shuanglang; trip ends back at Dali old town.', '【洱海大游船—南诏风情岛】双廊码头乘洱海大游船游览洱海，船上欣赏白族三道茶歌舞表演并品尝一苦二甜三回味的白族三道茶。双廊码头下船，行程结束返回大理古城散团']
      ],
      incl: [
        ['Dali coach, 18–30 seats, sized to the group', '交通：大理 18—30 座旅游车，根据人数确定'],
        ['Group meals as listed', '餐饮：团队餐'],
        ['First-gate tickets for all listed sites', '门票：行程中所列景点首道门票'],
        ['Licensed guide throughout; six or fewer travels with the driver as guide', '导游：全程持证导游讲解；如人数少于 6（含）人司机兼职导游'],
        ['Travel agency liability insurance', '保险：旅行社责任险']
      ],
      excl: [
        ['Travel accident insurance', '旅游意外险'],
        ['Optional items and anything outside the itinerary', '行程中的自理项目及行程表以外行程费用'],
        ['Personal spending', '一切个人消费'],
        ['Additional costs from force majeure', '因交通延阻、天气等不可抗力原因所引致的额外费用'],
        ['Costs from matters outside the operator\'s control', '非我社所能控制因素下引起的额外费用']
      ],
      notes: [
        ['Tickets are policy-priced and non-refundable against discount cards.', '门票为政策性门票，持优惠证件费用一概不退。'],
        ['Site order may be adjusted to avoid traffic and crowding.', '行程根据情况师傅会调整顺序，在不减少景点的情况下调整游览顺序。']
      ]
    }),
    T('dali', 'dali-erhai-loop',
      'Full Erhai Lake loop day trip',       '大理环洱海线纯玩 1 日游', 'full', {
      intro: ['A full 360° circuit of Erhai — Ideal Land, Little Putuo, Shuanglang, Xizhou and the S bend on the ecological corridor.',
              '环洱海 360°：理想邦、小普陀、双廊、喜洲，以及生态廊道的 S 湾。'],
      stops: [
        ['09:00', 'Depart from Dali old town.', '大理古城出发'],
        [['Stop 1', '第 1 站'], 'Xingsheng bridge, the photogenic arch bridge.', '【网红兴盛桥】'],
        [['Stop 2', '第 2 站'], 'Santorini–Ideal Land, built up the eastern shore hillside — whitewashed lanes with flowers on both sides, facing Erhai.', '【圣托里尼—理想邦】坐落于洱海东岸的环海东路边上，小镇顺着自然山势而建，巷子两边种满各种花草'],
        [['Stop 3', '第 3 站'], 'Little Putuo, one of the eight causeway landmarks of Erhai — a tiny island with a pavilion, alone on the water.', '【小普陀】洱海的「八梁」之一，一座小岛和楼阁独立湖中'],
        [['Stop 4', '第 4 站'], 'Shuanglang viewpoint. The town is known as the finest scenery spot on the lake.', '【双廊】观景台美拍——双廊古镇被称作「苍洱风光第一镇」'],
        [['Stop 5', '第 5 站'], 'Xizhou ancient town — the oldest Tea Horse Road town in Dali, Bai residential architecture and local snacks.', '【喜洲古镇】游大理最古老的茶马古道重镇，白族民居建筑群，品尝大理特色小吃（不含电瓶车 20 元/人）'],
        [['Stop 6', '第 6 站'], 'The northern section of the Erhai ecological corridor — a car-free shoreline path linking the Bai villages. The "S bend" viewpoint is the classic stop.', '洱海生态廊道北段，连接沿岸白族传统村落；「唯美 S 湾」是环海的必经景点'],
        [['Stop 7', '第 7 站'], 'Return to the old town. End of the 360-degree loop.', '后返回古城，结束 360 度环洱海游']
      ],
      incl: [
        ['7- or 9-seat business vehicle, sized to the group', '交通：7/9 座商务车，根据人数确定'],
        ['Attraction first-gate tickets', '门票：行程中所列景点首道门票'],
        ['Licensed guide throughout; six or fewer travels with the driver as guide', '导游：全程持证导游讲解；如人数少于 6（含）人司机兼职导游'],
        ['Travel agency liability insurance', '保险：旅行社责任险']
      ],
      excl: [
        ['Meals — not included on this route', '餐饮：自理'],
        ['Travel accident insurance', '旅游意外险'],
        ['Optional items and anything outside the itinerary', '行程中的自理项目及行程表以外行程费用'],
        ['Personal spending', '一切个人消费'],
        ['Additional costs from force majeure', '不可抗力原因所引致的额外费用']
      ],
      notes: [
        ['Meals are not included on the loop route — budget for lunch in Xizhou or Shuanglang.', '本线路餐饮自理，建议在喜洲或双廊自行安排午餐。'],
        ['Site order may be adjusted; times are indicative.', '行程顺序可能调整，标注时间为参考时间。']
      ]
    }),    T('dali', 'dali-jizushan',
      'Jizu Mountain pilgrimage day trip',       '大理鸡足山纯玩 1 日游', 'full', {
      intro: ['Jizu Mountain by shuttle bus and cableway — one of China\'s great Buddhist mountains, and the cradle of Chan Buddhism.',
              '乘观光车与索道上鸡足山——中国佛教名山之一、禅宗发源地。'],
      stops: [
        ['08:00–08:30', 'Board at the south gate of Dali old town and depart.', '大理古城南门上车发车'],
        [['Journey', '行程'], 'Drive to Jizu mountain — a major Buddhist site in Southeast Asia, where Chinese Han and Tibetan Buddhism meet, and the cradle of Chan Buddhism. Known as the first Buddhist mountain of China.', '乘车前往【鸡足山】——东南亚著名佛教圣地，中国汉传藏传佛教交汇地和世界佛教禅宗发源地，素有「鸡足奇秀甲天下、灵山佛都、天开佛国、华夏第一佛山」等美誉'],
        ['09:30', 'Arrive at the "Lingshan Yihui" gateway arch.', '到达鸡足山【「灵山一会」山门牌坊】'],
        ['10:00', 'Zhongsheng Zen temple: the release pond, Zhenbao pavilion, Yunyi rock, Heavenly Kings hall, main hall and the ancestral hall.', '到达【祝圣禅寺】：游览放生池、镇宝亭、云移石、天王殿、大雄宝殿、参观祖堂'],
        ['12:00', 'Lunch, own arrangement — vegetarian food available at own cost. Sixty minutes.', '午餐自理（自费品尝养生素食，时间 60 分钟）'],
        ['14:30', 'Shuttle bus and cableway to the summit; Jinding temple and the golden hall.', '乘坐【观光车】+【索道】到达金顶，游览【金顶寺】【金殿】'],
        ['15:30', 'Cableway and shuttle bus back to the mountain gate.', '乘坐【索道】+【观光车】返回鸡足山山门'],
        ['16:30', 'Coach from Zhusheng temple back to Dali old town. Trip ends.', '祝圣寺乘车返回大理古城，结束行程']
      ],
      incl: [
        ['5- or 7-seat business vehicle, sized to the group', '交通：5 座或 7 座商务车，根据人数确定'],
        ['First-gate tickets for all listed sites', '门票：行程中所列景点首道门票'],
        ['Licensed guide throughout', '导游：全程持证导游讲解'],
        ['Travel agency liability insurance', '保险：旅行社责任险']
      ],
      excl: [
        ['Lunch — shared or self-arranged', '餐饮：中餐 AA 或者自理'],
        ['Travel accident insurance', '旅游意外险'],
        ['Optional items and anything outside the itinerary', '行程中的自理项目及行程表以外行程费用'],
        ['Personal spending', '一切个人消费'],
        ['Additional costs from force majeure', '不可抗力原因所引致的额外费用']
      ],
      notes: [
        ['Lunch is not included. Vegetarian food is available at the temple at the guest\'s own cost.', '午餐自理，可在寺院自费品尝养生素食。'],
        ['Much of the site is reached by shuttle bus and cableway; both are included.', '上山路段主要依靠观光车与索道，均已包含。']
      ]
    }),

    /* ---------------- Pu'er ----------------
       Flora 2026-09-21 手动整理，源文件：
       资料/旅游/云南日游产品行程/选中的两份普洱资料.docx（两条日游的图文，图片在
       原型 assets/images/puer/：puer-taste-* 属第一条，puer-secret-* 属第二条）。

       ⚠ 该 docx 的文案是从 PDF 截图上 OCR 来的，处理口径：
         · 英文拼写错按上下文修正 —— SACHED→SACRED、ORIGN→ORIGIN、MMERSE→IMMERSE、
           CLLTURE→CULTURE、WITHN→WITHIN、MIN-GROUP→MINI-GROUP、DOFFEE/EXPURENCE→
           COFFEE/EXPERIENCE、BLQCKBUSTERS→BLOCKBUSTERS、HAND-SHOT SHOOT→HAND-BREWED；
         · 拼音当英文用的（CHUNXIANG COFFEE / PUETQN）改写成英文，不保留拼音；
         · 中文错字修正 —— 鬼斧神二→鬼斧神工、时间再这里→在这里；
         · **整段乱码未收录**：「瑞贡天朝」匾额那段说明、以及「未被驯服的热带雨林秘境，
           那是一个没有活力的世界」——OCR 已碎到无法还原原意，宁缺勿编；
         · 站点名以站内既有写法为准：那柯里 = Nake Li（data.js 的 highlights 已这么写），
           不用 OCR 的 NAKRI / NAKE LI。
         · 原资料只有「环形线路顺序」，没有逐站钟点 → stops 用「第 N 站」标签；
           费用包含/不含资料未给 → 留空（生成器对空列表不渲染该区块），
           改为在 notes 里说明「以出行确认单为准」。 */
    T('puer', 'puer-tea-coffee',
      'Pu\'er Taste Adventure · tea and coffee',    '普洱味觉奇旅 · 茶咖双拼一日游', 'full', {
      intro: ['China Pu\'er Tea Expo Garden and one of five coffee estates of your choice — tea culture and coffee in a single unhurried day.',
              '中华普洱茶博览苑，加一座五选一的咖啡庄园——一天里把普洱茶文化和咖啡都走一遍。'],
      usp: [
        ['Pu\'er tea culture', '普洱茶文化'],
        ['Coffee tasting', '咖啡体验'],
        ['Tea and coffee together', '茶咖双拼'],
        ['Small group, no shopping', '纯玩小团']
      ],
      img: {
        src: 'assets/images/puer/puer-taste-1.png',
        alt: ['Coffee estate buildings and a tasting bar in Pu\'er', '普洱咖啡庄园的建筑与品鉴吧台']
      },
      stops: [
        [['First stop', '第一站'],
         'China Pu\'er Tea Expo Garden — the thousand-year story of Pu\'er tea, from a single leaf to a finished cup, and the wisdom of the ethnic groups who grow it.',
         '【中华普洱茶博览苑】从一片树叶到一杯佳茗的神奇蜕变，也是少数民族与茶共生的智慧。',
         [{ f: 'puer/puer-taste-2.png', t: ['Tea rows and a boardwalk at the Pu\'er Tea Expo Garden', '普洱茶博览苑的茶园与步道'] }]],
        [['Second stop', '第二站'],
         'A coffee estate — take your pick of five: Xiaowazi, Judian, Beigui, Dakahe or Meilixingcun. Photos, a tasting, and the story of Yunnan coffee.',
         '【咖啡庄园 · 五选一】小凹子、矩点、北归、大开河、美丽星村——打卡拍照，听一听咖啡的故事。',
         [{ f: 'puer/puer-taste-3.png', t: ['The Moon Meditation House at the Dakahe coffee estate', '大开河咖啡庄园的「月球冥想屋」'] }]]
      ],
      notes: [
        ['The coffee estate is a choice of five — tell us which one you want when you book.', '咖啡庄园为五选一，下单时确认你选哪一座。'],
        ['Pick-up point, timings, fees and what is included are confirmed on your quotation before booking.', '接送地点与时间、费用及包含项，均以下单前的出行确认单为准。'],
        ['Small group, no shopping.', '纯玩小团、无购物。']
      ]
    }),
    T('puer', 'puer-rainforest-nake-li',
      'Pu\'er Time Secret Realm · rainforest and Nake Li',    '普洱时光秘境 · 雨林那柯里一日游', 'full', {
      intro: ['Sun River Forest Park, the Tea Horse Road post station at Nake Li, and a coffee estate — rainforest, wildlife and caravan history in one day.',
              '太阳河森林公园、茶马古道驿站那柯里，加一座咖啡庄园——雨林、动物与马帮记忆，一天走完。'],
      usp: [
        ['Rainforest oxygen bar', '雨林天然氧吧'],
        ['Wildlife up close', '动物大世界'],
        ['Tea Horse Road memories', '马帮记忆'],
        ['Yunnan coffee', '醇享咖啡']
      ],
      img: {
        src: 'assets/images/puer/puer-secret-1.png',
        alt: ['The Sun River Forest Park gateway and Nake Li\'s stone lanes', '太阳河森林公园门头与那柯里青石板巷']
      },
      stops: [
        [['First stop', '第一站'],
         'Sun River Forest Park — a primeval rainforest that breathes, with its own animal kingdom. Wander the trails, and take a turn as a red-panda keeper while the session lasts.',
         '【太阳河森林公园】穿梭于茂密繁盛的原始森林，这里是雨林天然氧吧与动物大世界；还可以限时担任小熊猫保育员。',
         [{ f: 'puer/puer-secret-2.png', t: ['A red panda at Sun River Forest Park', '太阳河森林公园里的小熊猫'] },
          { f: 'puer/puer-secret-3.png', t: ['Wildlife at the forest park and the hillside lodges', '森林公园里的动物与山间小屋'] },
          { f: 'puer/puer-secret-4.png', t: ['Boardwalks, a waterwheel and a stream in the rainforest', '雨林中的步道、水车与溪流'] }]],
        [['Second stop', '第二站'],
         'Nake Li — the source post station of the ancient Tea Horse Road, and the first pass on the southern road out of Pu\'er. The bluestone slabs still carry a thousand years of hoofprints.',
         '【那柯里古镇】茶马古道的源头驿站、普洱南行第一关；青石板烙印千年马蹄声，重走马帮的东南亚贸易之路。',
         [{ f: 'puer/puer-secret-1.png', t: ['The Sun River Forest Park gateway and Nake Li\'s stone lanes', '太阳河森林公园门头与那柯里青石板巷'] }]],
        [['Third stop', '第三站'],
         'Dakahe Plum Coffee Estate — shoot sci-fi frames at the "Moon Meditation House", then a hand-brewed cup. Time slows down here.',
         '【大开河梅子咖啡庄园】在「月球冥想屋」拍科幻大片，品一杯梅子庄园手冲——时间在这里慢下来。',
         [{ f: 'puer/puer-secret-5.png', t: ['Iced coffee at the estate and the Moon Meditation House', '庄园里的冰咖啡与月球冥想屋'] }]]
      ],
      notes: [
        ['The coffee estate on this route is fixed: Dakahe Plum Estate, not the five-estate choice.', '本线路的咖啡庄园固定为大开河梅子庄园，不含五选一。'],
        ['The red-panda keeper session runs to the park\'s own daily schedule.', '小熊猫保育员体验以园区当日安排为准。'],
        ['Pick-up point, timings, fees and what is included are confirmed on your quotation before booking.', '接送地点与时间、费用及包含项，均以下单前的出行确认单为准。'],
        ['Small group, no shopping.', '纯玩小团、无购物。']
      ]
    }),

  ];
});
