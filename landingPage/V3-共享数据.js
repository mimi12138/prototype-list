/**
 * V3 原型共享数据层 · localStorage sl_v3_campaigns_v1
 * 在 V2 基础上：Matching Rule 通过 AI 为人群生成分群个性化页（非手选 variant）
 */
(function (global) {
  const STORAGE_KEY = "sl_v3_campaigns_v1";
  const STORAGE_VERSION_KEY = "sl_v3_campaigns_seed_version";
  const SEED_VERSION = "20260611_remove_v3_labels";

  /** ③ 按渠道 URL 参数 → 站内信号字段映射（运营只选渠道，不手填采集值） */
  const SIGNAL_CHANNEL_MAPPINGS = {
    meta: [
      { url_param: "utm_campaign", field: "campaign_id", label: "广告计划 ID", example: "meta_party_campaign" },
      { url_param: "adset_id", field: "adset_id", label: "广告组 / 人群包", example: "adset_party_dress_lookalike" },
      { url_param: "creative_id", field: "creative_id", label: "素材 ID", example: "cr_party_dress_video_01" },
      { url_param: "utm_content", field: "creative_tags", label: "素材标签", example: "party_dress" },
      { url_param: "product_id", field: "ad_skus", label: "广告 SKU", example: "sku_dress_003" },
    ],
    google: [
      { url_param: "utm_campaign", field: "campaign_id", label: "广告计划 ID", example: "google_pmax_brake" },
      { url_param: "utm_term", field: "search_keyword", label: "搜索关键词（Search）", example: "brake pads" },
      { url_param: "adset_id", field: "adset_id", label: "Asset Group", example: "asset_group_brake_pads" },
      { url_param: "creative_id", field: "creative_id", label: "素材 ID", example: "pmax_brake_hero" },
      { url_param: "product_id", field: "ad_skus", label: "广告 SKU", example: "sku_brake_001" },
      { url_param: "{keyword}", field: "search_keyword", label: "ValueTrack 关键词", example: "brake pads", note: "Search 自动注入" },
    ],
    edm: [
      { url_param: "utm_campaign", field: "flow_id", label: "Flow / Campaign", example: "abandoned_cart_flow" },
      { url_param: "utm_content", field: "creative_tags", label: "邮件区块标签", example: "abandoned_cart" },
      { url_param: "product_id", field: "ad_skus", label: "邮件内商品 SKU", example: "sku_dress_001" },
      { url_param: "{{ flow.id }}", field: "flow_id", label: "Klaviyo Liquid", example: "flow_abc123", note: "邮件系统注入" },
    ],
  };

  const ENTRY_MATCH_MAPPING_TIPS = {
    meta: "entry_match 的值应与 Meta 广告落地 URL 中的参数一致（非从流量反推）。不确定时请至 Meta Ads Manager → 广告 → URL 参数 查看。",
    google: "entry_match 应与 Google 落地 URL / ValueTrack 一致；Search 搜索词对应 utm_term（如 brake pads）。",
    edm: "entry_match 应与邮件/Flow 链接 UTM 或区块标签一致；值由投手/邮件模板预设。",
  };

  const ENTRY_MATCH_FIELDS_BY_CHANNEL = {
    meta: [
      { value: "creative_tags", label: "素材标签" },
      { value: "ad_skus", label: "广告 SKU" },
      { value: "campaign_id", label: "广告计划 ID" },
      { value: "creative_id", label: "素材 ID" },
      { value: "adset_id", label: "广告组" },
    ],
    google: [
      { value: "search_keyword", label: "搜索关键词" },
      { value: "ad_skus", label: "广告 SKU" },
      { value: "campaign_id", label: "广告计划 ID" },
      { value: "creative_id", label: "素材 ID" },
      { value: "adset_id", label: "Asset Group" },
    ],
    edm: [
      { value: "creative_tags", label: "邮件区块标签" },
      { value: "ad_skus", label: "邮件内商品 SKU" },
      { value: "flow_id", label: "Flow ID" },
    ],
  };

  const ENTRY_MATCH_FIELDS = Array.from(
    new Map(
      Object.values(ENTRY_MATCH_FIELDS_BY_CHANNEL).flat().map((f) => [f.value, f]),
    ).values(),
  );

  const SCENE_OPTIONS = [
    { value: "abandoned_cart", label: "弃购召回" },
    { value: "browse_abandonment", label: "浏览未购" },
    { value: "campaign_ad", label: "广告活动" },
    { value: "ad_product", label: "广告商品" },
    { value: "localization", label: "本地化" },
  ];

  const SOURCE_OPTIONS = [
    { value: "klaviyo", label: "邮件 Klaviyo" },
    { value: "meta", label: "Meta 广告" },
    { value: "google", label: "Google" },
  ];

  const CROWD_MANAGE_URL = "https://oversea-test.dianpusoft.cn/demo/crowd/tag-driven";

  /** P0-5 · 调研双客户预设对照（杨腾 vs 拓普） */
  const CUSTOMER_PRESETS = {
    yangteng: {
      key: "yangteng",
      label: "杨腾",
      brand: "A-Premium 汽配",
      site: "a-premium.com",
      channel: "Google PMax / 搜索",
      pageType: "PDP 商品详情页",
      matchFocus: "广告 SKU + 车型 OEM 件号置顶",
      precision: "高 · 与广告页内容严格一致",
      opsFocus: "建站慢 · AI 生成任务减负",
      whiteBoxHint: "同车型关联件号补齐 · 广告意图优先",
      campaignId: "camp_ai_google_pmax",
      peerKey: "tuopu",
    },
    tuopu: {
      key: "tuopu",
      label: "拓普",
      brand: "Bellabarnett 礼服",
      site: "bellabarnett.com",
      channel: "Meta 广告",
      pageType: "聚合 / 专题 Collection",
      matchFocus: "场景、素材、风格聚合",
      precision: "相对宽松 · 颜色等细节不必完全一致",
      opsFocus: "控成本 · 少增运营工作量",
      whiteBoxHint: "广告 SKU 前位 + 专题 Collection 货盘",
      campaignId: "camp_ai_meta_party",
      peerKey: "yangteng",
    },
  };

  const CUSTOMER_COMPARE_COMMON =
    "共同需求：广告意图驱动模块与商品排序 · AI 页须人工审阅后发布 · 用对照组实验证明增量（CVR / RPV 等）。";

  const SEED_AUDIENCE_CATEGORIES = [
    { id: "cat_klaviyo_behavior", name: "邮件 · 行为人群", source: "klaviyo" },
    { id: "cat_klaviyo_member", name: "邮件 · 会员与名单", source: "klaviyo" },
    { id: "cat_meta_ads", name: "Meta · 广告渠道", source: "meta" },
    { id: "cat_google_ads", name: "Google · 广告渠道", source: "google" },
  ];

  const SEED_AUDIENCES = [
    { id: "aud_abandoned_cart", categoryId: "cat_klaviyo_behavior", name: "弃购人群", nameEn: "Abandoned Cart", type: "behavior", source: "klaviyo", definition_summary: "7 日内发起结账但未完成支付 · 含 Cart Token / 一方 ID 可识别" },
    { id: "aud_browse_party", categoryId: "cat_klaviyo_behavior", name: "浏览未购 · 礼服品类", nameEn: "Browse Abandonment", type: "behavior", source: "klaviyo", definition_summary: "7 日内浏览礼服品类 ≥2 次且未加购 · view_item 事件回连" },
    { id: "aud_winback", categoryId: "cat_klaviyo_behavior", name: "流失召回", nameEn: "Winback", type: "behavior", source: "klaviyo", definition_summary: "90 日内无购买 · 历史客单价 > $50 · 适合召回 Flow" },
    { id: "aud_vip_member", categoryId: "cat_klaviyo_member", name: "VIP 会员", nameEn: "VIP Members", type: "static", source: "klaviyo", definition_summary: "会员等级 = VIP · 静态名单 · 可与弃购等行为人群交并差" },
    { id: "aud_meta_bf", categoryId: "cat_meta_ads", name: "黑五广告点击", nameEn: "BF Ad Clickers", type: "channel", source: "meta", definition_summary: "30 日内从 Meta 黑五广告进站 · utm + 广告点击回传" },
    { id: "aud_new_customer", categoryId: "cat_meta_ads", name: "新客", nameEn: "New Customers", type: "channel", source: "meta", definition_summary: "首次进站或注册 ≤30 天 · 常与广告新客计划对齐" },
    { id: "aud_returning_customer", categoryId: "cat_meta_ads", name: "老客", nameEn: "Returning Customers", type: "channel", source: "meta", definition_summary: "历史购买客回访 · 可与再营销广告 entry_match 对齐" },
    { id: "aud_meta_party_click", categoryId: "cat_meta_ads", name: "Meta 派对礼服点击", nameEn: "Meta Party Dress Clickers", type: "channel", source: "meta", definition_summary: "7 日内点击派对礼服类 Meta 广告进站 · 含素材标签 party_dress" },
    { id: "aud_meta_ad_sku", categoryId: "cat_meta_ads", name: "Meta 广告商品访客", nameEn: "Meta Ad SKU Visitors", type: "channel", source: "meta", definition_summary: "进站 URL / 素材绑定可解析出广告 SKU · 与广告上下文 ad_skus 对齐" },
    { id: "aud_google_brake_click", categoryId: "cat_google_ads", name: "Google 刹车片广告点击", nameEn: "Google Brake Pad Clickers", type: "channel", source: "google", definition_summary: "14 日内从 Google PMax 刹车片广告进站 · Shopping / Asset Group 回传" },
    { id: "aud_google_pmax_shopping", categoryId: "cat_google_ads", name: "Google PMax 购物意向", nameEn: "Google PMax Shopping Intent", type: "channel", source: "google", definition_summary: "Google 购物广告高意向点击 · 含 product_id / item_id 参数" },
  ];

  const PRODUCT_POOL = [
    { sku_id: "sku_dress_001", title: "Black Party Dress", price: "$89", emoji: "👗", source: "cart_item" },
    { sku_id: "sku_dress_002", title: "Sequin Mini Dress", price: "$76", emoji: "✨", source: "ai_recommend" },
    { sku_id: "sku_shoes_001", title: "Satin Heels", price: "$49", emoji: "👠", source: "cross_sell" },
    { sku_id: "sku_bag_001", title: "Evening Clutch", price: "$39", emoji: "👜", source: "cross_sell" },
    { sku_id: "sku_dress_003", title: "Red Cocktail Dress", price: "$82", emoji: "💃", source: "recently_viewed" },
    { sku_id: "sku_dress_004", title: "Velvet Maxi Dress", price: "$96", emoji: "🖤", source: "best_seller" },
    { sku_id: "sku_jacket_001", title: "Black Friday Jacket", price: "$69", emoji: "🧥", source: "ad_sku" },
    { sku_id: "sku_boots_001", title: "Holiday Boots", price: "$58", emoji: "🥾", source: "ad_sku" },
    { sku_id: "sku_brake_001", title: "Premium Brake Pads", price: "$42", emoji: "🛞", source: "ad_sku" },
    { sku_id: "sku_brake_002", title: "Ceramic Brake Kit", price: "$68", emoji: "🔧", source: "ad_sku" },
    { sku_id: "sku_filter_001", title: "OEM Oil Filter", price: "$18", emoji: "🛢️", source: "cross_sell" },
    { sku_id: "sku_wiper_001", title: "All-Season Wiper Set", price: "$24", emoji: "🌧️", source: "best_seller" },
  ];

  function productItem(skuId, position, overrides = {}) {
    const base = PRODUCT_POOL.find((p) => p.sku_id === skuId) || PRODUCT_POOL[0];
    return {
      sku_id: base.sku_id,
      title: base.title,
      price: base.price,
      emoji: base.emoji,
      position,
      source: overrides.source || base.source,
      locked: !!overrides.locked,
      manual: !!overrides.manual,
    };
  }

  function productItemsForSource(source, count = 4) {
    const bySource = {
      cart_items: [
        productItem("sku_dress_001", 1, { source: "cart_item", locked: true }),
        productItem("sku_dress_002", 2, { source: "ai_recommend" }),
        productItem("sku_shoes_001", 3, { source: "cross_sell" }),
        productItem("sku_bag_001", 4, { source: "cross_sell" }),
      ],
      recently_viewed: [
        productItem("sku_dress_003", 1, { source: "recently_viewed", locked: true }),
        productItem("sku_dress_004", 2, { source: "best_seller" }),
        productItem("sku_dress_002", 3, { source: "ai_recommend" }),
        productItem("sku_shoes_001", 4, { source: "cross_sell" }),
      ],
      shop_default_collection: [
        productItem("sku_dress_004", 1, { source: "default_collection" }),
        productItem("sku_dress_001", 2, { source: "default_collection" }),
        productItem("sku_dress_002", 3, { source: "default_collection" }),
        productItem("sku_bag_001", 4, { source: "default_collection" }),
      ],
      manual_collection: [
        productItem("sku_jacket_001", 1, { source: "ad_sku", locked: true }),
        productItem("sku_boots_001", 2, { source: "ad_sku", locked: true }),
        productItem("sku_dress_004", 3, { source: "best_seller" }),
        productItem("sku_bag_001", 4, { source: "cross_sell" }),
      ],
      google_ad_collection: [
        productItem("sku_brake_001", 1, { source: "ad_sku", locked: true }),
        productItem("sku_brake_002", 2, { source: "ad_sku", locked: true }),
        productItem("sku_filter_001", 3, { source: "cross_sell" }),
        productItem("sku_wiper_001", 4, { source: "best_seller" }),
      ],
    };
    const list = JSON.parse(JSON.stringify(bySource[source] || bySource.shop_default_collection));
    return normalizeProductPositions(list.slice(0, Math.max(1, Number(count) || 4)));
  }

  function normalizeProductPositions(items) {
    return (items || []).map((item, idx) => ({ ...item, position: idx + 1 }));
  }

  function nowStr() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  function blankModules() {
    return {
      mod_hero: { headline: "", subhead: "", cta: "", image_url: "" },
      mod_offer: { text: "", code: "" },
      mod_products: { source: "", pin_rule: "", count: "", items: [] },
      mod_trust: { shipping: "", payment: "", reviews: "" },
      mod_cta: { label: "", anchor: "", hint: "" },
    };
  }

  function defaultBaselineModules() {
    return {
      mod_hero: { headline: "Welcome — 店铺默认首页", subhead: "未命中个性化规则时展示", cta: "Shop Now" },
      mod_offer: { text: "", code: "" },
      mod_products: { source: "shop_default_collection", pin_rule: "店铺默认排序", count: "8", items: productItemsForSource("shop_default_collection", 4) },
      mod_trust: { shipping: "标准配送政策", payment: "Shop Pay", reviews: "店铺默认评价区" },
      mod_cta: { label: "浏览商品", anchor: "#collection", hint: "" },
    };
  }

  function sampleRecoveryModules() {
    return {
      mod_hero: { headline: "你的购物车还在等你", subhead: "派对季礼服 · 限时免邮", cta: "返回结账" },
      mod_offer: { text: "弃购专属 · 24h 内下单享免邮", code: "CARTSHIP" },
      mod_products: { source: "cart_items", pin_rule: "弃购 SKU 置顶 + 同类热销 3 件", count: "4", items: productItemsForSource("cart_items", 4) },
      mod_trust: { shipping: "US 2-5 日达 · 免费退换 30 天", payment: "Visa / PayPal / Shop Pay", reviews: "4.8★ · 12k+ 评价" },
      mod_cta: { label: "完成购买", anchor: "#checkout", hint: "优惠已在结账页自动应用" },
    };
  }

  function sampleVipModules() {
    return {
      mod_hero: { headline: "VIP 专属 · 你的购物车特权", subhead: "会员弃购额外 9 折 · 48h 有效", cta: "会员价结账" },
      mod_offer: { text: "VIP ONLY · EXTRA 10% OFF", code: "VIPCART10" },
      mod_products: { source: "cart_items", pin_rule: "弃购 SKU + 会员专享推荐", count: "4", items: productItemsForSource("cart_items", 4).map((item, idx) => idx === 1 ? { ...item, title: "VIP Sequin Dress", source: "vip_recommend" } : item) },
      mod_trust: { shipping: "VIP 优先发货 · 免费退换", payment: "Visa / PayPal / Shop Pay", reviews: "4.9★ · 会员好评" },
      mod_cta: { label: "以会员价完成购买", anchor: "#checkout", hint: "折扣已自动应用" },
    };
  }

  function sampleBrowseModules() {
    return {
      mod_hero: { headline: "你刚看过的派对礼服", subhead: "仍在热销 · 本周免邮", cta: "继续浏览" },
      mod_offer: { text: "浏览未购专属 · 48h 内下单享 9 折", code: "BROWSE10" },
      mod_products: { source: "recently_viewed", pin_rule: "浏览品类 + 同类热销", count: "6", items: productItemsForSource("recently_viewed", 4) },
      mod_trust: { shipping: "US 2-5 日达", payment: "Shop Pay", reviews: "4.7★ · 8k+ 评价" },
      mod_cta: { label: "查看推荐", anchor: "#collection", hint: "" },
    };
  }

  /** 拓普 · Meta 派对礼服广告 · 聚合 Collection 向 */
  function sampleMetaPartyModules() {
    const skuPlan = [
      { id: "sku_dress_001", source: "ad_sku", locked: true },
      { id: "sku_dress_003", source: "ad_sku", locked: true },
      { id: "sku_dress_002", source: "manual_collection" },
      { id: "sku_dress_004", source: "manual_collection" },
      { id: "sku_shoes_001", source: "cross_sell" },
      { id: "sku_bag_001", source: "cross_sell" },
      { id: "sku_dress_004", source: "best_seller" },
      { id: "sku_dress_002", source: "best_seller" },
    ];
    const items = skuPlan.map((row, idx) => productItem(row.id, idx + 1, {
      source: row.source,
      locked: row.locked || false,
    }));
    return {
      mod_hero: { headline: "派对季礼服 · 广告同款一站逛齐", subhead: "Meta 派对广告点击进站 · 场景与风格聚合，不必逐色精准匹配", cta: "逛派对礼服集" },
      mod_offer: { text: "派对季专题 · 本周下单免邮", code: "PARTYSHIP" },
      mod_products: {
        source: "manual_collection",
        pin_rule: "广告 SKU 前 2 位 + 派对专题 Collection 热销",
        count: "8",
        items,
      },
      mod_trust: { shipping: "US 2-5 日达 · 免费退换 30 天", payment: "Shop Pay · Klarna", reviews: "4.8★ · 派对季热销" },
      mod_cta: { label: "查看全部派对礼服", anchor: "#collection", hint: "按场景筛选 · 聚合页形态" },
    };
  }

  function sampleWinbackModules() {
    return {
      mod_hero: { headline: "好久不见 · 专属回归礼遇", subhead: "流失召回 · 本周下单享 85 折", cta: "领取礼遇" },
      mod_offer: { text: "WINBACK15 · 仅限 72h", code: "WINBACK15" },
      mod_products: { source: "shop_default_collection", pin_rule: "当季热销 + 历史购买关联", count: "6", items: productItemsForSource("shop_default_collection", 4) },
      mod_trust: { shipping: "US 2-5 日达", payment: "Shop Pay", reviews: "4.8★ · 12k+ 评价" },
      mod_cta: { label: "立即选购", anchor: "#collection", hint: "优惠码已预填" },
    };
  }

  function sampleMetaBfModules() {
    return {
      mod_hero: { headline: "Black Friday · Up to 60% Off", subhead: "广告同款热卖 · 限时 48h", cta: "Shop the Sale" },
      mod_offer: { text: "BF2026 · EXTRA 10% with code", code: "BF2026" },
      mod_products: { source: "manual_collection", pin_rule: "黑五专题 Collection 热销排序", count: "8", items: productItemsForSource("manual_collection", 4) },
      mod_trust: { shipping: "Free shipping over $99", payment: "Shop Pay", reviews: "4.9★ · Holiday bestsellers" },
      mod_cta: { label: "Grab the deal", anchor: "#sale", hint: "" },
    };
  }

  function sampleGooglePdpModules() {
    const items = JSON.parse(JSON.stringify(productItemsForSource("google_ad_collection", 4)));
    return {
      mod_hero: { headline: "广告同款刹车片 · 精准适配你的车型", subhead: "Google PMax 点击进站 · OEM 件号匹配 · 当日发货", cta: "确认适配并购买" },
      mod_offer: { text: "广告进站专属 · 刹车片套装 9 折", code: "BRAKE10" },
      mod_products: {
        source: "manual_collection",
        pin_rule: "广告 SKU 前 2 位 + 同车型关联件号补齐",
        count: "4",
        items,
      },
      mod_trust: { shipping: "US 1-3 日达 · 免费退换 30 天", payment: "Visa / PayPal / Shop Pay", reviews: "4.9★ · 50k+ 汽配好评" },
      mod_cta: { label: "查看适配详情", anchor: "#fitment", hint: "输入 VIN 或车型确认件号" },
    };
  }

  /** AI 生成模块 mock：按人群 + 活动场景 */
  function aiModulesForAudience(campaign, audienceId) {
    const byAudience = {
      aud_abandoned_cart: sampleRecoveryModules,
      aud_vip_member: sampleVipModules,
      aud_browse_party: sampleBrowseModules,
      aud_winback: sampleWinbackModules,
      aud_meta_bf: sampleMetaBfModules,
      aud_meta_party_click: sampleMetaPartyModules,
      aud_google_brake_click: sampleGooglePdpModules,
      aud_google_pmax_shopping: sampleGooglePdpModules,
    };
    const fn = byAudience[audienceId];
    if (fn) return JSON.parse(JSON.stringify(fn()));
    if (campaign.scene === "browse_abandonment") return sampleBrowseModules();
    if (campaign.scene === "campaign_ad") return sampleMetaPartyModules();
    if (campaign.scene === "ad_product" && campaign.source === "meta") return sampleMetaBfModules();
    return sampleRecoveryModules();
  }

  /** 审阅预览布局：PDP 单主商品 vs Collection 聚合网格 */
  function pageLayoutForCampaign(campaign) {
    if (!campaign) return "collection";
    const pt = String(campaign.pageType || "");
    const path = String(campaign.pagePath || "").toLowerCase();
    if (pt.includes("PDP") || path.startsWith("/products/")) return "pdp";
    if (path.startsWith("/collections/") || pt.includes("聚合") || pt.includes("活动") || pt.includes("专题")) return "collection";
    return "collection";
  }

  function pageLayoutLabel(layout) {
    return layout === "pdp" ? "PDP 商品详情" : "Collection 聚合页";
  }

  function aiPageName(audienceId) {
    const a = SEED_AUDIENCES.find((x) => x.id === audienceId);
    return a ? `${a.name} · AI 页` : "个性化页面 · AI";
  }

  const SEED_CAMPAIGNS = [
    {
      id: "camp_demo_generating",
      name: "Klaviyo 弃购召回 · AI 生成中",
      demoTag: "生成中",
      source: "klaviyo",
      scene: "abandoned_cart",
      site: "bellabarnett.com",
      pageType: "产品聚合页",
      pagePath: "/collections/cart-recovery",
      holdout: 10,
      status: "generating",
      startedAt: null,
      endedAt: null,
      updatedAt: "2026-06-10 08:00",
      priority: "P0",
      variants: [
        { id: "default_baseline", name: "店铺基线页", type: "control", isBlank: false, variant_publish_status: "published", modules: defaultBaselineModules() },
      ],
      rule: {
        schema: "v3_matching_rule_v1",
        holdout: { ratio_pct: 10, stable_per_visitor: true, control_mode: "platform_native" },
        default_variant_id: "default_baseline",
        fallback_variant_id: "default_baseline",
        entry_context: { media_channel: "edm", signal_sample: null },
        recommendation_strategy: defaultRecommendationStrategy({ source: "klaviyo", scene: "abandoned_cart" }),
        matching_rules: [
          { id: "mr_gen_1", priority: 1, audience_id: "aud_abandoned_cart", variant_id: "", ai_status: "queued", ai_queued_at: "2026-06-10 07:30", enabled: true },
          { id: "mr_gen_2", priority: 2, audience_id: "aud_vip_member", variant_id: "", ai_status: "queued", ai_queued_at: "2026-06-10 07:30", enabled: true },
        ],
      },
    },
    {
      id: "camp_demo_pending_review",
      name: "Meta 夏季男装 · 待审阅",
      demoTag: "待审阅",
      source: "meta",
      scene: "campaign_ad",
      site: "bellabarnett.com",
      pageType: "大促活动页",
      pagePath: "/collections/summer-shirts",
      holdout: 10,
      status: "pending_review",
      startedAt: null,
      endedAt: null,
      updatedAt: "2026-06-10 09:15",
      priority: "P0",
      variants: [
        { id: "default_baseline", name: "店铺基线页", type: "control", isBlank: false, variant_publish_status: "published", modules: defaultBaselineModules() },
        {
          id: "var_review_new",
          name: "新客 · AI 页",
          type: "treatment",
          isBlank: false,
          aiGenerated: true,
          aiAudienceId: "aud_new_customer",
          aiGeneratedAt: "2026-06-10 08:30",
          variant_publish_status: "draft",
          publishedAt: null,
          modules: sampleMetaPartyModules(),
        },
        {
          id: "var_review_return",
          name: "老客 · AI 页",
          type: "treatment",
          isBlank: false,
          aiGenerated: true,
          aiAudienceId: "aud_returning_customer",
          aiGeneratedAt: "2026-06-10 08:30",
          variant_publish_status: "draft",
          publishedAt: null,
          modules: sampleMetaBfModules(),
        },
      ],
      rule: {
        schema: "v3_matching_rule_v1",
        holdout: { ratio_pct: 10, stable_per_visitor: true, control_mode: "platform_native" },
        default_variant_id: "default_baseline",
        fallback_variant_id: "default_baseline",
        entry_context: { media_channel: "meta", signal_sample: null },
        recommendation_strategy: defaultRecommendationStrategy({ source: "meta", scene: "campaign_ad" }),
        matching_rules: [
          {
            id: "mr_review_1",
            priority: 1,
            audience_id: "aud_new_customer",
            entry_match: { creative_tags: "summer_shirt" },
            variant_id: "var_review_new",
            ai_status: "ready",
            enabled: true,
          },
          {
            id: "mr_review_2",
            priority: 2,
            audience_id: "aud_returning_customer",
            entry_match: { creative_tags: "summer_shirt_vip" },
            variant_id: "var_review_return",
            ai_status: "ready",
            enabled: true,
          },
        ],
      },
    },
    {
      id: "camp_demo_pending_launch",
      name: "Google 机油滤芯 · 待上线",
      demoTag: "待上线",
      source: "google",
      scene: "ad_product",
      site: "a-premium.com",
      pageType: "商品详情页 PDP",
      pagePath: "/products/oil-filter-kit",
      holdout: 10,
      status: "pending_launch",
      startedAt: null,
      endedAt: null,
      updatedAt: "2026-06-10 10:00",
      priority: "P0",
      variants: [
        { id: "default_baseline", name: "店铺基线页", type: "control", isBlank: false, variant_publish_status: "published", modules: defaultBaselineModules() },
        {
          id: "var_launch_pmax",
          name: "Google PMax 购物意向 · AI 页",
          type: "treatment",
          isBlank: false,
          aiGenerated: true,
          aiAudienceId: "aud_google_pmax_shopping",
          aiGeneratedAt: "2026-06-09 23:45",
          variant_publish_status: "published",
          publishedAt: "2026-06-10 09:45",
          modules: sampleGooglePdpModules(),
        },
      ],
      rule: {
        schema: "v3_matching_rule_v1",
        holdout: { ratio_pct: 10, stable_per_visitor: true, control_mode: "platform_native" },
        default_variant_id: "default_baseline",
        fallback_variant_id: "default_baseline",
        entry_context: { media_channel: "google", signal_sample: null },
        recommendation_strategy: defaultRecommendationStrategy({ source: "google", scene: "ad_product" }),
        matching_rules: [
          {
            id: "mr_launch_1",
            priority: 1,
            audience_id: "aud_google_pmax_shopping",
            entry_match: { search_keyword: "oil filter" },
            variant_id: "var_launch_pmax",
            ai_status: "ready",
            enabled: true,
          },
        ],
      },
    },
    {
      id: "camp_demo_paused",
      name: "Meta 再营销礼服 · 已暂停",
      demoTag: "已暂停",
      source: "meta",
      scene: "campaign_ad",
      site: "bellabarnett.com",
      pageType: "大促活动页",
      pagePath: "/collections/retarget-dresses",
      holdout: 10,
      status: "paused",
      startedAt: "2026-05-15",
      endedAt: null,
      updatedAt: "2026-06-09 14:00",
      priority: "P0",
      variants: [
        { id: "default_baseline", name: "店铺基线页", type: "control", isBlank: false, variant_publish_status: "published", modules: defaultBaselineModules() },
        {
          id: "var_paused_meta",
          name: "Meta 派对礼服点击 · AI 页",
          type: "treatment",
          isBlank: false,
          aiGenerated: true,
          aiAudienceId: "aud_meta_party_click",
          aiGeneratedAt: "2026-05-14 23:45",
          variant_publish_status: "published",
          publishedAt: "2026-05-15 10:00",
          modules: sampleMetaPartyModules(),
        },
      ],
      rule: {
        schema: "v3_matching_rule_v1",
        holdout: { ratio_pct: 10, stable_per_visitor: true, control_mode: "platform_native" },
        default_variant_id: "default_baseline",
        fallback_variant_id: "default_baseline",
        entry_context: {
          media_channel: "meta",
          signal_sample: demoSignalSampleForChannel("meta", { source: "meta", scene: "campaign_ad" }),
        },
        recommendation_strategy: defaultRecommendationStrategy({ source: "meta", scene: "campaign_ad" }),
        matching_rules: [
          {
            id: "mr_paused_1",
            priority: 1,
            audience_id: "aud_meta_party_click",
            entry_match: { creative_tags: "party_dress" },
            variant_id: "var_paused_meta",
            ai_status: "ready",
            enabled: true,
          },
        ],
      },
    },
    {
      id: "camp_ai_meta_party",
      name: "Meta 派对礼服广告 · AI 已生成",
      customerPreset: "tuopu",
      demoTag: "拓普 · 运行中",
      source: "meta",
      scene: "campaign_ad",
      site: "bellabarnett.com",
      pageType: "大促活动页",
      pagePath: "/collections/party-dresses",
      holdout: 10,
      status: "active",
      startedAt: "2026-06-01",
      endedAt: null,
      updatedAt: "2026-06-08 09:00",
      priority: "P0",
      variants: [
        { id: "default_baseline", name: "店铺基线页", type: "control", isBlank: false, variant_publish_status: "published", modules: defaultBaselineModules() },
        {
          id: "var_ai_meta_party",
          name: "Meta 派对礼服点击 · AI 页",
          type: "treatment",
          isBlank: false,
          aiGenerated: true,
          aiAudienceId: "aud_meta_party_click",
          aiGeneratedAt: "2026-06-07 18:20",
          variant_publish_status: "published",
          publishedAt: "2026-06-08 09:30",
          modules: sampleMetaPartyModules(),
        },
      ],
      rule: {
        schema: "v3_matching_rule_v1",
        holdout: { ratio_pct: 10, stable_per_visitor: true, control_mode: "platform_native" },
        default_variant_id: "default_baseline",
        fallback_variant_id: "default_baseline",
        entry_context: {
          media_channel: "meta",
          signal_sample: demoSignalSampleForChannel("meta", { source: "meta", scene: "campaign_ad" }),
        },
        recommendation_strategy: defaultRecommendationStrategy({ source: "meta", scene: "campaign_ad" }),
        matching_rules: [
          {
            id: "mr_meta_party_ai",
            priority: 1,
            audience_id: "aud_meta_party_click",
            entry_match: { creative_tags: "party_dress" },
            variant_id: "var_ai_meta_party",
            ai_status: "ready",
            enabled: true,
          },
        ],
      },
    },
    {
      id: "camp_ai_meta_bf",
      name: "Meta 黑五广告 · 历史活动",
      demoTag: "已结束",
      source: "meta",
      scene: "ad_product",
      site: "bellabarnett.com",
      pageType: "大促活动页",
      pagePath: "/collections/black-friday",
      holdout: 10,
      status: "ended",
      startedAt: "2026-03-01",
      endedAt: "2026-05-31",
      updatedAt: "2026-06-01 16:00",
      priority: "P0",
      variants: [
        { id: "default_baseline", name: "店铺基线页", type: "control", isBlank: false, variant_publish_status: "published", modules: defaultBaselineModules() },
        {
          id: "var_ai_meta_bf",
          name: "黑五广告点击 · AI 页",
          type: "treatment",
          isBlank: false,
          aiGenerated: true,
          aiAudienceId: "aud_meta_bf",
          aiGeneratedAt: "2026-02-28 23:45",
          variant_publish_status: "published",
          publishedAt: "2026-03-01 10:00",
          modules: sampleMetaBfModules(),
        },
        {
          id: "var_ai_meta_sku",
          name: "Meta 广告商品访客 · AI 页",
          type: "treatment",
          isBlank: false,
          aiGenerated: true,
          aiAudienceId: "aud_meta_ad_sku",
          aiGeneratedAt: "2026-02-28 23:45",
          variant_publish_status: "published",
          publishedAt: "2026-03-01 10:00",
          modules: sampleMetaBfModules(),
        },
      ],
      rule: {
        schema: "v3_matching_rule_v1",
        holdout: { ratio_pct: 10, stable_per_visitor: true, control_mode: "platform_native" },
        default_variant_id: "default_baseline",
        fallback_variant_id: "default_baseline",
        entry_context: {
          media_channel: "meta",
          signal_sample: demoSignalSampleForChannel("meta", { source: "meta", scene: "ad_product" }),
        },
        recommendation_strategy: defaultRecommendationStrategy({ source: "meta", scene: "ad_product" }),
        matching_rules: [
          {
            id: "mr_meta_bf",
            priority: 1,
            audience_id: "aud_meta_bf",
            entry_match: { creative_tags: "black_friday" },
            variant_id: "var_ai_meta_bf",
            ai_status: "ready",
            enabled: true,
          },
          {
            id: "mr_meta_sku",
            priority: 2,
            audience_id: "aud_meta_ad_sku",
            entry_match: { ad_skus: "sku_dress_003" },
            variant_id: "var_ai_meta_sku",
            ai_status: "ready",
            enabled: true,
          },
        ],
      },
    },
    {
      id: "camp_ai_google_pmax",
      name: "Google PMax 刹车片 PDP · AI 已生成",
      customerPreset: "yangteng",
      demoTag: "杨腾 · 运行中",
      source: "google",
      scene: "ad_product",
      site: "a-premium.com",
      pageType: "商品详情页 PDP",
      pagePath: "/products/premium-brake-pads",
      holdout: 10,
      status: "active",
      startedAt: "2026-06-05",
      endedAt: null,
      updatedAt: "2026-06-10 09:30",
      priority: "P0",
      variants: [
        { id: "default_baseline", name: "店铺基线页", type: "control", isBlank: false, variant_publish_status: "published", modules: defaultBaselineModules() },
        {
          id: "var_ai_google_brake",
          name: "Google 刹车片广告点击 · AI 页",
          type: "treatment",
          isBlank: false,
          aiGenerated: true,
          aiAudienceId: "aud_google_brake_click",
          aiGeneratedAt: "2026-06-09 23:45",
          variant_publish_status: "published",
          publishedAt: "2026-06-10 09:00",
          modules: sampleGooglePdpModules(),
        },
      ],
      rule: {
        schema: "v3_matching_rule_v1",
        holdout: { ratio_pct: 10, stable_per_visitor: true, control_mode: "platform_native" },
        default_variant_id: "default_baseline",
        fallback_variant_id: "default_baseline",
        entry_context: {
          media_channel: "google",
          signal_sample: demoSignalSampleForChannel("google", { source: "google", scene: "ad_product" }),
        },
        recommendation_strategy: {
          mode: "white_box",
          audience_relation: "ad_first",
          conflict_rule: "current_ad_intent_first",
          audience_output: "生成本次访客画像，作为商品推荐规则的输入",
          ad_sku_priority: "top_2",
          sku_pin_enabled: true,
          sku_pin_source: "url_param:ad_skus",
          rule_order: ["广告 SKU 置顶", "同车型关联件号补齐", "命中人群偏好补齐", "店铺热销 / 有库存补齐"],
          product_source: "manual_collection",
          fallback: "同车型 OEM 件号 + 有库存优先",
          hero_count: 4,
          feed_mode: "infinite",
          feed_batch_size: 8,
          feed_pool_limit: 200,
          explanation_visible: true,
        },
        matching_rules: [
          {
            id: "mr_google_brake",
            priority: 1,
            audience_id: "aud_google_brake_click",
            entry_match: { search_keyword: "brake pads" },
            variant_id: "var_ai_google_brake",
            ai_status: "ready",
            enabled: true,
          },
        ],
      },
    },
  ];

  function dateOnly() { return nowStr().slice(0, 10); }

  const PRE_ACTIVE_STATUSES = ["generating", "pending_review", "pending_launch"];

  function formatCampaignPeriod(c) {
    if (c.status === "ended" && c.endedAt) return `${c.startedAt || "—"} ~ ${c.endedAt}`;
    if (c.status === "active") return `${c.startedAt || "—"} 起 · 进行中`;
    if (c.status === "paused") return `${c.startedAt || "—"} 起 · 已暂停`;
    if (c.status === "generating") return "生成中 · 等待 AI 批处理";
    if (c.status === "pending_review") return "待审阅 · AI 页已生成";
    if (c.status === "pending_launch") return "待上线 · 页面已就绪";
    if (c.status === "draft") return "未开始";
    return "—";
  }

  function statusLabel(status) {
    return {
      generating: "生成中",
      pending_review: "待审阅",
      pending_launch: "待上线",
      active: "运行中",
      paused: "已暂停",
      ended: "已结束",
      draft: "草稿",
    }[status] || status;
  }

  function enabledMatchingRules(c) {
    return (c?.rule?.matching_rules || []).filter((r) => r.enabled !== false);
  }

  function allEnabledRulesReady(c) {
    const rules = enabledMatchingRules(c);
    if (!rules.length) return false;
    return rules.every((r) => r.ai_status === "ready" && r.variant_id);
  }

  function anyRuleNeedsAiBatch(c) {
    const rules = enabledMatchingRules(c);
    if (!rules.length) return true;
    return rules.some((r) => r.ai_status === "pending" || r.ai_status === "queued");
  }

  function allTreatmentVariantsPublished(c) {
    const rules = enabledMatchingRules(c).filter((r) => r.variant_id);
    if (!rules.length) return false;
    return rules.every((r) => {
      const v = c.variants?.find((x) => x.id === r.variant_id);
      return v?.variant_publish_status === "published";
    });
  }

  /** 根据规则 / 页面发布进度刷新上线前状态（不覆盖 active / paused / ended） */
  function refreshCampaignLifecycleStatus(campaignId) {
    const c = getCampaign(campaignId);
    if (!c) return null;
    if (c.status === "active" || c.status === "paused" || c.status === "ended") return c;
    if (anyRuleNeedsAiBatch(c)) c.status = "generating";
    else if (allEnabledRulesReady(c) && !allTreatmentVariantsPublished(c)) c.status = "pending_review";
    else if (allEnabledRulesReady(c) && allTreatmentVariantsPublished(c)) c.status = "pending_launch";
    upsertCampaign(c);
    return c;
  }

  function canDeleteCampaign(campaign) {
    const s = campaign?.status;
    return PRE_ACTIVE_STATUSES.includes(s) || s === "ended";
  }

  function canViewReport(campaign) {
    const s = campaign?.status;
    return s === "active" || s === "paused" || s === "ended";
  }

  function aiStatusLabel(s) {
    return {
      pending: "待提交",
      queued: "已入队 · 待生成",
      ready: "已生成 · 待审阅",
      failed: "生成失败",
    }[s] || s;
  }

  function variantPublishStatusLabel(s) {
    return { draft: "待发布 Draft", published: "已发布 Published" }[s] || s;
  }

  function defaultVariantPublishStatus(campaign, variant) {
    if (variant.type === "control") return "published";
    if (campaign.status === "active" || campaign.status === "paused" || campaign.status === "ended") return "published";
    if (campaign.status === "pending_launch") return "published";
    return "draft";
  }

  let aiVariantIdSeq = 0;

  /** 同毫秒多条规则生成时须保证 ID 唯一 */
  function uniqueAiVariantId(ruleId) {
    aiVariantIdSeq += 1;
    const tail = String(ruleId || "r").replace(/^mr_/, "").slice(0, 16);
    return `var_ai_${Date.now()}_${aiVariantIdSeq}_${tail}`;
  }

  /** 修复历史数据中重复的 variant.id（导致 V3-03 左侧双高亮） */
  function repairDuplicateVariants(c) {
    if (!c.variants?.length) return;
    const groups = {};
    c.variants.forEach((v) => {
      if (!groups[v.id]) groups[v.id] = [];
      groups[v.id].push(v);
    });
    Object.entries(groups).forEach(([dupId, list]) => {
      if (list.length <= 1) return;
      list.slice(1).forEach((v, idx) => {
        const newId = uniqueAiVariantId(`repair_${v.aiAudienceId || idx}`);
        v.id = newId;
        const mr = c.rule?.matching_rules?.find(
          (r) => r.audience_id === v.aiAudienceId && (r.variant_id === dupId || !r.variant_id),
        );
        if (mr) mr.variant_id = newId;
      });
    });
  }

  function migrateCampaign(c) {
    if (c.status === "draft") {
      if (anyRuleNeedsAiBatch(c)) c.status = "generating";
      else if (allEnabledRulesReady(c) && !allTreatmentVariantsPublished(c)) c.status = "pending_review";
      else if (allEnabledRulesReady(c) && allTreatmentVariantsPublished(c)) c.status = "pending_launch";
      else c.status = "generating";
    }
    if (c.startedAt === undefined) {
      c.startedAt = c.status === "active" || c.status === "paused" || c.status === "ended" ? "2026-05-01" : null;
    }
    if (c.endedAt === undefined) c.endedAt = c.status === "ended" ? "2026-05-31" : null;
    if (c.rule?.matching_rules) {
      c.rule.matching_rules.forEach((mr) => {
        if (!mr.ai_status) mr.ai_status = mr.variant_id ? "ready" : "pending";
      });
    }
    (c.variants || []).forEach((v) => {
      if (v.id === "default_baseline" && v.name !== "店铺基线页") v.name = "店铺基线页";
      if (v.variant_publish_status === undefined) {
        v.variant_publish_status = defaultVariantPublishStatus(c, v);
      }
    });
    repairDuplicateVariants(c);
    if (!c.customerPreset) {
      if (c.id === "camp_ai_google_pmax") c.customerPreset = "yangteng";
      if (c.id === "camp_ai_meta_party") c.customerPreset = "tuopu";
    }
    if (c.id === "camp_ai_meta_party") {
      const treatment = (c.variants || []).find((v) => v.id === "var_ai_meta_party" || v.aiAudienceId === "aud_meta_party_click");
      if (treatment?.modules?.mod_hero?.headline?.includes("你刚看过的")) {
        treatment.modules = sampleMetaPartyModules();
      }
    }
    if (c.variants?.[0]?.modules) return c;
    return {
      ...c,
      variants: [
        { id: "default_baseline", name: "店铺基线页", type: "control", isBlank: false, variant_publish_status: "published", modules: defaultBaselineModules() },
      ],
    };
  }

  function getCampaigns() {
    if (localStorage.getItem(STORAGE_VERSION_KEY) !== SEED_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_VERSION_KEY, SEED_VERSION);
    }
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    const source = raw || SEED_CAMPAIGNS.map((c) => JSON.parse(JSON.stringify(c)));
    const list = source.map((c) => migrateCampaign(JSON.parse(JSON.stringify(c))));
    if (raw && JSON.stringify(list) !== JSON.stringify(source)) saveCampaigns(list);
    return list;
  }

  function saveCampaigns(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

  function getAudiences(source) {
    return SEED_AUDIENCES.filter((a) => !source || a.source === source || a.source === "internal").map((a) => ({ ...a }));
  }

  function getAudienceCategories(source) {
    const allowedSources = source ? [source] : null;
    const cats = allowedSources
      ? SEED_AUDIENCE_CATEGORIES.filter((c) => allowedSources.includes(c.source))
      : SEED_AUDIENCE_CATEGORIES;
    return cats.filter((c) => getAudiencesForCategory(c.id, source).length > 0).map((c) => ({ ...c }));
  }

  function getAudiencesForCategory(categoryId, source) {
    return SEED_AUDIENCES.filter((a) => {
      if (a.categoryId !== categoryId) return false;
      return !source || a.source === source || a.source === "internal";
    }).map((a) => ({ ...a }));
  }

  function audienceCategoryId(audienceId) {
    const a = SEED_AUDIENCES.find((x) => x.id === audienceId);
    return a?.categoryId || "";
  }

  function audienceLabel(id) {
    const a = SEED_AUDIENCES.find((x) => x.id === id);
    return a ? `${a.name} · ${a.nameEn}` : id;
  }

  function getAudience(id) {
    const a = SEED_AUDIENCES.find((x) => x.id === id);
    return a ? { ...a } : null;
  }

  function audienceTypeLabel(type) {
    const map = { behavior: "行为人群", static: "静态人群", channel: "渠道人群", internal: "内部标签" };
    return map[type] || type || "—";
  }

  function mediaChannelFromSource(source) {
    if (source === "google") return "google";
    if (source === "meta") return "meta";
    return "edm";
  }

  function entryMatchFieldsForChannel(channel) {
    return ENTRY_MATCH_FIELDS_BY_CHANNEL[channel] || ENTRY_MATCH_FIELDS_BY_CHANNEL.meta;
  }

  function mediaChannelLabel(channel) {
    return { edm: "EDM 邮件", meta: "Meta 广告", google: "Google 广告" }[channel] || channel || "—";
  }

  function hasSignalSample(entryContext) {
    const norm = normalizeEntryContext(entryContext, {});
    const s = norm.signal_sample;
    if (!s) return false;
    return ["campaign_id", "flow_id", "adset_id", "creative_id", "creative_tags", "ad_skus", "search_keyword", "utm_source"]
      .some((k) => String(s[k] || "").trim());
  }

  function demoSignalSampleForChannel(channel, campaign) {
    const byChannel = {
      meta: {
        campaign_id: "meta_party_campaign",
        adset_id: "adset_party_dress_lookalike",
        creative_id: "cr_party_dress_video_01",
        creative_tags: "party_dress,black_friday,high_intent",
        ad_skus: "sku_dress_003,sku_dress_002",
        search_keyword: "",
        flow_id: "meta_party_campaign",
        segment: "meta_party_dress_clickers_7d",
        utm_source: "facebook",
      },
      google: {
        campaign_id: "google_pmax_brake",
        adset_id: "asset_group_brake_pads",
        creative_id: "pmax_brake_hero",
        creative_tags: "brake_pads,automotive,oem_fit",
        ad_skus: "sku_brake_001,sku_brake_002",
        search_keyword: "brake pads",
        flow_id: "google_pmax_brake",
        segment: "google_brake_clickers_14d",
        utm_source: "google",
      },
      edm: {
        campaign_id: "abandoned_cart_flow",
        flow_id: "abandoned_cart_flow",
        adset_id: "",
        creative_id: "edm_cart_recovery_01",
        creative_tags: "abandoned_cart,return_checkout",
        ad_skus: "sku_dress_001",
        search_keyword: "",
        segment: "cart_abandoners_7d",
        utm_source: "klaviyo",
      },
    };
    const base = byChannel[channel] || byChannel.meta;
    if (campaign?.scene === "ad_product" && campaign.source === "meta") {
      return {
        ...base,
        campaign_id: "meta_bf_campaign",
        flow_id: "meta_bf_campaign",
        creative_tags: "black_friday,high_intent",
        segment: "meta_bf_clickers_30d",
      };
    }
    return { ...base };
  }

  function normalizeEntryContext(entryContext, campaign) {
    const channel = campaign?.source
      ? mediaChannelFromSource(campaign.source)
      : (entryContext?.media_channel || "meta");
    if (!entryContext) {
      return { media_channel: channel, signal_sample: null };
    }
    if (entryContext.signal_sample === null || entryContext.signal_sample === undefined) {
      return { media_channel: channel, signal_sample: null };
    }
    if (entryContext.signal_sample && typeof entryContext.signal_sample === "object") {
      return { media_channel: channel, signal_sample: { ...entryContext.signal_sample } };
    }
    const { media_channel, ...flat } = entryContext;
    const hasData = Object.values(flat).some((v) => String(v || "").trim());
    return {
      media_channel: channel,
      signal_sample: hasData ? { ...flat } : null,
    };
  }

  function resolvedSignalFields(entryContext) {
    const norm = normalizeEntryContext(entryContext, {});
    const s = norm.signal_sample || {};
    return {
      media_channel: norm.media_channel,
      campaign_id: s.campaign_id || "",
      flow_id: s.flow_id || s.campaign_id || "",
      adset_id: s.adset_id || "",
      creative_id: s.creative_id || "",
      creative_tags: s.creative_tags || "",
      ad_skus: s.ad_skus || "",
      search_keyword: s.search_keyword || "",
      segment: s.segment || "",
      utm_source: s.utm_source || "",
    };
  }

  function formatEntryMatch(entry_match) {
    if (!entry_match || !Object.keys(entry_match).length) return "不限 · 仅人群";
    return Object.entries(entry_match).map(([k, v]) => {
      const label = ENTRY_MATCH_FIELDS.find((f) => f.value === k)?.label || k;
      return `${label} = ${v}`;
    }).join(" 且 ");
  }

  function isCampaignPublished(campaign) {
    return campaign?.status === "active" || campaign?.status === "paused" || campaign?.status === "ended";
  }

  function isCampaignLive(campaign) {
    return campaign?.status === "active";
  }

  function signalMappingTableHtml(mediaChannel) {
    const rows = SIGNAL_CHANNEL_MAPPINGS[mediaChannel] || [];
    const tip = ENTRY_MATCH_MAPPING_TIPS[mediaChannel] || ENTRY_MATCH_MAPPING_TIPS.meta;
    return `
      <div class="signal-map-panel">
        <b>URL 参数参考 · 信号映射规则</b>
        <p class="signal-map-hint">进站 URL 参数自动映射为站内信号。下方示例值供配置 ④ entry_match 时对照，须与广告落地链接一致。</p>
        <table class="signal-map-table">
          <thead><tr><th>URL / 系统参数</th><th></th><th>站内信号字段</th><th>示例值</th></tr></thead>
          <tbody>${rows.map((r) => `<tr><td><code>${r.url_param}</code></td><td>→</td><td>${r.label}${r.note ? ` <small>(${r.note})</small>` : ""}</td><td class="signal-map-example">${r.example ? `← ${r.example}` : "—"}</td></tr>`).join("")}</tbody>
        </table>
        <p class="signal-entry-match-tip">💡 ${tip}</p>
      </div>
    `;
  }

  function deploymentGuideHtml(campaign, options = {}) {
    const readonly = Boolean(options.readonly);
    const escapeHtml = (value) => String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
    const channel = mediaChannelFromSource(campaign?.source || "meta");
    const channelName = mediaChannelLabel(channel);
    const mappingRows = SIGNAL_CHANNEL_MAPPINGS[channel] || SIGNAL_CHANNEL_MAPPINGS.meta;
    const urlParamLabels = {
      utm_campaign: "广告计划名称",
      adset_id: channel === "google" ? "Asset Group ID" : "广告组ID",
      creative_id: "素材ID",
      utm_content: channel === "edm" ? "邮件区块标签" : "素材标签",
      product_id: "商品SKU",
      utm_term: "搜索关键词",
      "{keyword}": "ValueTrack关键词",
      "{{ flow.id }}": "Klaviyo Flow ID",
    };
    const extraRowsByChannel = {
      meta: [{ url_param: "utm_source", label: "facebook" }],
      google: [{ url_param: "utm_source", label: "google" }],
      edm: [{ url_param: "utm_source", label: "klaviyo" }],
    };
    const seen = new Set();
    const templateRows = [...(extraRowsByChannel[channel] || []), ...mappingRows]
      .filter((m) => {
        if (seen.has(m.url_param)) return false;
        seen.add(m.url_param);
        return true;
      })
      .map((m) => `${m.url_param}={${urlParamLabels[m.url_param] || m.label}}`);
    const urlTemplate = templateRows.join("&\n&");
    const slotCode = `<!-- Social Link 个性化 Slot -->
<div data-sl-slot="hero"></div>
<div data-sl-slot="offer"></div>
<div data-sl-slot="products"></div>
<div data-sl-slot="trust"></div>
<div data-sl-slot="cta"></div>
<script src="https://cdn.sociallink.io/sdk.js"
  data-campaign="${campaign?.id || "{活动ID}"}"
  data-platform="{shopify|shopline|custom|headless_shopify}"></script>`;
    return `
      <section class="deployment-card" aria-label="部署指南">
        <div class="card-head"><h3>部署指南</h3></div>
        <div class="deploy-block">
          <h4>① 广告 URL 参数</h4>
          <p>请在 ${channelName} 的落地 URL 中添加以下参数：</p>
          <pre class="deploy-code">${escapeHtml(urlTemplate)}</pre>
          <button type="button" class="btn btn-copy" data-copy="${escapeHtml(urlTemplate)}"${readonly ? " disabled" : ""}>复制 URL 模板</button>
        </div>
        <div class="deploy-block">
          <h4>② 站点 Slot 坑位</h4>
          <p>在 Shopify、Shopline、自建独立站或 Headless 前端模板中插入以下代码片段：</p>
          <pre class="deploy-code">${escapeHtml(slotCode)}</pre>
          <button type="button" class="btn btn-copy" data-copy="${escapeHtml(slotCode)}"${readonly ? " disabled" : ""}>复制 Slot 代码</button>
        </div>
        <div class="deploy-block">
          <h4>③ 支持的站点架构</h4>
          <table class="signal-map-table">
            <thead><tr><th>站点类型</th><th>接入方式</th><th>平台参数</th></tr></thead>
            <tbody>
              <tr><td>Shopify</td><td>Theme App Extension / App Embed / 主题代码片段</td><td><code>shopify</code></td></tr>
              <tr><td>Shopline</td><td>插件能力 / 主题代码片段 / 自定义脚本</td><td><code>shopline</code></td></tr>
              <tr><td>自建独立站</td><td>JS SDK 或服务端 Decision API</td><td><code>custom</code></td></tr>
              <tr><td>Headless Shopify</td><td>前端组件接 SDK 或服务端 Decision API</td><td><code>headless_shopify</code></td></tr>
            </tbody>
          </table>
        </div>
        <div class="deploy-warning">⚠️ 未完成以上配置时，个性化页面无法生效。P0 仅提供配置指南，部署状态检查留到 P1。</div>
      </section>
    `;
  }

  function signalCollectionStatusHtml(entryContext, campaign) {
    const published = isCampaignPublished(campaign);
    if (!published) {
      return `
        <div class="signal-status-panel signal-status-config">
          <div class="signal-status-head"><b>信号采集状态</b><span class="signal-status-note">配置阶段</span></div>
          <p class="signal-pending-msg">活动发布后将自动采集进站信号。当前请在 ④ 按广告计划<strong>预设</strong> entry_match（与上表 URL 参数一致），不是从流量里发现。</p>
        </div>
      `;
    }
    if (!hasSignalSample(entryContext)) {
      return `
        <div class="signal-status-panel signal-status-pending">
          <div class="signal-status-head"><b>当前信号采集状态</b><span class="signal-status-note">已发布 · 暂无流量</span></div>
          <p class="signal-pending-msg">暂无进站数据，信号将在首次访问后采集。</p>
        </div>
      `;
    }
    const result = evaluateEntryDataCompleteness(entryContext);
    const icon = (ok, level) => ok ? "✓" : (level === "critical" ? "✗" : "△");
    const cls = (ok, level) => ok ? "ok" : (level === "critical" ? "bad" : "warn");
    const rows = result.checks.filter((c) => c.key !== "media_channel" && c.key !== "segment" && c.key !== "utm_source" && c.key !== "audience");
    const scoreCls = result.complete ? (result.warnMissing.length ? "partial" : "") : " bad";
    return `
      <div class="signal-status-panel">
        <div class="signal-status-head">
          <b>当前信号采集状态</b>
          <span class="signal-status-note">已发布 · 真实采集</span>
          <span class="data-check-score ${scoreCls}">${result.score}/${result.total} 项</span>
        </div>
        <ul class="signal-status-list">
          ${rows.map((c) => `<li class="${cls(c.ok, c.level)}">${icon(c.ok, c.level)} <span>${c.label}</span><code>${c.detail}</code></li>`).join("")}
        </ul>
      </div>
    `;
  }

  function adContextSignalsPanelHtml(entryContext, campaign) {
    const norm = normalizeEntryContext(entryContext, campaign || {});
    return signalMappingTableHtml(norm.media_channel) + signalCollectionStatusHtml(entryContext, campaign);
  }

  function adContextMappingOnlyPanelHtml(entryContext, campaign) {
    const norm = normalizeEntryContext(entryContext, campaign || {});
    return signalMappingTableHtml(norm.media_channel);
  }

  /**
   * 进站信号完整性（基于采集样例评估 AI 入队质量；非运营手填校验）
   * level: critical | warn | info
   */
  function evaluateEntryDataCompleteness(entryContext, options = {}) {
    if (!hasSignalSample(entryContext)) {
      const checks = [
        { key: "signal_pending", label: "进站信号", level: "warn", ok: false, detail: "待首次进站采集" },
      ];
      if (options.audience_id !== undefined) {
        const audId = String(options.audience_id || "").trim();
        checks.push({
          key: "audience",
          label: "Social Link 人群",
          level: "critical",
          ok: !!audId,
          detail: audId ? audienceLabel(audId).split(" · ")[0] : "未选择",
        });
      }
      const criticalMissing = checks.filter((c) => c.level === "critical" && !c.ok);
      const warnMissing = checks.filter((c) => c.level === "warn" && !c.ok);
      return {
        checks,
        criticalMissing,
        warnMissing,
        score: checks.filter((c) => c.ok).length,
        total: checks.length,
        complete: criticalMissing.length === 0,
        pending_collection: true,
      };
    }
    const ctx = resolvedSignalFields(entryContext);
    const media = String(ctx.media_channel || "").trim();
    const campaignOrFlow = String(ctx.campaign_id || ctx.flow_id || "").trim();
    const adset = String(ctx.adset_id || "").trim();
    const creative = String(ctx.creative_id || "").trim();
    const tags = String(ctx.creative_tags || "").trim();
    const skus = String(ctx.ad_skus || "").trim();
    const searchKw = String(ctx.search_keyword || "").trim();
    const segment = String(ctx.segment || "").trim();
    const utm = String(ctx.utm_source || "").trim();
    const isAdChannel = media === "meta" || media === "google";
    const isGoogle = media === "google";

    const checks = [
      { key: "media_channel", label: "入口渠道", level: "critical", ok: !!media, detail: media || "未识别" },
      { key: "campaign_flow", label: "广告 / Flow ID", level: isAdChannel ? "critical" : "warn", ok: !!campaignOrFlow, detail: campaignOrFlow || "未采集" },
      { key: "ad_skus", label: "广告 SKU", level: isAdChannel ? "critical" : "warn", ok: !!skus, detail: skus || "未解析" },
      { key: "creative", label: "素材 ID", level: "warn", ok: !!creative, detail: creative || "未回传" },
      { key: "creative_tags", label: "素材标签", level: "warn", ok: !!tags, detail: tags || "待 AI/人工补" },
      { key: "search_keyword", label: "搜索关键词", level: isGoogle ? "warn" : "info", ok: !isGoogle || !!searchKw, detail: isGoogle ? (searchKw || "未携带") : "不适用" },
      { key: "adset", label: "广告组 / Asset Group", level: "warn", ok: !!adset, detail: adset || "未配置" },
      { key: "segment", label: "Segment 口径", level: "warn", ok: !!segment, detail: segment || "未配置" },
      { key: "utm_source", label: "UTM 来源", level: "info", ok: !!utm, detail: utm || "未携带" },
    ];

    if (options.audience_id !== undefined) {
      const audId = String(options.audience_id || "").trim();
      checks.push({
        key: "audience",
        label: "Social Link 人群",
        level: "critical",
        ok: !!audId,
        detail: audId ? audienceLabel(audId).split(" · ")[0] : "未选择",
      });
    }

    const criticalMissing = checks.filter((c) => c.level === "critical" && !c.ok);
    const warnMissing = checks.filter((c) => c.level === "warn" && !c.ok);
    const score = checks.filter((c) => c.ok).length;
    return {
      checks,
      criticalMissing,
      warnMissing,
      score,
      total: checks.length,
      complete: criticalMissing.length === 0,
    };
  }

  /** 新建活动 / 首次进规则页：仅锁定渠道，尚无采集样例 */
  function defaultEntryCondition(campaign) {
    return {
      media_channel: mediaChannelFromSource(campaign?.source || "klaviyo"),
      signal_sample: null,
    };
  }

  function buildInitialRuleDraft(campaign) {
    const c = campaign || {};
    return {
      schema: "v3_matching_rule_v1",
      campaign_id: c.id,
      target_page: { page_type: c.pageType, page_path: c.pagePath, site: c.site },
      holdout: { ratio_pct: c.holdout ?? 10, stable_per_visitor: true, control_mode: "platform_native" },
      default_variant_id: "default_baseline",
      fallback_variant_id: "default_baseline",
      entry_context: defaultEntryCondition(c),
      recommendation_strategy: defaultRecommendationStrategy(c),
      matching_rules: [],
    };
  }

  function defaultRecommendationStrategy(campaign) {
    const adFirst = campaign.source === "meta" || campaign.source === "google";
    return {
      mode: "white_box",
      audience_relation: adFirst ? "ad_first" : "social_first",
      conflict_rule: "current_ad_intent_first",
      audience_output: "生成本次访客画像，作为商品推荐规则的输入",
      ad_sku_priority: adFirst ? "top_2" : "none",
      sku_pin_enabled: adFirst,
      sku_pin_source: adFirst ? "url_param:ad_skus" : "",
      rule_order: ["广告 SKU 置顶", "同广告 Collection 补齐", "命中人群偏好补齐", "店铺热销 / 有库存补齐"],
      product_source: adFirst ? "manual_collection" : "cart_items",
      fallback: "同品类热销 + 有库存优先",
      hero_count: 4,
      feed_mode: "infinite",
      feed_batch_size: 8,
      feed_pool_limit: 200,
      explanation_visible: true,
    };
  }

  function newMatchingRuleDefaults(campaign, existingRules) {
    const poolByScene = {
      abandoned_cart: ["aud_abandoned_cart"],
      browse_abandonment: ["aud_browse_party"],
      campaign_ad: campaign.source === "meta"
        ? ["aud_new_customer", "aud_meta_bf", "aud_returning_customer"]
        : ["aud_google_brake_click", "aud_google_pmax_shopping"],
      ad_product: campaign.source === "google"
        ? ["aud_google_pmax_shopping", "aud_google_brake_click"]
        : ["aud_meta_ad_sku", "aud_meta_bf"],
      localization: [],
    };
    const pool = poolByScene[campaign.scene] || SEED_AUDIENCES.filter((a) => a.source === campaign.source).map((a) => a.id);
    const used = new Set((existingRules || []).map((r) => r.audience_id));
    return { audience_id: pool.find((id) => !used.has(id)) || pool[0] || "" };
  }

  function matchingRuleCount(campaign) {
    return (normalizeRule(campaign?.rule)?.matching_rules || []).filter((x) => x.enabled !== false).length;
  }

  function normalizeRule(rule) {
    if (!rule) return null;
    const r = { ...rule, matching_rules: (rule.matching_rules || []).map((mr) => ({
      ...mr,
      ai_status: mr.ai_status || (mr.variant_id ? "ready" : "pending"),
    })) };
    r.recommendation_strategy = r.recommendation_strategy || defaultRecommendationStrategy({ source: r.entry_context?.media_channel === "google" ? "google" : r.entry_context?.media_channel === "meta" ? "meta" : "klaviyo", scene: "" });
    if (r.holdout) {
      r.holdout = {
        ratio_pct: r.holdout.ratio_pct ?? 10,
        stable_per_visitor: r.holdout.stable_per_visitor !== false,
        control_mode: r.holdout.control_mode || "platform_native",
      };
    }
    return r;
  }

  function getCampaign(id) {
    const c = getCampaigns().find((x) => x.id === id) || null;
    if (c?.rule) c.rule = normalizeRule(c.rule);
    return c;
  }

  function upsertCampaign(campaign) {
    const list = getCampaigns();
    const i = list.findIndex((c) => c.id === campaign.id);
    campaign.updatedAt = nowStr();
    if (i >= 0) list[i] = campaign;
    else list.unshift(campaign);
    saveCampaigns(list);
    return campaign;
  }

  function createCampaign({ name, source, scene, site, pageType, pagePath, holdout }) {
    const id = `camp_${Date.now()}`;
    const campaign = {
      id,
      name: name.trim(),
      source,
      scene,
      site: site.trim(),
      pageType,
      pagePath: pagePath.trim(),
      holdout: Number(holdout) || 10,
      status: "generating",
      startedAt: null,
      endedAt: null,
      updatedAt: nowStr(),
      priority: "P0",
      variants: [
        { id: "default_baseline", name: "店铺基线页", type: "control", isBlank: false, variant_publish_status: "published", modules: defaultBaselineModules() },
      ],
      rule: null,
    };
    upsertCampaign(campaign);
    return campaign;
  }

  function defaultWizardMatchingRules(campaign) {
    const ts = Date.now();
    const def = newMatchingRuleDefaults(campaign, []);
    return [{
      id: `mr_w_${ts}`,
      priority: 1,
      audience_id: def.audience_id,
      variant_id: "",
      ai_status: "pending",
      enabled: true,
    }];
  }

  function buildRuleFromWizardPayload(campaign, wizardRule) {
    const c = campaign || {};
    const holdoutPct = Number(wizardRule?.holdout_pct ?? c.holdout ?? 10);
    const matchingRules = (wizardRule?.matching_rules || []).map((mr, i) => {
      const out = {
        id: mr.id || `mr_${Date.now()}_${i}`,
        priority: i + 1,
        audience_id: mr.audience_id || "",
        variant_id: "",
        ai_status: "pending",
        enabled: mr.enabled !== false,
      };
      if (mr.entry_match && Object.keys(mr.entry_match).length) {
        out.entry_match = { ...mr.entry_match };
      }
      return out;
    });
    return {
      schema: "v3_matching_rule_v1",
      campaign_id: c.id,
      target_page: { page_type: c.pageType, page_path: c.pagePath, site: c.site },
      holdout: { ratio_pct: holdoutPct, stable_per_visitor: true, control_mode: "platform_native" },
      default_variant_id: "default_baseline",
      fallback_variant_id: "default_baseline",
      entry_context: wizardRule?.entry_context || defaultEntryCondition(c),
      recommendation_strategy: wizardRule?.recommendation_strategy || defaultRecommendationStrategy(c),
      matching_rules: matchingRules,
    };
  }

  function queueAllMatchingRulesForAi(campaignId) {
    const c = getCampaign(campaignId);
    if (!c?.rule?.matching_rules) return { count: 0, ruleIds: [] };
    const ruleIds = [];
    c.rule.matching_rules.forEach((mr) => {
      if (mr.enabled === false || !mr.audience_id) return;
      if (mr.ai_status === "queued") { ruleIds.push(mr.id); return; }
      if (mr.variant_id && mr.ai_status === "ready") return;
      const result = queueAiPageForRule(campaignId, mr.id);
      if (result) ruleIds.push(mr.id);
    });
    return { count: ruleIds.length, ruleIds };
  }

  /**
   * 向导一站式创建：活动 + 完整规则 + 可选自动入队 AI
   */
  function createCampaignWithWizard(payload) {
    const {
      name, source, scene, site, pageType, pagePath, holdout,
      rule: wizardRule,
      autoQueueAi = true,
    } = payload || {};
    const camp = createCampaign({ name, source, scene, site, pageType, pagePath, holdout });
    const rule = buildRuleFromWizardPayload(camp, wizardRule);
    saveRule(camp.id, rule);
    let queued = { count: 0, ruleIds: [] };
    if (autoQueueAi) {
      queued = queueAllMatchingRulesForAi(camp.id);
    }
    refreshCampaignLifecycleStatus(camp.id);
    return { campaign: getCampaign(camp.id), queuedCount: queued.count };
  }

  function updateCampaignMeta(campaignId, { name, source, scene, site, pageType, pagePath, holdout }) {
    const c = getCampaign(campaignId);
    if (!c) return null;
    if (name != null) c.name = String(name).trim();
    if (source != null) c.source = source;
    if (scene != null) c.scene = scene;
    if (site != null) c.site = String(site).trim();
    if (pageType != null) c.pageType = pageType;
    if (pagePath != null) c.pagePath = String(pagePath).trim();
    if (holdout != null) c.holdout = Number(holdout) || 0;
    upsertCampaign(c);
    return c;
  }

  /** 活动创建后概览内联编辑：仅名称、路径、Holdout 可改；来源/场景/站点等创建时锁定 */
  function updateCampaignBasicInfo(campaignId, { name, pagePath, holdout }) {
    const c = getCampaign(campaignId);
    if (!c) return null;
    if (!PRE_ACTIVE_STATUSES.includes(c.status) && c.status !== "active") return null;
    if (name != null) {
      const n = String(name).trim();
      if (!n) return null;
      c.name = n;
    }
    if (pagePath != null) c.pagePath = String(pagePath).trim();
    if (holdout != null) c.holdout = Number(holdout) || 0;
    upsertCampaign(c);
    return c;
  }

  function deleteCampaign(campaignId) {
    const list = getCampaigns().filter((c) => c.id !== campaignId);
    if (list.length === getCampaigns().length) return false;
    saveCampaigns(list);
    return true;
  }

  function getVariant(campaignId, variantId) {
    return getCampaign(campaignId)?.variants.find((v) => v.id === variantId) || null;
  }

  function saveVariantModules(campaignId, variantId, modules, opts = {}) {
    const c = getCampaign(campaignId);
    if (!c) return null;
    const v = c.variants.find((x) => x.id === variantId);
    if (!v) return null;
    v.modules = modules;
    if (opts.name) v.name = opts.name.trim();
    if (opts.isBlank !== undefined) v.isBlank = opts.isBlank;
    else v.isBlank = isModulesBlank(modules);
    if (v.aiGenerated && !isModulesBlank(modules)) v.aiEdited = true;
    if (!opts.keepPublishStatus && v.variant_publish_status === "published") {
      v.variant_publish_status = "draft";
      v.publishedAt = null;
    }
    if (v.variant_publish_status === undefined) v.variant_publish_status = "draft";
    upsertCampaign(c);
    return v;
  }

  /** V3-03「发布此个性化页」：保存模块并标记为已发布 */
  function publishVariant(campaignId, variantId, modules) {
    const c = getCampaign(campaignId);
    if (!c) return null;
    const v = c.variants.find((x) => x.id === variantId);
    if (!v) return null;
    v.modules = modules;
    v.isBlank = isModulesBlank(modules);
    if (v.aiGenerated && !v.isBlank) v.aiEdited = true;
    v.variant_publish_status = "published";
    v.publishedAt = nowStr();
    upsertCampaign(c);
    refreshCampaignLifecycleStatus(campaignId);
    return v;
  }

  function isVariantPublished(campaignId, variantId) {
    const v = getVariant(campaignId, variantId);
    return v?.variant_publish_status === "published";
  }

  /** 规则发布前：每条启用规则须 ai ready 且关联页已发布 */
  function rulesPublishBlockers(campaignId) {
    const c = getCampaign(campaignId);
    if (!c?.rule?.matching_rules?.length) return { ok: false, reason: "no_rules", items: [] };
    const rules = c.rule.matching_rules.filter((r) => r.enabled !== false);
    const queued = rules.filter((r) => r.ai_status === "queued");
    if (queued.length) return { ok: false, reason: "queued", items: queued };
    const notReady = rules.filter((r) => !r.variant_id || r.ai_status !== "ready");
    if (notReady.length) return { ok: false, reason: "not_ready", items: notReady };
    const notPublished = rules.filter((r) => !isVariantPublished(campaignId, r.variant_id));
    if (notPublished.length) return { ok: false, reason: "not_published", items: notPublished };
    return { ok: true, reason: null, items: [] };
  }

  function isModulesBlank(modules) {
    if (!modules) return true;
    return !Object.values(modules).some((mod) => Object.values(mod).some((val) => {
      if (Array.isArray(val)) return val.length > 0;
      if (val && typeof val === "object") return Object.keys(val).length > 0;
      return String(val || "").trim().length > 0;
    }));
  }

  function saveRule(campaignId, rule) {
    const c = getCampaign(campaignId);
    if (!c) return null;
    c.rule = rule;
    upsertCampaign(c);
    return c;
  }

  /**
   * 提交 AI 任务（入队，不即时生成页面）
   */
  /** ③⑤ 策略快照：用于判断已生成 AI 页是否与当前规则一致 */
  function contextStrategySnapshotKey(rule) {
    const r = normalizeRule(rule);
    if (!r) return "";
    return JSON.stringify({
      entry_context: normalizeEntryContext(r.entry_context, {}),
      recommendation_strategy: r.recommendation_strategy || {},
    });
  }

  function matchingRuleAiSnapshotKey(rule, matchingRule) {
    return JSON.stringify({
      ctx: contextStrategySnapshotKey(rule),
      entry_match: matchingRule?.entry_match || {},
    });
  }

  /** 已生成 AI 页与当前保存的 ③⑤ 不一致的规则行 */
  function readyRulesWithStaleAiContext(campaignId) {
    const c = getCampaign(campaignId);
    if (!c?.rule) return [];
    return (c.rule.matching_rules || []).filter((mr) => {
      if (mr.enabled === false) return false;
      if (mr.ai_status !== "ready" || !mr.variant_id) return false;
      if (!mr.ai_context_strategy_snapshot) return false;
      return mr.ai_context_strategy_snapshot !== matchingRuleAiSnapshotKey(c.rule, mr);
    });
  }

  function queueAiPageForRule(campaignId, ruleId) {
    const c = getCampaign(campaignId);
    if (!c?.rule) return null;
    const mr = c.rule.matching_rules.find((r) => r.id === ruleId);
    if (!mr?.audience_id) return null;
    if (mr.ai_status === "queued") return mr;
    if (mr.ai_status === "ready" && mr.variant_id) return mr;
    mr.ai_status = "queued";
    mr.ai_scheduled_at = "";
    mr.ai_queued_at = nowStr();
    if (PRE_ACTIVE_STATUSES.includes(c.status) || c.status === "paused") c.status = "generating";
    upsertCampaign(c);
    return mr;
  }

  function matchingRuleForVariant(campaignId, variantId) {
    const c = getCampaign(campaignId);
    return (c?.rule?.matching_rules || []).find((r) => r.variant_id === variantId) || null;
  }

  /** 覆盖重跑：清空已绑定页后重新入队（与 V3-02 规则行「重新提交任务」一致） */
  function regenerateAiPageForRule(campaignId, ruleId) {
    const c = getCampaign(campaignId);
    if (!c?.rule) return null;
    const mr = c.rule.matching_rules.find((r) => r.id === ruleId);
    if (!mr?.audience_id) return null;
    mr.variant_id = "";
    mr.ai_status = "pending";
    mr.ai_context_strategy_snapshot = "";
    upsertCampaign(c);
    return queueAiPageForRule(campaignId, ruleId);
  }

  function campaignRulesNavUrl(campaignId, { from, embed, openStrategy } = {}) {
    if (from === "detail" || embed) {
      let url = campaignDetailUrl(campaignId, "rules");
      if (openStrategy) url += "&open_strategy=1";
      return url;
    }
    return recommendationRuleConfigUrl(campaignId, from || "variant");
  }

  /** ③⑤ 策略级变更后：清空已绑定页并全部重新入队 */
  function requeueAllReadyRulesForStrategyChange(campaignId) {
    const c = getCampaign(campaignId);
    if (!c?.rule) return { requeued: 0 };
    let requeued = 0;
    (c.rule.matching_rules || []).forEach((mr) => {
      if (mr.enabled === false || !mr.audience_id) return;
      if (mr.ai_status === "ready" && mr.variant_id) {
        mr.variant_id = "";
        mr.ai_status = "queued";
        mr.ai_scheduled_at = "";
        mr.ai_queued_at = nowStr();
        mr.ai_context_strategy_snapshot = "";
        requeued += 1;
      }
    });
    if (requeued > 0 && (PRE_ACTIVE_STATUSES.includes(c.status) || c.status === "paused")) c.status = "generating";
    upsertCampaign(c);
    return { requeued };
  }

  /**
   * AI 任务生成完成（原型用「模拟生成完成」按钮调用）
   */
  function completeAiPageForRule(campaignId, ruleId) {
    const c = getCampaign(campaignId);
    if (!c?.rule) return null;
    const mr = c.rule.matching_rules.find((r) => r.id === ruleId);
    if (!mr) return null;

    if (mr.variant_id && mr.ai_status === "ready") {
      const existing = c.variants.find((v) => v.id === mr.variant_id);
      if (existing) return { variant: existing, rule: mr };
    }

    if (mr.ai_status !== "queued" && mr.ai_status !== "pending") {
      /* 原型演示：允许从 pending 直接完成 */
    }

    const variantId = uniqueAiVariantId(mr.id);
    const modules = aiModulesForAudience(c, mr.audience_id);
    const variant = {
      id: variantId,
      name: aiPageName(mr.audience_id),
      type: "treatment",
      isBlank: false,
      aiGenerated: true,
      aiAudienceId: mr.audience_id,
      aiGeneratedAt: nowStr(),
      variant_publish_status: "draft",
      publishedAt: null,
      modules,
    };
    c.variants.push(variant);
    mr.variant_id = variantId;
    mr.ai_status = "ready";
    mr.ai_context_strategy_snapshot = matchingRuleAiSnapshotKey(c.rule, mr);
    upsertCampaign(c);
    refreshCampaignLifecycleStatus(campaignId);
    return { variant, rule: mr };
  }

  /** 模拟整活动 AI 生成完成：完成所有 queued 规则 */
  function simulateOvernightBatch(campaignId) {
    const c = getCampaign(campaignId);
    if (!c?.rule?.matching_rules) return [];
    const results = c.rule.matching_rules
      .filter((mr) => mr.ai_status === "queued")
      .map((mr) => completeAiPageForRule(campaignId, mr.id))
      .filter(Boolean);
    refreshCampaignLifecycleStatus(campaignId);
    return results;
  }

  /** @deprecated 原型旧名，等同 completeAiPageForRule */
  function generateAiPageForRule(campaignId, ruleId) {
    return completeAiPageForRule(campaignId, ruleId);
  }

  function sceneLabel(scene) { return SCENE_OPTIONS.find((s) => s.value === scene)?.label || scene; }
  function sourceLabel(source) { return SOURCE_OPTIONS.find((s) => s.value === source)?.label || source; }

  function setCampaignStatus(campaignId, status) {
    const c = getCampaign(campaignId);
    if (!c) return null;
    c.status = status;
    if (status === "active") { if (!c.startedAt) c.startedAt = dateOnly(); c.endedAt = null; }
    if (status === "paused") { if (!c.startedAt) c.startedAt = dateOnly(); }
    if (status === "ended") { if (!c.startedAt) c.startedAt = dateOnly(); c.endedAt = dateOnly(); }
    upsertCampaign(c);
    return c;
  }

  function pauseCampaign(campaignId) {
    const c = getCampaign(campaignId);
    if (!c || c.status !== "active") return null;
    return setCampaignStatus(campaignId, "paused");
  }

  function resumeCampaign(campaignId) {
    const c = getCampaign(campaignId);
    if (!c || c.status !== "paused") return null;
    return setCampaignStatus(campaignId, "active");
  }

  /** 待上线 → 运行中（规则与页面均已就绪后由运营确认） */
  function launchCampaign(campaignId) {
    const c = getCampaign(campaignId);
    if (!c || c.status !== "pending_launch") return null;
    const block = rulesPublishBlockers(campaignId);
    if (!block.ok) return { ok: false, blockers: block };
    return { ok: true, campaign: setCampaignStatus(campaignId, "active") };
  }

  function duplicateCampaign(campaignId) {
    const src = getCampaign(campaignId);
    if (!src) return null;
    const ts = Date.now();
    const copy = JSON.parse(JSON.stringify(src));
    const idMap = {};
    copy.id = `camp_${ts}`;
    copy.name = `${src.name}（副本）`;
    copy.status = "pending_review";
    copy.startedAt = null;
    copy.endedAt = null;
    copy.demoTag = undefined;
    copy.customerPreset = undefined;
    copy.variants = src.variants.map((v) => {
      const newId = v.type === "control" ? "default_baseline" : `var_${ts}_${v.id}`;
      idMap[v.id] = newId;
      const pub = v.type === "control" ? "published" : "draft";
      return {
        ...v,
        id: newId,
        modules: JSON.parse(JSON.stringify(v.modules)),
        variant_publish_status: pub,
        publishedAt: pub === "published" ? v.publishedAt : null,
      };
    });
    if (copy.rule) {
      copy.rule = JSON.parse(JSON.stringify(copy.rule));
      ["default_variant_id", "fallback_variant_id"].forEach((k) => {
        if (copy.rule[k] && idMap[copy.rule[k]]) copy.rule[k] = idMap[copy.rule[k]];
      });
      (copy.rule.matching_rules || []).forEach((mr) => {
        mr.id = `mr_${ts}_${mr.priority || 0}`;
        if (mr.variant_id && idMap[mr.variant_id]) {
          mr.variant_id = idMap[mr.variant_id];
          mr.ai_status = "ready";
        } else {
          mr.variant_id = "";
          mr.ai_status = "pending";
        }
      });
    }
    upsertCampaign(copy);
    refreshCampaignLifecycleStatus(copy.id);
    return getCampaign(copy.id);
  }

  function resetDemoData() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_VERSION_KEY, SEED_VERSION);
  }

  function getCustomerPreset(key) {
    return CUSTOMER_PRESETS[key] || null;
  }

  function customerPresetForCampaign(campaignId) {
    const c = getCampaign(campaignId);
    if (!c?.customerPreset) return null;
    return getCustomerPreset(c.customerPreset);
  }

  function customerPresetRuleUrl(campaignId) {
    return `V3-02-分配规则编辑器-可点击原型.html?campaign_id=${campaignId}&from=list`;
  }

  function customerPresetVariantUrl(campaignId) {
    const c = getCampaign(campaignId);
    const treatment = c?.variants?.find((v) => v.type === "treatment");
    const vid = treatment?.id || "default_baseline";
    return `V3-03-Variant模块配置-可点击原型.html?campaign_id=${campaignId}&variant_id=${vid}&from=list`;
  }

  function customerPresetDemoLinksHtml(campaignId) {
    return `<a href="${customerPresetRuleUrl(campaignId)}">规则配置</a> · <a href="${customerPresetVariantUrl(campaignId)}">审阅页</a>`;
  }

  function customerPresetCompareRows() {
    const y = CUSTOMER_PRESETS.yangteng;
    const t = CUSTOMER_PRESETS.tuopu;
    return [
      { label: "调研客户 / 站点", yangteng: `${y.label} · ${y.brand}`, tuopu: `${t.label} · ${t.brand}` },
      { label: "主流量", yangteng: y.channel, tuopu: t.channel },
      { label: "落地页形态", yangteng: y.pageType, tuopu: t.pageType },
      { label: "商品匹配重心", yangteng: y.matchFocus, tuopu: t.matchFocus },
      { label: "精准度", yangteng: y.precision, tuopu: t.precision },
      { label: "运营诉求", yangteng: y.opsFocus, tuopu: t.opsFocus },
      { label: "白盒策略侧重", yangteng: y.whiteBoxHint, tuopu: t.whiteBoxHint },
      { label: "原型演示", yangteng: customerPresetDemoLinksHtml(y.campaignId), tuopu: customerPresetDemoLinksHtml(t.campaignId), html: true },
    ];
  }

  function customerPresetCompareTableHtml() {
    const rows = customerPresetCompareRows();
    const y = CUSTOMER_PRESETS.yangteng;
    const t = CUSTOMER_PRESETS.tuopu;
    return `
      <table class="preset-compare-table">
        <thead>
          <tr>
            <th>对照维度</th>
            <th><span class="preset-col yangteng">${y.label}</span></th>
            <th><span class="preset-col tuopu">${t.label}</span></th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((r) => `<tr><td>${r.label}</td><td>${r.html ? r.yangteng : r.yangteng}</td><td>${r.html ? r.tuopu : r.tuopu}</td></tr>`).join("")}
        </tbody>
      </table>
      <p class="preset-compare-common">${CUSTOMER_COMPARE_COMMON}</p>
    `;
  }

  function recommendationFieldLabels() {
    return {
      media: { edm: "EDM 邮件", meta: "Meta 广告", google: "Google 广告" },
      audience_relation: {
        ad_first: "广告上下文优先，Social Link 人群补充",
        intersection: "广告人群 ∩ Social Link 人群",
        union: "广告人群 ∪ Social Link 人群",
        social_first: "Social Link 人群优先，广告上下文补充",
      },
      conflict_rule: {
        current_ad_intent_first: "当前广告意图优先",
        high_value_audience_first: "高价值人群优先",
        recent_behavior_first: "最近站内行为优先",
      },
      ad_sku_priority: { top_2: "广告 SKU 前 2 位", top_4: "广告 SKU 前 4 位", none: "不固定置顶" },
      product_source: {
        manual_collection: "广告 / 专题 Collection",
        cart_items: "弃购购物车",
        recently_viewed: "最近浏览",
        shop_default_collection: "店铺默认集合",
      },
      feed_mode: { infinite: "无限推荐流", paged: "分页加载", fixed: "固定数量" },
    };
  }

  function recommendationSummaryPanelHtml({ entry_context, recommendation_strategy, campaign } = {}) {
    const L = recommendationFieldLabels();
    const ctx = resolvedSignalFields(entry_context);
    const st = recommendation_strategy || defaultRecommendationStrategy(campaign || {});
    const media = L.media[ctx.media_channel] || ctx.media_channel || "—";
    const ruleOrder = (st.rule_order || []).join(" → ") || "—";
    const skuPinText = st.sku_pin_enabled
      ? `开启 · 来源 ${st.sku_pin_source || "url_param:ad_skus"}`
      : "关闭";
    return `
      <b>⑤ 白盒推荐策略摘要</b>
      <dl>
        <dt>信号渠道</dt><dd>${media}${hasSignalSample(entry_context) ? ` · 样例 SKU：${ctx.ad_skus || "—"}${ctx.search_keyword ? ` · 搜索词 ${ctx.search_keyword}` : ""}` : " · 待首次进站采集"}</dd>
        <dt>人群合成</dt><dd>${L.audience_relation[st.audience_relation] || "—"}</dd>
        <dt>货盘 / 排序</dt><dd>${L.product_source[st.product_source] || "—"} · ${L.ad_sku_priority[st.ad_sku_priority] || "—"}</dd>
        <dt>运行时置顶</dt><dd>${skuPinText}</dd>
        <dt>规则栈</dt><dd>${ruleOrder}</dd>
        <dt>猜你喜欢</dt><dd>首屏 ${st.hero_count || 4} · ${L.feed_mode[st.feed_mode] || "—"}</dd>
      </dl>
    `;
  }

  function recommendationRuleConfigUrl(campaignId, from) {
    return `V3-02-分配规则编辑器-可点击原型.html?campaign_id=${campaignId}&from=${from || "variant"}&open_strategy=1#ad-context-signals`;
  }

  function recommendationBasisCardHtml(campaignId, ruleConfigHref) {
    const c = getCampaign(campaignId);
    if (!c?.rule) return "";
    const L = recommendationFieldLabels();
    const ctx = resolvedSignalFields(c.rule.entry_context);
    const st = c.rule.recommendation_strategy || {};
    const media = L.media[ctx.media_channel] || ctx.media_channel || "—";
    const ruleOrder = (st.rule_order || []).join(" → ") || "—";
    const href = ruleConfigHref || recommendationRuleConfigUrl(campaignId, "variant");
    const routeRules = (c.rule.matching_rules || [])
      .filter((mr) => mr.enabled !== false && mr.entry_match && Object.keys(mr.entry_match).length)
      .map((mr) => `${audienceLabel(mr.audience_id).split(" · ")[0]}：${formatEntryMatch(mr.entry_match)}`)
      .join("；");
    const signalSample = hasSignalSample(c.rule.entry_context)
      ? `${media} · ${ctx.campaign_id || ctx.flow_id || "—"} · 素材 ${ctx.creative_id || "—"}`
      : "待首次进站采集";
    const adProduct = hasSignalSample(c.rule.entry_context)
      ? `${ctx.ad_skus || "—"} · 标签 ${ctx.creative_tags || "—"}${ctx.search_keyword ? ` · 搜索词 ${ctx.search_keyword}` : ""}`
      : "—";
    const productBasis = `${L.product_source[st.product_source] || "—"} · 首屏 ${st.hero_count || 4} 件`;
    const runtimePin = st.sku_pin_enabled
      ? `开启 · ${L.ad_sku_priority[st.ad_sku_priority] || "—"} · ${st.sku_pin_source || "url_param:ad_skus"}`
      : "关闭 · 按 AI 初稿排序";
    return `
      <div class="recommendation-basis-card">
        <div class="basis-card-head">
          <b>推荐与路由依据</b>
          <span class="basis-badge">③ 信号 + ⑤ 规则</span>
        </div>
        <div class="basis-summary">
          <div class="basis-row">
            <span>生成依据</span>
            <b>${productBasis}</b>
          </div>
          <div class="basis-row">
            <span>路由命中</span>
            <b>${routeRules || "未限制进站信号 · 仅按人群匹配"}</b>
          </div>
          <div class="basis-row">
            <span>运行时增强</span>
            <b>${runtimePin}</b>
          </div>
        </div>
        <details class="basis-detail">
          <summary>查看采集样例与规则栈</summary>
          <dl>
            <dt>采集样例</dt><dd>${signalSample}</dd>
            <dt>广告商品</dt><dd>${adProduct}</dd>
            <dt>规则栈</dt><dd>${ruleOrder}</dd>
          </dl>
        </details>
        <a class="mini-btn basis-edit-link" href="${href}">调整规则配置 →</a>
      </div>
    `;
  }

  function customerPresetBannerHtml(campaignId) {
    const preset = customerPresetForCampaign(campaignId);
    if (!preset) return "";
    const peer = getCustomerPreset(preset.peerKey);
    if (!peer) return "";
    return `
      <div class="customer-preset-banner ${preset.key}">
        <b>${preset.label} 调研场景</b>
        <span>${preset.brand} · ${preset.channel} · ${preset.pageType} · ${preset.matchFocus}</span>
        <span class="customer-preset-peer">对照 <a href="${customerPresetVariantUrl(peer.campaignId)}">${peer.label}</a> 审阅（${peer.pageType}）→</span>
      </div>
    `;
  }

  function campaignDetailUrl(campaignId, tab, variantId, action) {
    let q = `?campaign_id=${encodeURIComponent(campaignId)}`;
    if (tab) q += `&tab=${encodeURIComponent(tab)}`;
    if (variantId) q += `&variant_id=${encodeURIComponent(variantId)}`;
    if (action) q += `&action=${encodeURIComponent(action)}`;
    return `V3-01-活动详情-可点击原型.html${q}`;
  }

  /** 列表操作列 · 主入口（暴露当前状态的下一步动作） */
  function campaignListPrimaryAction(campaign) {
    switch (campaign?.status) {
      case "generating":
        return { label: "查看配置", tab: "rules" };
      case "pending_review":
        return { label: "去审阅", tab: "variants" };
      case "pending_launch":
        return { label: "发布上线", tab: "overview" };
      default:
        return { label: "查看详情", tab: "overview" };
    }
  }

  function daysSinceDate(dateStr) {
    if (!dateStr) return 0;
    const d = new Date(String(dateStr).slice(0, 10));
    if (Number.isNaN(d.getTime())) return 0;
    const now = new Date();
    return Math.max(0, Math.floor((now - d) / 86400000));
  }

  function ruleVariantPublishState(campaign, rule) {
    if (!rule?.variant_id || rule.ai_status !== "ready") {
      return { icon: "⏳", label: "待生成", cls: "pending" };
    }
    const v = campaign.variants?.find((x) => x.id === rule.variant_id);
    if (!v) return { icon: "⏳", label: "待审阅", cls: "pending" };
    if (v.variant_publish_status === "published") return { icon: "✓", label: "已发布", cls: "ok" };
    return { icon: "⏳", label: "待审阅", cls: "pending" };
  }

  function signalSummaryForCampaign(campaign) {
    const ec = campaign?.rule?.entry_context;
    if (!ec) return "未配置规则";
    if (!isCampaignPublished(campaign)) {
      return hasSignalSample(ec) ? "配置阶段 · 已有样例" : "待首次进站采集";
    }
    if (!hasSignalSample(ec)) return "已上线 · 暂无进站流量";
    const result = evaluateEntryDataCompleteness(ec);
    const ch = mediaChannelLabel(normalizeEntryContext(ec, campaign).media_channel);
    return `${ch} ${result.score}/${result.total} 项已齐`;
  }

  function treatmentVariants(campaign) {
    return (campaign?.variants || []).filter((v) => v.type === "treatment");
  }

  function shortVariantLabel(v) {
    const name = String(v?.name || "个性化页").replace(/ · AI 页$/, "");
    const aud = SEED_AUDIENCES.find((a) => a.id === v?.aiAudienceId);
    if (aud) return aud.name;
    return name.length > 24 ? `${name.slice(0, 22)}…` : name;
  }

  /** 活动详情 · 状态指引数据 */
  function campaignStatusGuideData(campaign) {
    if (!campaign) return { icon: "?", message: "活动不存在", actions: [] };
    const c = campaign;
    const rules = enabledMatchingRules(c);
    const treatments = treatmentVariants(c);
    const draftVariants = treatments.filter((v) => v.variant_publish_status !== "published");
    const publishedCount = treatments.filter((v) => v.variant_publish_status === "published").length;
    const reportUrl = `V3-04-增量转化看板-可点击原型.html?campaign_id=${c.id}&from=detail`;

    if (c.status === "generating") {
      const queued = rules.filter((r) => r.ai_status === "queued").length;
      const pending = rules.filter((r) => r.ai_status === "pending").length;
      const n = queued || pending || rules.length;
      return {
        icon: "⏳",
        message: `AI 任务已入队（${n} 条），等待批处理。处理完毕后可审阅页面。`,
        actions: [
          { label: "查看规则进度", tab: "rules" },
          { label: "模拟生成完成", act: "simulate_batch", primary: true },
        ],
      };
    }
    if (c.status === "pending_review") {
      const n = draftVariants.length || treatments.length;
      const actions = draftVariants.length
        ? draftVariants.map((v) => ({
          label: `去审阅 ${shortVariantLabel(v)}`,
          tab: "variants",
          variant_id: v.id,
          primary: true,
        }))
        : [{ label: "去审阅个性化页面", tab: "variants", primary: true }];
      return {
        icon: "⏳",
        message: `AI 页面已生成，${n} 套待审阅`,
        actions,
      };
    }
    if (c.status === "pending_launch") {
      return {
        icon: "✓",
        message: "所有页面已就绪，确认后即可上线",
        actions: [
          { label: "发布上线", act: "launch", primary: true },
          { label: "检查规则配置", tab: "rules" },
        ],
      };
    }
    if (c.status === "active") {
      const days = daysSinceDate(c.startedAt);
      return {
        icon: "●",
        message: `活动运行中 · 已运行 ${days} 天`,
        actions: [{ label: "查看效果报表", href: reportUrl, primary: true }],
      };
    }
    if (c.status === "paused") {
      return {
        icon: "‖",
        message: "活动已暂停，访客将不再命中个性化分流",
        actions: [
          { label: "恢复运行", act: "resume", primary: true },
          { label: "查看效果报表", href: reportUrl },
        ],
      };
    }
    if (c.status === "ended") {
      return {
        icon: "—",
        message: `活动已结束 · ${c.startedAt || "—"} ~ ${c.endedAt || "—"}`,
        actions: [{ label: "查看效果报表", href: reportUrl, primary: true }],
      };
    }
    return { icon: "?", message: statusLabel(c.status), actions: [] };
  }

  function campaignRulesSummaryLines(campaign) {
    const rules = enabledMatchingRules(campaign);
    return rules.map((mr, i) => {
      const aud = SEED_AUDIENCES.find((a) => a.id === mr.audience_id);
      const audName = aud?.name || mr.audience_id || "未选人群";
      const match = mr.entry_match ? formatEntryMatch(mr.entry_match) : "不限";
      const matchShort = match.replace("素材标签 = ", "").replace("搜索关键词 = ", "");
      const pub = ruleVariantPublishState(campaign, mr);
      return {
        index: i + 1,
        line: `${audName}+${matchShort}`,
        pub,
        rule_id: mr.id,
        variant_id: mr.variant_id,
      };
    });
  }

  global.V3Store = {
    STORAGE_KEY,
    SCENE_OPTIONS,
    SOURCE_OPTIONS,
    SEED_AUDIENCES,
    SEED_AUDIENCE_CATEGORIES,
    CROWD_MANAGE_URL,
    CUSTOMER_PRESETS,
    CUSTOMER_COMPARE_COMMON,
    getCustomerPreset,
    customerPresetForCampaign,
    customerPresetRuleUrl,
    customerPresetVariantUrl,
    customerPresetCompareRows,
    customerPresetCompareTableHtml,
    customerPresetBannerHtml,
    campaignDetailUrl,
    campaignListPrimaryAction,
    campaignStatusGuideData,
    campaignRulesSummaryLines,
    ruleVariantPublishState,
    signalSummaryForCampaign,
    deploymentGuideHtml,
    treatmentVariants,
    shortVariantLabel,
    daysSinceDate,
    SIGNAL_CHANNEL_MAPPINGS,
    ENTRY_MATCH_FIELDS_BY_CHANNEL,
    ENTRY_MATCH_FIELDS,
    entryMatchFieldsForChannel,
    recommendationFieldLabels,
    recommendationSummaryPanelHtml,
    recommendationRuleConfigUrl,
    recommendationBasisCardHtml,
    mediaChannelFromSource,
    mediaChannelLabel,
    hasSignalSample,
    demoSignalSampleForChannel,
    buildInitialRuleDraft,
    isCampaignPublished,
    isCampaignLive,
    PRE_ACTIVE_STATUSES,
    refreshCampaignLifecycleStatus,
    canDeleteCampaign,
    canViewReport,
    pauseCampaign,
    resumeCampaign,
    launchCampaign,
    normalizeEntryContext,
    resolvedSignalFields,
    formatEntryMatch,
    signalMappingTableHtml,
    signalCollectionStatusHtml,
    adContextSignalsPanelHtml,
    adContextMappingOnlyPanelHtml,
    matchingRuleAiSnapshotKey,
    pageLayoutForCampaign,
    pageLayoutLabel,
    PRODUCT_POOL,
    blankModules,
    productItemsForSource,
    normalizeProductPositions,
    defaultBaselineModules,
    getCampaigns,
    getCampaign,
    upsertCampaign,
    createCampaign,
    createCampaignWithWizard,
    defaultWizardMatchingRules,
    buildRuleFromWizardPayload,
    queueAllMatchingRulesForAi,
    updateCampaignMeta,
    updateCampaignBasicInfo,
    deleteCampaign,
    getVariant,
    saveVariantModules,
    publishVariant,
    isVariantPublished,
    rulesPublishBlockers,
    variantPublishStatusLabel,
    defaultVariantPublishStatus,
    isModulesBlank,
    saveRule,
    getAudiences,
    getAudienceCategories,
    getAudiencesForCategory,
    audienceCategoryId,
    getAudience,
    audienceLabel,
    audienceTypeLabel,
    evaluateEntryDataCompleteness,
    matchingRuleCount,
    normalizeRule,
    defaultEntryCondition,
    defaultRecommendationStrategy,
    newMatchingRuleDefaults,
    contextStrategySnapshotKey,
    readyRulesWithStaleAiContext,
    queueAiPageForRule,
    matchingRuleForVariant,
    regenerateAiPageForRule,
    campaignRulesNavUrl,
    requeueAllReadyRulesForStrategyChange,
    completeAiPageForRule,
    simulateOvernightBatch,
    generateAiPageForRule,
    aiModulesForAudience,
    aiStatusLabel,
    sceneLabel,
    sourceLabel,
    resetDemoData,
    setCampaignStatus,
    duplicateCampaign,
    formatCampaignPeriod,
    statusLabel,
    dateOnly,
    nowStr,
  };
})(window);

