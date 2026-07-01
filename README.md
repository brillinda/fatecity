# 命定城市 · Fate City Quiz

15 道趣味选择题，测出你的命定城市。基于生活方式、价值观与旅行偏好，为用户精准匹配最适合**定居、旅居、Solo Trip 和 Exchange** 的全球城市。

每次测试 ¥1.23，包含详细的个性化城市画像分析。

---

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: CSS (清新简约风格，Paper 质感)
- **支付**: 模拟支付（预留微信/支付宝接口）

## 项目结构

```
app/
├── data/
│   ├── cities.ts          # 25+ 城市数据库（含气候、美食、房租、景观等）
│   └── questions.ts        # 15 道测试题 + 评分算法
├── utils/
│   └── matching.ts         # 城市匹配引擎（标签+类别双重匹配）
├── api/
│   └── payment/
│       ├── route.ts        # 创建支付订单 API
│       └── verify/
│           └── route.ts    # 支付验证 API
├── page.tsx                # 主页面（答题+支付+结果）
├── layout.tsx              # 根布局 + 元数据
└── globals.css             # 全局样式
```

## 开发

```bash
npm run dev     # 启动开发服务器 → http://localhost:3000
npm run build   # 生产构建
npm run start   # 启动生产服务器
```

## 支付对接

当前为**开发模拟模式**。正式上线时，修改以下文件对接真实支付：

1. `app/api/payment/route.ts` — 对接微信/支付宝统一下单
2. `app/api/payment/verify/route.ts` — 对接支付验证
3. `app/page.tsx` — `handlePayment` 函数替换为真实支付流程

### 微信支付 JSAPI 对接要点

- 需要微信商户号 + JSAPI 支付权限
- 后端调用统一下单获取 prepay_id
- 前端调用 `wx.chooseWXPay()` 发起支付

### 支付宝对接要点

- 需要支付宝商户账号
- 后端调用 `alipay.trade.page.pay`
- 返回支付页面 URL，前端跳转

## 商业化配置

- 价格修改：搜索 `1.23` 全局替换
- 城市数据：编辑 `app/data/cities.ts`
- 题目内容：编辑 `app/data/questions.ts`

## License

Private — All rights reserved.
