# Medora Shopify 店铺初始化与 Hydrogen 接入流程

## 1. 文档目的

本文档记录 Medora 测试商店从账号创建到 Hydrogen 前端成功读取 Shopify Page 的完整操作流程，用于后续拿到正式 Shopify 账号后重新配置。

记录日期：2026-07-21  
当前测试店铺：`medora-dev.myshopify.com`  
当前前端项目：`Medora Health/medora-shopify-headless`

## 2. 关键概念

| 名称 | 作用 |
|---|---|
| Shopify Dev Dashboard | 管理开发商店、应用和开发组织，不是实际店铺后台 |
| Shopify Admin | 管理具体店铺中的页面、菜单、市场、语言和内容 |
| Hydrogen | Shopify 的 React 前端框架，本地开发不依赖 Hydrogen 销售渠道 |
| Hydrogen 销售渠道 | 管理 Hydrogen storefront 和 Oxygen 部署，受店铺套餐限制 |
| Headless 销售渠道 | 创建 Storefront API 凭证，适合自建前端或套餐不支持 Hydrogen 时使用 |
| Storefront API | Hydrogen 读取 Pages、菜单、商品和 Metaobjects 的接口 |
| Translate & Adapt | Shopify 官方翻译应用，用于维护各内容资源的多语言版本 |

## 3. 创建账号和测试商店

### 3.1 创建 Shopify 开发者账号

1. 使用个人或公司邮箱注册 Shopify 开发者账号。
2. 登录 Shopify Dev Dashboard。
3. 在左侧进入“商店”。
4. 创建开发商店。

### 3.2 测试商店选项

本次实验使用以下选项：

- 测试套餐：`Basic`
- `Generate test data for store`：不勾选
- `Test a feature preview on this store`：不勾选

原因：Basic 已足够测试 Pages、Navigation、Storefront API 和 Metaobjects；不导入与 Medora 无关的虚拟商品和预览功能。

### 3.3 客户项目使用 Client transfer 商店

需要由公司先开发、验收后再转让给客户时，应在 Dev Dashboard 创建 `Client transfer` 类型商店，而不是普通 `Dev` 商店。

本次已经实测确认：Client transfer 商店在转让前可以安装 Hydrogen、创建 Hydrogen storefront、获得 Production/Preview Oxygen 环境，并通过 Shopify CLI 完成项目连接和环境变量拉取。

创建建议：

- 商店类型：`Client transfer`
- Country：客户公司实际经营或注册所在地
- Shopify Plus：只有客户已确认采购 Plus 时才勾选；Hydrogen 并不要求 Plus
- Store name：使用正式项目名称

该模式可以在转让前完成 Oxygen 预览部署和客户验收。客户接受转让后再绑定账单、选择正式套餐和正式域名。

## 4. 商店基础设置

### 4.1 商店时区

进入：

```text
设置 → 常规/商店详细信息 → 标准和格式 → 时区
```

建议选择：

```text
GMT+08:00 北京、上海或香港
```

如果后台显示 `GMT-4`，页面发布时间会比中国日期早一天显示，但不代表页面被隐藏。

### 4.2 市场配置

进入 Shopify Admin 的 `Markets`：

1. 保留 `United States` 市场。
2. 创建 `China` 市场。
3. 测试阶段可配置：
   - United States：USD
   - China：CNY

市场用于控制国家/地区、货币和销售规则，不等于语言。

### 4.3 语言配置

进入：

```text
设置 → 语言
```

配置：

- English：默认语言、已发布
- 简体中文：已发布

然后在 Markets 中确认相应市场允许使用对应语言。Medora 需要允许用户主动切换语言时，也可以让美国和中国市场都访问英文和简体中文。

注意：发布一种语言只代表商店允许使用该语言，不会自动为每个页面生成翻译。

## 5. 选择前端销售渠道

### 5.1 Client transfer/正式店优先路径：Hydrogen 销售渠道

Client transfer 商店已经实测支持 Hydrogen 和 Oxygen；普通 Dev 测试商店可能显示套餐不支持。操作步骤：

1. 进入 `设置 → 应用和销售渠道`。
2. 在 Shopify App Store 搜索 Shopify 官方 `Hydrogen`。
3. 安装 Hydrogen 销售渠道。
4. 创建 Hydrogen storefront，例如：`Medora Hydrogen`。
5. 本地项目使用 Shopify CLI 连接并拉取环境：

```powershell
npx shopify hydrogen login --shop <store>.myshopify.com
npx shopify hydrogen link --storefront "Medora Hydrogen"
npx shopify hydrogen env list
npx shopify hydrogen env pull --env production --force
```

本次连接后确认存在：

```text
Production (handle: production, branch: main)
Preview (handle: preview)
```

Hydrogen 销售渠道用于 Oxygen 部署、环境变量和部署历史管理。

### 5.2 套餐不支持时：Headless 销售渠道

