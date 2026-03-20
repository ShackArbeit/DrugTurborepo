import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: '*.public.blob.vercel-storage.com' }],
  },
  output: 'standalone',
  // 新增 experimental 設定以限制 worker threads 和 CPU 使用量
  experimental: {
    workerThreads: false,
    cpus: 2, // 根據伺服器可用的 CPU 調整數值
  },
};
// Test Build 
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);