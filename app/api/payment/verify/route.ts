import { NextResponse } from 'next/server';

/**
 * 验证支付结果
 * POST /api/payment/verify
 *
 * 当前为开发模式（自动通过）。
 * 正式上线时需调用微信/支付宝的订单查询接口验证支付状态。
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, transactionId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: '缺少订单号' },
        { status: 400 }
      );
    }

    console.log(`[支付验证] 订单: ${orderId}, 交易号: ${transactionId || 'N/A'}`);

    // --- 开发模式：直接返回支付成功 ---
    // 正式上线时：
    // 微信: 调用 orderQuery 接口验证订单状态
    // 支付宝: 调用 alipay.trade.query 接口验证

    return NextResponse.json({
      success: true,
      mode: 'development',
      orderId,
      verified: true,
      message: '支付验证通过（开发模式）',
      // 正式环境返回:
      // verified: true/false,
      // amount: 实际支付金额,
      // payerInfo: { openid: '...' },
      // paidAt: '2024-01-01T00:00:00Z'
    });
  } catch (error) {
    console.error('[支付验证] 失败:', error);
    return NextResponse.json(
      { success: false, message: '支付验证失败，请稍后重试' },
      { status: 500 }
    );
  }
}