本次开发商店虽然能够安装 Hydrogen 渠道外壳，但进入后显示“您的套餐不支持 Hydrogen 销售渠道”，因此改用 Headless。

操作步骤：

1. 进入 Shopify App Store。
2. 搜索 `Headless`。
3. 选择开发人员为 Shopify 的官方应用，中文名称可能显示为“无头”。
4. 安装 Headless 销售渠道。
5. 点击“创建在线店面”。
6. 创建 storefront，例如：`Medora Dev Headless` 或 `Medora Test Storefront`。

Headless 可以提供 Storefront API 凭证，但不提供 Oxygen 部署管理。

## 6. Storefront API 权限

进入 Headless storefront 的“Storefront API 权限”，点击编辑。

### 6.1 当前 MVP 保留权限

```text
unauthenticated_read_product_listings
unauthenticated_read_content
unauthenticated_read_metaobjects
```

用途：

- 读取商品、服务项目和产品系列
- 读取 Pages、菜单、博客等内容
- 读取医院、医生及其他结构化 Metaobjects

### 6.2 当前阶段关闭权限

```text
unauthenticated_read_product_inventory
unauthenticated_read_product_tags
unauthenticated_read_product_pickup_locations
unauthenticated_read_customers
unauthenticated_write_customers
unauthenticated_read_customer_tags
unauthenticated_read_checkouts
unauthenticated_write_checkouts
unauthenticated_read_selling_plans
unauthenticated_read_bulk_operations
unauthenticated_write_bulk_operations
unauthenticated_read_bundles
unauthenticated_read_shop_pay_installments_pricing
```

原因：当前 MVP 没有客户账户、库存、自提、订阅、购物车和结账功能。后续开发到对应功能时再按最小权限原则开放。

## 7. API 凭证与本地环境变量

Headless storefront 会提供：

- 公共 Storefront API Token
- 私有 Storefront API Token
- Storefront API 权限
- Storefront ID（部分页面可能不明显显示）

安全规则：

- 公共 Token 会用于客户端请求，但仍不建议在聊天或公开截图中展示。
- 私有 Token 不得发送、公开或写入 `PUBLIC_` 环境变量。
- `.env` 不得提交 Git。

当前项目环境变量文件：

```text
Medora Health/medora-shopify-headless/.env
```

配置格式：

```env
SESSION_SECRET="保留已有的长随机值"
PUBLIC_STORE_DOMAIN="your-store.myshopify.com"
PUBLIC_STOREFRONT_API_TOKEN="公共Storefront访问令牌"
PUBLIC_STOREFRONT_ID=""
```

说明：

- `PUBLIC_STORE_DOMAIN` 是店铺的 `.myshopify.com` 域名。
- 本次测试值为 `medora-dev.myshopify.com`。
- `PUBLIC_STOREFRONT_ID` 当前不是查询 Storefront API 的必填项，找不到时可以留空。
- 当前项目暂时不使用私有 Storefront Token。

## 8. API 连通性验证

配置 `.env` 后，应先进行最小只读查询，验证：

- Token 有效
- 域名正确
- API 版本可用
- 返回的 shop 名称与目标店铺一致

本次实验验证结果：

```text
Connected: true
Shop: medora-dev
Domain: https://medora-dev.myshopify.com
Storefront API version: 2026-04
```

验证时不得在命令输出中打印 Token。

## 9. 创建 Shopify Pages

进入：

```text
在线商店 → 页面
```

开发商店可能自动存在：

- `Contact`
- `Your Privacy Choices`

这两个页面可以保留。`Your Privacy Choices` 不等于 Medora 的正式 `privacy` 隐私政策页面。

### 9.1 创建 About 测试页面

1. 点击“添加页面”。
2. 标题：`About Medora`。
3. 填写英文测试正文。
4. 可见性：可见。
5. 模板：默认页面。
6. 编辑“搜索引擎列表”。
7. 将自动生成的 `about-medora` handle 改为批准的 `about`。
8. 保存。

最终 Shopify 地址：

```text
/pages/about
```

本次 Storefront API 验证已成功返回：

```text
handle: about
title: About Medora
bodySummary: 已返回后台正文摘要
```

### 9.2 WBS 要求的页面 handles

后续正式店铺应创建或确认以下英文 handles：

```text
care-coordination
about
contact
privacy
disclaimer
provider-standards
faq
medical-travel-guide
```

页面标题可以翻译，handle 使用批准的英文 slug，不为中文另建 `about-cn` 等页面。

## 10. 创建和维护菜单

进入：

```text
内容 → 菜单
```

新店通常已经存在：

- Main menu
- Footer menu
- Customer account main menu

不要重复创建 `Main menu`。本次实验在已有主菜单中添加：

```text
名称：About
链接：Pages → About Medora
```

本次 Storefront API 已成功读取：

```text
menu handle: main-menu
Home
Catalog
Contact
About → /pages/about
```

正式顶部菜单计划为：

```text
Home
Treatments
Medical Travel Guide
About
```

