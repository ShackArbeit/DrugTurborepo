// app/request.ts
import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

const SUPPORTED_LOCALES = ['zh-TW', 'en', 'de'] as const;
type AppLocale = (typeof SUPPORTED_LOCALES)[number];

function pickSupportedLocale(input?: string): AppLocale {
  if (!input) return 'en';
  const lower = input.toLowerCase();
  // 常見猜測：先 zh -> zh-TW；再 de；其餘 en
  if (lower.startsWith('zh')) return 'zh-TW';
  if (lower.startsWith('de')) return 'de';
  return 'en';
}

export default getRequestConfig(async () => {
  const cookieJar = await cookies();
  const headerList = await headers();

  const cookieLocaleRaw = cookieJar.get('NEXT_LOCALE')?.value;
  const accept = headerList.get('accept-language') || '';

  // 先從 cookie，其次從 Accept-Language 猜測
  const guess = pickSupportedLocale(accept);
  const candidate = (cookieLocaleRaw || guess) as string;

  const locale: AppLocale = SUPPORTED_LOCALES.includes(candidate as AppLocale)
    ? (candidate as AppLocale)
    : 'en';

  // 讀不到對應訊息檔時，安全退回 en
  try {
    return {
      locale,
      messages: (await import(`../messages/${locale}.json`)).default
    };
  } catch {
    return {
      locale: 'en',
      messages: (await import(`../messages/en.json`)).default
    };
  }
});
