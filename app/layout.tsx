import './globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '命定城市 · 15题测出你的灵魂城市 | Fate City Quiz',
  description:
    '基于生活方式、价值观与旅行偏好，通过15道趣味选择题为你精准匹配最适合定居、旅居、Solo Trip和Exchange的全球城市。每次测试仅需0.88元，获得详细个性化城市画像。',
  keywords: ['命定城市', '城市测试', '旅行人格', '定居城市推荐', '旅居', 'solo trip', 'exchange', '趣味测试'],
  openGraph: {
    title: '命定城市 · 测出你的灵魂城市',
    description: '15道题，找到最适合你定居、旅居、独旅和交换的全球城市。',
    type: 'website',
    locale: 'zh_CN'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2c5d4e'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
