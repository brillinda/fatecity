import { NextResponse } from 'next/server';

/**
 * 创建支付订单
 * POST /api/payment
 *
 * 当前为开发模式（模拟支付）。
 * 正式上线时替换为微信支付/支付宝统一下单接口。
 *
 * 微信 JSAPI 支付需要的参数:
 * - appId
 * - timeStamp
 * - nonceStr
 * - package (prepay_id=xxx)
 * - signType
 * - paySign
 *
 * 支付宝电脑网站支付:
 * - 返回支付页面 URL
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentMethod } = body; // 'wechat' | 'alipay'

    // 模拟生成订单
    const orderId = `FATE${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const amount = 0.88; // 元

    console.log(`[支付] 新订单: ${orderId}, 方式: ${paymentMethod}, 金额: ¥${amount}`);

    // --- 开发模式：直接返回模拟支付参数 ---
    // 正式上线时，调用微信/支付宝 API 获取真实参数

    if (paymentMethod === 'wechat') {
      return NextResponse.json({
        success: true,
        mode: 'development',
        orderId,
        amount,
        // 微信支付参数（模拟）
        paymentParams: {
          appId: 'wx_mock_app_id',
          timeStamp: String(Math.floor(Date.now() / 1000)),
          nonceStr: Math.random().toString(36).slice(2),
          package: `prepay_id=mock_${orderId}`,
          signType: 'MD5',
          paySign: 'mock_sign'
        },
        // 正式环境需要:
        // - 调用微信统一下单接口获取 prepay_id
        // - 生成 JSAPI 签名
        // - 返回给前端调用 wx.chooseWXPay()
      });
    }

    if (paymentMethod === 'alipay') {
      return NextResponse.json({
        success: true,
        mode: 'development',
        orderId,
        amount,
        // 支付宝参数（模拟）
        paymentParams: {
          // 支付宝返回的是一个支付页面 URL
          payUrl: `https://openapi.alipay.com/gateway.do?mock_order=${orderId}`
        },
        // 正式环境需要:
        // - 调用 alipay.trade.page.pay 接口
        // - 返回支付页面 URL
        // - 前端跳转到该 URL
      });
    }

    return NextResponse.json(
      { success: false, message: '不支持的支付方式' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[支付] 创建订单失败:', error);
    return NextResponse.json(
      { success: false, message: '订单创建失败，请稍后重试' },
      { status: 500 }
    );
  }
}
