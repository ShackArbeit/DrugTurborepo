import {getRequestConfig} from 'next-intl/server';
import {cookies, headers} from 'next/headers';

export default getRequestConfig(async () => {
 
  const cookieJar = await cookies(); 
  const headerList = await headers();
  const cookieLocale = cookieJar.get('NEXT_LOCALE')?.value;

 
  const accept = headerList.get('accept-language') || '';
  const guess = accept.toLowerCase().startsWith('zh') ? 'zh-TW' : 'en';

  const locale = (cookieLocale || guess) as 'zh-TW' | 'en';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
