import { createIntl } from 'next-intl';

export async function getMessages(locale) {
  try {
    return (await import(`../../messages/${locale}/index.json`)).default;
  } catch (error) {
    console.error(`Could not load messages for locale: ${locale}`, error);
    return {};
  }
}

export async function getTranslator(locale) {
  const messages = await getMessages(locale);
  const intl = createIntl({ locale, messages });
  
  return {
    t: (key, values = {}) => {
      try {
        return intl.formatMessage({ id: key }, values);
      } catch (error) {
        console.error(`Translation key not found: ${key}`);
        return key.split('.').pop();
      }
    }
  };
}