在 Treatments 和 Medical Travel Guide 页面准备完成前，暂时不要让测试菜单替换已经确认的前端导航。

## 11. 多语言内容与 Translate & Adapt

### 11.1 一次性配置与逐资源翻译

语言与市场只需要配置一次，但每个内容资源需要拥有自己的翻译记录：

```text
语言配置：一次性
市场配置：一次性
页面标题、正文、SEO：按资源翻译
```

如果页面没有简体中文翻译，Shopify 会向 `ZH_CN` 请求返回默认英文内容，因此切换 `/en/about` 和 `/zh-CN/about` 时可能看不到变化。

### 11.2 Translate & Adapt 操作

1. 安装 Shopify 官方 `Translate & Adapt`。
2. 选择本地化语言：简体中文。
3. 进入“页面”。
4. 选择 `About Medora`。
5. 填写或自动生成中文标题、正文、SEO 标题和 SEO 描述。
6. 人工审核。
7. 保存。

实验阶段不建议直接点击全局“自动翻译”，否则会同时翻译 Contact、隐私页面和主题默认文案。先选择具体页面进行测试。

医疗、服务边界、隐私和免责声明内容必须人工审核，机器翻译只能作为初稿。

## 12. Hydrogen 前端接入结果

当前项目已经实现：

- `/en/about` 使用 Storefront API 查询 `page(handle: "about")`
- `/zh-CN/about` 使用同一个 handle，并发送简体中文/中国市场上下文
- 英文上下文：`EN / US`
- 中文上下文：`ZH_CN / CN`
- Shopify 请求失败或页面不存在时保留前端占位兜底
- 页面元素包含 `data-content-source="shopify"`，便于自动验证数据来源

本地验证地址：

```text
http://localhost:3000/en/about
http://localhost:3000/zh-CN/about
```

已验证英文页面能够显示 Shopify 后台填写的标题和正文。

当前尚未接入：

- Shopify `main-menu` 到前端顶部导航
- 其他 WBS Pages 的动态正文
- Homepage Metaobject
- 医院和医生 Metaobjects
- 购物车、结账和客户账户

## 13. 内容更新行为

Shopify 后台修改已接入的 Page 后，Hydrogen 会在后续请求中重新读取内容。一般保存后刷新页面即可看到变化；生产环境可能因 Storefront API 或 Hydrogen 缓存产生短暂延迟。

正式上线前需要确定：

- Page 查询缓存策略
- 内容更新后的缓存失效方式
- 翻译审核和发布流程
- 生产环境变量管理方式

## 14. 正式账号复配检查表

### 账号与权限

- [ ] Client transfer 或正式店铺已创建
- [ ] 开发人员已获得必要员工/协作者权限
- [ ] 禁止通过聊天传递密码、Token 和私密凭证

### 店铺基础设置

- [ ] 时区设置为 GMT+08:00
- [ ] United States 市场配置完成
- [ ] China 市场配置完成
- [ ] English 已发布
- [ ] 简体中文已发布
- [ ] 两个市场的语言可用范围已确认

### 渠道与 API

- [ ] Client transfer 商店已优先尝试 Hydrogen/Oxygen
- [ ] Hydrogen storefront 已创建并通过 CLI link
- [ ] Production/Preview Oxygen 环境已确认
- [ ] 普通 Dev 商店受限或使用第三方部署时改用 Headless
- [ ] Storefront API 权限遵循最小权限原则
- [ ] 公共 Token 已写入本地/部署环境变量
- [ ] 私有 Token 未写入前端公共环境变量
- [ ] Storefront API 最小查询验证成功

### Pages 与菜单

- [ ] 所有 WBS 页面已按批准 handle 创建
- [ ] Existing Contact handle 已检查
- [ ] 隐私政策与 Your Privacy Choices 已区分
- [ ] Main menu handle 为 `main-menu`
- [ ] 正式顶部菜单项和顺序已确认
- [ ] Footer menu 已按正式范围配置

### 翻译与审核

- [ ] Translate & Adapt 已安装
- [ ] 每个 Page 的中文标题和正文已填写
- [ ] SEO 标题和描述已翻译
- [ ] 菜单标签已翻译
- [ ] 医疗、隐私和免责声明内容已人工审核

### 前端验证

- [ ] `/en/about` 返回英文 Shopify 内容
- [ ] `/zh-CN/about` 返回简体中文翻译
- [ ] 未知 locale、页面和项目仍返回 404
- [ ] Shopify 请求失败时兜底页面正常
- [ ] 桌面端和移动端无布局溢出

## 15. 正式实施建议顺序

```text
正式账号和权限
→ 市场、语言、时区
→ Hydrogen 或 Headless 渠道
→ 最小 Storefront API 权限
→ 环境变量和连通性验证
→ Pages 和菜单
→ Translate & Adapt 翻译审核
→ Hydrogen 页面接入
→ Metaobjects 数据模型
→ 完整测试与上线
```
